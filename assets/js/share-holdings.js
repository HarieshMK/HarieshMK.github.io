/**
 * Share Holdings Engine v4.0
 * STYLE: Share Holding Dashboard
 * LOGIC: Supabase Persistence + FIFO + Google Sync + Corp Action Scanner
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM1ra94SDop0TSB9xgmH-Cy-_Ha-nCJE8IlcDEgWzyGG-jdMVZ_C8SqullEoYebqg6/exec"; 
let processedHoldings = []; 
let currentScanningSymbol = "";

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
        const mappedTrades = data.map(t => ({
            symbol: t.symbol,
            type: t.transaction_type,
            qty: t.quantity,
            price: t.price,
            date: t.transaction_date
        }));
        calculateFIFO(mappedTrades);
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) syncBtn.disabled = false;
    }
}

// --- 3. THE FIFO ENGINE ---
function calculateFIFO(trades) {
    const portfolio = {};
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    trades.forEach(trade => {
        const symbol = trade.symbol.toUpperCase();
        if (!portfolio[symbol]) portfolio[symbol] = [];
        
        if (trade.type.includes('BUY') || trade.type.includes('BONUS')) {
            const price = trade.type.includes('BONUS') ? 0 : trade.price;
            portfolio[symbol].push({ qty: trade.qty, price: price, date: trade.date });
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
        const earliestDate = lots.length > 0 ? lots[0].date : '2000-01-01';
        
        return {
            symbol,
            qty: totalQty,
            avg_price: totalQty > 0 ? totalCost / totalQty : 0,
            invested: totalCost,
            current_price: 0,
            first_purchase: earliestDate
        };
    }).filter(h => h.qty > 0);

    renderTable();
}

// --- 4. THE SCANNER & ALERTS ---
const scannedTickers = new Set(); // Add this at the top of your script
async function checkAndAlert(symbol, purchaseDate) {
    const cleanSymbol = symbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();
    
    // Check Supabase for verified records first
    const { data } = await supabase
        .from('corporate_actions')
        .select('*')
        .eq('ticker_symbol', cleanSymbol)
        .eq('status', 'verified');

    if (!data || data.length === 0) {
        // Run Google scanner if no verified record exists
        const url = `${GOOGLE_SCRIPT_URL}?action=scan&ticker=${symbol}&date=${purchaseDate}`;
       try {
        const res = await fetch(url);
        const result = await res.json();
        
        if (result.isDropDetected) {
            // FIX: Try both the prefixed ID and the clean ID
            const idWithPrefix = `name-${symbol.replace(':', '-')}`;
            const idClean = `name-${cleanSymbol}`;
            const cell = document.getElementById(idWithPrefix) || document.getElementById(idClean);
            
            if (cell && !cell.innerHTML.includes('⚠️')) {
                cell.innerHTML += ` <span title="Potential Split/Bonus detected" style="cursor:pointer; color:#f59e0b; margin-left:5px;" onclick="openCorpModal('${symbol}')">⚠️</span>`;
            }
        }
    } catch (e) { console.error("Scan error:", e); }
}
}

// --- 5. MODAL & SUBMISSION ---
function openCorpModal(symbol) {
    currentScanningSymbol = symbol;
    document.getElementById('modal-ticker').innerText = symbol;
    document.getElementById('corp-modal').style.display = 'flex';
}

function closeCorpModal() {
    document.getElementById('corp-modal').style.display = 'none';
}

async function submitForApproval() {
    const type = document.getElementById('action-type').value;
    const ratio = document.getElementById('action-ratio').value;
    const date = document.getElementById('action-date').value;

    if (!ratio || !date) { alert("Please fill all details"); return; }
    const cleanSymbol = currentScanningSymbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();

    const { error } = await supabase.from('corporate_actions').insert([{
        ticker_symbol: cleanSymbol,
        action_type: type,
        ratio_factor: ratio,
        record_date: date,
        status: 'pending'
    }]);

    if (!error) {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                ticker: cleanSymbol, type, ratio, date, isSubmission: true
            })
        });
        alert("Submitted for approval! 🚀");
        closeCorpModal();
    } else {
        alert("Error: " + error.message);
    }
}

// --- 6. SYNC & RENDERING ---
async function startSync() {
    showStatus("Syncing prices...");
    const btn = document.getElementById('sync-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Syncing...';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
        const sheetPrices = await res.json();
        const missing = [];

        processedHoldings.forEach(h => {
            const cleanHoldingsSymbol = h.symbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim().toUpperCase();
            const match = sheetPrices.find(p => {
                const tickerStr = String(p.ticker || "").toUpperCase().trim();
                const cleanSheetTicker = tickerStr.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();
                return tickerStr === h.symbol || cleanSheetTicker === cleanHoldingsSymbol;
            });

            if (match && match.price > 0) h.current_price = parseFloat(match.price);
            else missing.push(`NSE:${cleanHoldingsSymbol}`);
        });

        if (missing.length > 0) {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ tickers: [...new Set(missing)] })
            });
            showStatus("New tickers added. Wait 10s and Sync again.");
        }
        renderTable();
    } catch (e) { showStatus("Sync failed.", true); }
    finally { btn.innerHTML = originalHTML; }
}

function renderTable() {
    const body = document.getElementById('holdings-body');
    let totalInv = 0, totalCur = 0;
    if (!body) return;

    body.innerHTML = processedHoldings.map(h => {
        const curVal = h.qty * h.current_price;
        totalInv += h.invested; totalCur += curVal;
        const plPct = h.invested > 0 ? (((curVal - h.invested) / h.invested) * 100).toFixed(2) : 0;
        
        // Trigger Scanner
        checkAndAlert(h.symbol, h.first_purchase);

        return `<tr>
            <td id="name-${h.symbol.replace(':', '-')}"><b>${h.symbol}</b></td>
            <td>${h.qty}</td>
            <td>₹${h.avg_price.toFixed(2)}</td>
            <td>₹${h.invested.toLocaleString('en-IN')}</td>
            <td>₹${h.current_price.toFixed(2)}</td>
            <td>₹${curVal.toLocaleString('en-IN')}</td>
            <td style="color:${plPct>=0?'#10b981':'#ef4444'}">${plPct}%</td>
        </tr>`;
    }).join('');

    updateTotals(totalInv, totalCur);
}

function updateTotals(totalInv, totalCur) {
    if(document.getElementById('total-invested')) document.getElementById('total-invested').innerText = `₹${totalInv.toLocaleString('en-IN')}`;
    if(document.getElementById('current-value')) document.getElementById('current-value').innerText = `₹${totalCur.toLocaleString('en-IN')}`;
    const totalPL = totalCur - totalInv;
    const plEl = document.getElementById('total-pl');
    if (plEl) {
        plEl.innerText = `₹${totalPL.toLocaleString('en-IN')} (${totalInv > 0 ? ((totalPL/totalInv)*100).toFixed(2) : 0}%)`;
        plEl.style.color = totalPL >= 0 ? '#10b981' : '#ef4444';
    }
}

// --- 7. FILE HELPERS ---
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
                rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
            } else {
                rawRows = e.target.result.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));
            }

            const cleanData = findAndMapHeaders(rawRows);
            if (cleanData.length === 0) { showStatus("Headers not found.", true); return; }

            const entries = cleanData.map(d => ({
                user_id: userId,
                symbol: d.symbol.toUpperCase(),
                transaction_type: d.type,
                quantity: d.qty,
                price: d.price,
                transaction_date: d.date,
                source_hash: generateRowHash(d)
            }));

            const { error } = await supabase.from('equity_transactions').upsert(entries, { onConflict: 'source_hash', ignoreDuplicates: true });
            if (error) showStatus("Save Error: " + error.message, true);
            else await loadPortfolioFromDB(userId);
        } catch (err) { showStatus("System Error", true); }
    };
    if (isExcel) reader.readAsArrayBuffer(file); else reader.readAsText(file);
}

function findAndMapHeaders(rows) {
    let headerIndex = -1;
    const req = ['symbol', 'quantity', 'price'];
    for (let i = 0; i < rows.length; i++) {
        const rowValues = rows[i].map(v => String(v || "").toLowerCase());
        if (req.every(term => rowValues.some(col => col.includes(term)))) { headerIndex = i; break; }
    }
    if (headerIndex === -1) return [];
    const headers = rows[headerIndex].map(h => String(h || "").trim().toLowerCase());
    const sIdx = headers.findIndex(h => h.includes('symbol'));
    const qIdx = headers.findIndex(h => h.includes('quantity') || h.includes('qty'));
    const pIdx = headers.findIndex(h => h.includes('price'));
    const tIdx = headers.findIndex(h => h.includes('type'));
    const dIdx = headers.findIndex(h => h.includes('date') || h.includes('time'));

    return rows.slice(headerIndex + 1).filter(row => row[sIdx]).map(row => ({
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
        box.style.backgroundColor = isError ? '#fee2e2' : '#f0f9ff';
        box.style.color = isError ? '#991b1b' : '#075985';
        if (!isError) setTimeout(() => { box.style.display = 'none'; }, 4000);
    }
}
