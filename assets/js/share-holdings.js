/**
 * Share Holdings Engine v3.0
 * STYLE: Share Holding Dashboard
 * LOGIC: Supabase Persistence + FIFO + Google Sync
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; // Replace with your actual URL
let processedHoldings = []; 

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        showStatus("Please login to view your holdings.", true);
        return;
    }

    await loadPortfolioFromDB(session.user.id);

    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFileUpload(e.target.files[0], session.user.id);
    }
    
    if (syncBtn) syncBtn.onclick = () => startSync();
});

// --- 2. DATA PERSISTENCE ---
async function loadPortfolioFromDB(userId) {
    showStatus("Loading portfolio from vault...");
    const { data, error } = await supabase
        .from('equity_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: true });

    if (!error && data) {
        // Map database columns to match the FIFO engine expectations
        const mappedTrades = data.map(t => ({
            symbol: t.symbol,
            type: t.transaction_type,
            qty: t.quantity,
            price: t.price,
            date: t.transaction_date
        }));
        calculateFIFO(mappedTrades);
        // Inside loadPortfolioFromDB, after calculateFIFO(mappedTrades);
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) syncBtn.disabled = false; // Enable the button once data is ready
    }
}

async function handleFileUpload(file, userId) {
    if (!file) return;
    showStatus(`Reading ${file.name}...`);

    const reader = new FileReader();
    const isExcel = file.name.match(/\.(xlsx|xls)$/i);

    reader.onload = async (e) => {
        try {
            let rawRows = [];
            if (isExcel) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
            } else {
                const text = e.target.result;
                rawRows = text.split('\n').map(row => 
                    row.split(',').map(cell => cell.replace(/"/g, '').trim())
                );
            }

            const cleanData = findAndMapHeaders(rawRows);
            
            if (cleanData.length === 0) {
                showStatus("Format Error: Headers not found.", true);
                return;
            }

            const entries = cleanData.map(d => ({
                user_id: userId,
                symbol: d.symbol.toUpperCase(),
                transaction_type: d.type,
                quantity: d.qty,
                price: d.price,
                transaction_date: d.date,
                source_hash: generateRowHash(d)
            }));

            const { error } = await supabase
                .from('equity_transactions')
                .upsert(entries, { onConflict: 'source_hash', ignoreDuplicates: true });

            if (error) {
                showStatus("Error saving: " + error.message, true);
            } else {
                showStatus("Trades synchronized! Updating portfolio...");
                await loadPortfolioFromDB(userId);
            }
        } catch (err) {
            console.error(err);
            showStatus("System Error: Failed to process file.", true);
        }
    };

    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
}

// --- 3. THE FIFO ENGINE ---
function calculateFIFO(trades) {
    const portfolio = {};
    // Sort to ensure FIFO is accurate
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    trades.forEach(trade => {
        const symbol = trade.symbol.toUpperCase();
        if (!portfolio[symbol]) portfolio[symbol] = [];
        
        if (trade.type.includes('BUY') || trade.type.includes('BONUS')) {
            // Bonus issues are essentially a BUY with price 0
            const price = trade.type.includes('BONUS') ? 0 : trade.price;
            portfolio[symbol].push({ qty: trade.qty, price: price });
        } else if (trade.type.includes('SELL')) {
            let sellQty = trade.qty;
            while (sellQty > 0 && portfolio[symbol].length > 0) {
                let oldest = portfolio[symbol][0];
                if (oldest.qty <= sellQty) {
                    sellQty -= oldest.qty;
                    portfolio[symbol].shift();
                } else {
                    oldest.qty -= sellQty;
                    sellQty = 0;
                }
            }
        }
    });

    processedHoldings = Object.keys(portfolio).map(symbol => {
        const lots = portfolio[symbol];
        const totalQty = lots.reduce((s, l) => s + l.qty, 0);
        const totalCost = lots.reduce((s, l) => s + (l.qty * l.price), 0);
        return {
            symbol,
            qty: totalQty,
            avg_price: totalQty > 0 ? totalCost / totalQty : 0,
            invested: totalCost,
            current_price: totalQty > 0 ? totalCost / totalQty : 0 // Placeholder
        };
    }).filter(h => h.qty > 0);

    renderTable();
}

// --- 4. HELPERS & SYNC ---
function findAndMapHeaders(rows) {
    let headerIndex = -1;
    const req = ['symbol', 'quantity', 'price'];

    for (let i = 0; i < rows.length; i++) {
        const rowValues = rows[i].map(v => String(v || "").toLowerCase());
        if (req.every(term => rowValues.some(col => col.includes(term)))) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) return [];

    const headers = rows[headerIndex].map(h => String(h || "").trim().toLowerCase());
    const sIdx = headers.findIndex(h => h.includes('symbol'));
    const qIdx = headers.findIndex(h => h.includes('quantity') || h.includes('qty'));
    const pIdx = headers.findIndex(h => h.includes('price'));
    const tIdx = headers.findIndex(h => h.includes('type'));
    const dIdx = headers.findIndex(h => h.includes('date') || h.includes('time'));

    return rows.slice(headerIndex + 1)
        .filter(row => row[sIdx])
        .map(row => ({
            symbol: row[sIdx],
            type: (String(row[tIdx] || "BUY")).toUpperCase(),
            qty: Math.abs(parseFloat(row[qIdx])),
            price: parseFloat(row[pIdx]) || 0,
            date: row[dIdx] || new Date().toISOString().split('T')[0]
        }));
}

function generateRowHash(row) {
    const s = JSON.stringify(row);
    let h = 0;
    for(let i=0; i<s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return 'h' + Math.abs(h);
}

function showStatus(msg, isError = false) {
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        
        // Red for error, Blue-ish for info
        box.style.backgroundColor = isError ? '#fee2e2' : '#f0f9ff';
        box.style.border = isError ? '1px solid #ef4444' : '1px solid #0ea5e9';
        box.style.color = isError ? '#991b1b' : '#075985';

        // ONLY hide if it's NOT an error. If it's an error, keep it there so you can read it!
        if (!isError) {
            setTimeout(() => { box.style.display = 'none'; }, 4000);
        }
    }
}

async function startSync() {
    showStatus("Syncing with Google Market Engine...");
    const btn = document.getElementById('sync-btn');
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const sheetPrices = await res.json();
        const missing = [];

        processedHoldings.forEach(h => {
            const match = sheetPrices.find(p => 
                p.ticker && p.ticker.toUpperCase().includes(h.symbol.toUpperCase())
            );
            if (match) h.current_price = parseFloat(match.price);
            else missing.push(`NSE:${h.symbol.toUpperCase()}`);
        });

        if (missing.length > 0) {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', 
                body: JSON.stringify({ tickers: missing })
            });
            showStatus("Tickers added. Wait 10s and sync again.");
        } else {
            showStatus("Prices updated!");
        }
        renderTable();
    } catch (e) {
        showStatus("Sync failed.", true);
    } finally {
        btn.innerHTML = originalHTML;
    }
}

function renderTable() {
    const body = document.getElementById('holdings-body');
    let totalInv = 0, totalCur = 0;
    if (!body) return;

    body.innerHTML = processedHoldings.map(h => {
        const curVal = h.qty * h.current_price;
        totalInv += h.invested; totalCur += curVal;
        const plPct = h.invested > 0 ? (((curVal - h.invested) / h.invested) * 100).toFixed(2) : 0;
        return `<tr>
            <td><b>${h.symbol}</b></td>
            <td>${h.qty}</td>
            <td>₹${h.avg_price.toFixed(2)}</td>
            <td>₹${h.invested.toLocaleString('en-IN')}</td>
            <td>₹${h.current_price.toFixed(2)}</td>
            <td>₹${curVal.toLocaleString('en-IN')}</td>
            <td style="color:${plPct>=0?'#10b981':'#ef4444'}">${plPct}%</td>
        </tr>`;
    }).join('');

    if(document.getElementById('total-invested')) document.getElementById('total-invested').innerText = `₹${totalInv.toLocaleString('en-IN')}`;
    if(document.getElementById('current-value')) document.getElementById('current-value').innerText = `₹${totalCur.toLocaleString('en-IN')}`;
    
    const totalPL = totalCur - totalInv;
    const plEl = document.getElementById('total-pl');
    if (plEl) {
        plEl.innerText = `₹${totalPL.toLocaleString('en-IN')} (${totalInv > 0 ? ((totalPL/totalInv)*100).toFixed(2) : 0}%)`;
        plEl.style.color = totalPL >= 0 ? '#10b981' : '#ef4444';
    }
}
