/**
 * Share Holdings Engine v5.2 - "The Diagnostic Fix"
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM1ra94SDop0TSB9xgmH-Cy-_Ha-nCJE8IlcDEgWzyGG-jdMVZ_C8SqullEoYebqg6/exec"; 
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

// --- 3. THE FIFO ENGINE (Corrected) ---
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
            // We only process BUYs here. Bonus/Splits come from the CORP_ACTION logic below.
            if (type.includes('BUY')) {
                portfolio[symbol].push({ qty: event.qty, price: event.price, date: event.date });
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
    const actionType = (event.action_type || "").toUpperCase();
    const multiplier = parseFloat(event.ratio_factor) || 1;
    const targetSymbol = (event.new_ticker || "").toUpperCase();
    
    if (multiplier <= 0) return;

    // --- CASE A: BONUS & SPLIT ---
    if ((actionType === 'BONUS' || actionType === 'SPLIT') && portfolio[symbol].length > 0) {
        portfolio[symbol].forEach(lot => {
            lot.qty = lot.qty * multiplier;
            lot.price = lot.price / multiplier; 
        });
    }
    
    // --- CASE B: DEMERGER ---
    else if (actionType === 'DEMERGER' && portfolio[symbol].length > 0) {
        if (!targetSymbol) return;
        
        // Use the actual value from your new Supabase column
        const costToParentPct = parseFloat(event.cost_proportion_pct);
        
        if (isNaN(costToParentPct)) {
            console.warn(`Missing cost proportion for demerger of ${symbol}`);
            return; 
        }

        const parentFactor = costToParentPct / 100;
        const childFactor = 1 - parentFactor;

        if (!portfolio[targetSymbol]) portfolio[targetSymbol] = [];

        portfolio[symbol].forEach(lot => {
            const originalTotalCost = lot.qty * lot.price;

            // 1. Create Child (e.g., KWIL) - Keep original buy date
            portfolio[targetSymbol].push({
                qty: lot.qty * multiplier,
                price: (originalTotalCost * childFactor) / (lot.qty * multiplier),
                date: lot.date 
            });

            // 2. Update Parent (e.g., HUL) - Keep original buy date
            lot.price = (originalTotalCost * parentFactor) / lot.qty;
        });
    }

    // --- CASE C: MERGER ---
    else if (actionType === 'MERGER' && portfolio[symbol].length > 0) {
        if (!targetSymbol) return;
        if (!portfolio[targetSymbol]) portfolio[targetSymbol] = [];

        portfolio[symbol].forEach(lot => {
            portfolio[targetSymbol].push({
                qty: lot.qty * multiplier,
                price: (lot.qty * lot.price) / (lot.qty * multiplier),
                date: lot.date 
            });
        });
        portfolio[symbol] = []; // Parent ticker is removed
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

    renderTable();
}

// --- 4. MODAL LOGIC ---
function toggleModalFields() {
    const type = document.getElementById('action-type').value;
    const tickerContainer = document.getElementById('new-ticker-container');
    const costContainer = document.getElementById('cost-proportion-container');

    if (tickerContainer) {
        tickerContainer.style.display = (type === 'MERGER' || type === 'DEMERGER') ? 'block' : 'none';
    }
    
    if (costContainer) {
        costContainer.style.display = (type === 'DEMERGER') ? 'block' : 'none';
    }
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
    // 1. Get Raw Values
    const type = document.getElementById('action-type').value;
    const ratioStr = document.getElementById('action-ratio').value;
    const date = document.getElementById('action-date').value;
    const newTicker = (document.getElementById('new-ticker-input')?.value || "").toUpperCase().trim();
    const costPct = document.getElementById('cost-proportion-input')?.value;

    // 2. Define calculated variables FIRST
    const cleanSymbol = currentScanningSymbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();
    
    let numericRatio = 1;
    if (ratioStr.includes(':')) {
        const [partsA, partsB] = ratioStr.split(':').map(Number);
        numericRatio = (type === 'BONUS') ? (partsA + partsB) / partsB : partsA / partsB;
    } else {
        numericRatio = parseFloat(ratioStr);
    }

    // 3. Validation
    if (!ratioStr || !date) { alert("Please fill all details"); return; }
    if (type === 'DEMERGER' && !costPct) {
        alert("Please enter the Cost Proportion percentage for the Demerger.");
        return;
    }

    // 4. Single Supabase Insert (Now cleanSymbol is defined!)
    const { error } = await supabase.from('corporate_actions').insert([{
        ticker_symbol: cleanSymbol,
        action_type: type,
        ratio_factor: numericRatio,
        record_date: date,
        new_ticker: newTicker,
        cost_proportion_pct: costPct ? parseFloat(costPct) : 100,
        status: 'pending'
    }]);

    // 5. Handle Result
    if (!error) {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ 
                ticker: cleanSymbol, 
                type, 
                ratio: numericRatio, 
                originalRatio: ratioStr, 
                date, 
                isSubmission: true 
            })
        });
        alert(`Action submitted for ${cleanSymbol}!`);
        closeCorpModal();
    } else {
        alert("Submission failed: " + error.message);
    }
}


// --- 5. SYNC (Efficiency Improvement) ---
async function startSync() {
    const btn = document.getElementById('sync-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
        const sheetPrices = await res.json();
        
        // Efficiency: Create a Map for O(1) lookup instead of .find() inside a loop
        const priceMap = new Map();
        sheetPrices.forEach(p => {
            const cleanSheetTicker = String(p.ticker || "").toUpperCase().trim().replace(/^(NSE:|BOM:|BSE:)/i, '');
            priceMap.set(cleanSheetTicker, parseFloat(p.price));
        });

        const missing = [];
        processedHoldings.forEach(h => {
            const cleanSym = h.symbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim().toUpperCase();
            const price = priceMap.get(cleanSym);

            if (price && price > 0) {
                h.current_price = price;
            } else {
                missing.push(`NSE:${cleanSym}`);
            }
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
    } catch (e) { 
        console.error(e);
        showStatus("Price sync failed.", true); 
    }
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
     // If invested is 0 but we have current value, it's a 100% "Free" gain.
        let plPct = 0;
        if (h.invested > 0) {
            plPct = (((curVal - h.invested) / h.invested) * 100).toFixed(2);
        } else if (curVal > 0) {
            plPct = "100.00"; // Represents a pure profit holding
        }
        
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
