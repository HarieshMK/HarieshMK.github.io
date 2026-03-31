/**
 * Share Holdings Engine v5.2 - "The Diagnostic Fix"
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypgjj47mk5Xd4ddoGtUlTt-SkoYzWkI1JFsoDqnvXrI4HARQMmO6x1sEZ2SDcFNbNG0A/exec"; 
let processedHoldings = []; 
let currentScanningSymbol = "";

// --- 1. INITIALIZATION ---
// We use a small delay or explicit check to ensure session is caught
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing Portfolio Engine...");
    
    // Explicitly wait for the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        console.error("Auth Session missing:", error);
        showStatus("Please login to view your holdings.", true);
        return;
    }

    console.log("User authenticated:", session.user.id);
    await loadPortfolioFromDB(session.user.id);

    // Setup UI Listeners
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    if (dropZone && csvInput) {
        dropZone.onclick = () => {
            console.log("Browse clicked");
            csvInput.click();
        };
        csvInput.onchange = (e) => handleFileUpload(e.target.files[0], session.user.id);
    }
    
    if (syncBtn) {
        syncBtn.onclick = () => startSync();
        syncBtn.disabled = false; // Enable it once we know we're logged in
    }
});

// --- 2. DATA PERSISTENCE ---
async function loadPortfolioFromDB(userId) {
    showStatus("Fetching data...");
    try {
        const [tradesRes, corpRes] = await Promise.all([
            supabase.from('equity_transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: true }),
            supabase.from('corporate_actions').select('*').eq('status', 'verified')
        ]);

        if (tradesRes.error) throw tradesRes.error;
        
        console.log("Raw Trades fetched:", tradesRes.data.length);

        const mappedTrades = tradesRes.data.map(t => ({
            symbol: t.symbol,
            type: t.transaction_type || 'BUY',
            qty: parseFloat(t.quantity),
            price: parseFloat(t.price),
            date: t.transaction_date
        }));
        
        calculateFIFO(mappedTrades, corpRes.data || []);
        
    } catch (err) {
        console.error("Load Error:", err);
        showStatus("Error loading data: " + err.message, true);
    }
}

// --- 3. THE FIFO ENGINE ---
function calculateFIFO(trades, corporateActions = []) {
    const portfolio = {};

    let timeline = [
        ...trades.map(t => ({ ...t, eventType: 'TRADE', date: new Date(t.date) })),
        ...corporateActions.map(a => ({ ...a, eventType: 'CORP_ACTION', date: new Date(a.record_date) }))
    ];

    timeline.sort((a, b) => a.date - b.date);

    timeline.forEach(event => {
        const symbol = (event.symbol || event.ticker_symbol || "").toUpperCase();
        if (!symbol) return;
        if (!portfolio[symbol]) portfolio[symbol] = [];

        if (event.eventType === 'TRADE') {
            const type = (event.type || "").toUpperCase();
            if (type.includes('BUY') || type.includes('BONUS')) {
                const price = type.includes('BONUS') ? 0 : event.price;
                portfolio[symbol].push({ qty: event.qty, price: price, date: event.date });
            } 
            else if (type.includes('SELL')) {
                let sellQty = event.qty;
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
        } 
        else if (event.eventType === 'CORP_ACTION') {
            if (event.action_type === 'MERGER' && portfolio[symbol].length > 0) {
                const ratio = parseRatio(event.ratio_factor); 
                const targetSymbol = (event.new_ticker || "").toUpperCase();
                if (!targetSymbol) return;

                let totalOldCost = 0;
                let totalOldQty = 0;

                portfolio[symbol].forEach(lot => {
                    totalOldCost += (lot.qty * lot.price);
                    totalOldQty += lot.qty;
                });
                
                portfolio[symbol] = []; 
                const newQty = totalOldQty * ratio;
                if (!portfolio[targetSymbol]) portfolio[targetSymbol] = [];
                portfolio[targetSymbol].push({
                    qty: newQty,
                    price: totalOldCost / newQty,
                    date: event.date,
                    type: 'MERGER_IN'
                });
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
            current_price: 0
        };
    }).filter(h => h.qty > 0);

    console.log("Holdings processed:", processedHoldings.length);
    renderTable();
}

function parseRatio(ratioStr) {
    if (!ratioStr || !ratioStr.includes(':')) return parseFloat(ratioStr) || 1;
    const [newR, oldR] = ratioStr.split(':').map(Number);
    return newR / oldR || 1;
}

// --- 4. MODAL LOGIC ---
function toggleModalFields() {
    const type = document.getElementById('action-type').value;
    const container = document.getElementById('new-ticker-container');
    if(container) container.style.display = (type === 'MERGER' || type === 'DEMERGER') ? 'block' : 'none';
}

function openCorpModal(symbol) {
    currentScanningSymbol = symbol;
    document.getElementById('modal-ticker').innerText = symbol;
    document.getElementById('corp-modal').style.display = 'flex';
}

function closeCorpModal() {
    document.getElementById('corp-modal').style.display = 'none';
}

async function submitForApproval() {
    const fields = {
        type: document.getElementById('action-type').value,
        ratio: document.getElementById('action-ratio').value,
        date: document.getElementById('action-date').value,
        newTicker: document.getElementById('new-ticker-input')?.value || ""
    };

    if (!fields.ratio || !fields.date) { alert("Please fill all details"); return; }
    
    const cleanSymbol = currentScanningSymbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();

    const { error } = await supabase.from('corporate_actions').insert([{
        ticker_symbol: cleanSymbol,
        action_type: fields.type,
        ratio_factor: fields.ratio,
        record_date: fields.date,
        new_ticker: fields.newTicker,
        status: 'pending'
    }]);

    if (!error) {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ ticker: cleanSymbol, ...fields, isSubmission: true })
        });
        alert("Action submitted! 🚀");
        closeCorpModal();
    } else {
        alert("Submission failed: " + error.message);
    }
}

// --- 5. SYNC & RENDERING ---
async function startSync() {
    const btn = document.getElementById('sync-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
        const sheetPrices = await res.json();
        const missing = [];

        processedHoldings.forEach(h => {
            const cleanSym = h.symbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim().toUpperCase();
            const match = sheetPrices.find(p => {
                const sheetTicker = String(p.ticker || "").toUpperCase().trim().replace(/^(NSE:|BOM:|BSE:)/i, '');
                return sheetTicker === cleanSym;
            });

            if (match && match.price > 0) h.current_price = parseFloat(match.price);
            else missing.push(`NSE:${cleanSym}`);
        });

        if (missing.length > 0) {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ tickers: [...new Set(missing)] })
            });
            showStatus("New stocks added to tracker. Refresh in 10s.");
        }
        renderTable();
    } catch (e) { showStatus("Price sync failed.", true); }
    finally { btn.innerHTML = originalHTML; }
}

function renderTable() {
    const body = document.getElementById('holdings-body');
    if (!body) return;
    
    if (processedHoldings.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No active holdings found.</td></tr>';
        return;
    }

    let totals = { inv: 0, cur: 0 };

    body.innerHTML = processedHoldings.map(h => {
        const curVal = h.qty * h.current_price;
        totals.inv += h.invested; 
        totals.cur += curVal;
        const plPct = h.invested > 0 ? (((curVal - h.invested) / h.invested) * 100).toFixed(2) : 0;
        
        return `<tr>
            <td><b>${h.symbol}</b></td>
            <td>${h.qty}</td>
            <td>₹${h.avg_price.toFixed(2)}</td>
            <td>₹${h.invested.toLocaleString('en-IN')}</td>
            <td>₹${h.current_price.toFixed(2)}</td>
            <td>₹${curVal.toLocaleString('en-IN')}</td>
            <td style="color:${plPct >= 0 ? '#10b981' : '#ef4444'}">${plPct}%</td>
            <td style="text-align:center;">
                <button onclick="openCorpModal('${h.symbol}')" style="background:none; border:none; color:#0ea5e9; cursor:pointer; font-size:1.2rem;">
                    <i class="fas fa-plus-circle"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    updateTotals(totals.inv, totals.cur);
}

function updateTotals(totalInv, totalCur) {
    const invEl = document.getElementById('total-invested');
    const curEl = document.getElementById('current-value');
    const plEl = document.getElementById('total-pl');

    if(invEl) invEl.innerText = `₹${totalInv.toLocaleString('en-IN')}`;
    if(curEl) curEl.innerText = `₹${totalCur.toLocaleString('en-IN')}`;
    
    if (plEl) {
        const totalPL = totalCur - totalInv;
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
