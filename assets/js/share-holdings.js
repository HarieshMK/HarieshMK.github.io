/**
 * Share Holdings Engine v5.1 (Fixed Alignment & IDs)
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

    const elements = {
        dropZone: document.getElementById('drop-zone'),
        csvInput: document.getElementById('csv-input'),
        syncBtn: document.getElementById('sync-btn')
    };

    if (elements.dropZone && elements.csvInput) {
        elements.dropZone.onclick = () => elements.csvInput.click();
        elements.csvInput.onchange = (e) => handleFileUpload(e.target.files[0], session.user.id);
    }
    
    if (elements.syncBtn) elements.syncBtn.onclick = () => startSync();
});

// --- 2. DATA PERSISTENCE ---
async function loadPortfolioFromDB(userId) {
    showStatus("Loading portfolio...");
    try {
        const [tradesRes, corpRes] = await Promise.all([
            supabase.from('equity_transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: true }),
            supabase.from('corporate_actions').select('*').eq('status', 'verified')
        ]);

        if (tradesRes.error) throw tradesRes.error;

        const mappedTrades = tradesRes.data.map(t => ({
            symbol: t.symbol,
            type: t.transaction_type,
            qty: t.quantity,
            price: t.price,
            date: t.transaction_date
        }));
        
        calculateFIFO(mappedTrades, corpRes.data || []);
        
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) syncBtn.disabled = false;
    } catch (err) {
        showStatus("Error loading data: " + err.message, true);
    }
}

// --- 3. THE FIFO ENGINE ---
function calculateFIFO(trades, corporateActions = []) {
    const portfolio = {};
    let timeline = [
        ...trades.map(t => ({ ...t, eventType: 'TRADE', date: new Date(t.date || t.transaction_date) })),
        ...corporateActions.map(a => ({ ...a, eventType: 'CORP_ACTION', date: new Date(a.record_date) }))
    ];

    timeline.sort((a, b) => a.date - b.date);

    timeline.forEach(event => {
        const symbol = (event.symbol || event.ticker_symbol).toUpperCase();
        if (!portfolio[symbol]) portfolio[symbol] = [];

        if (event.eventType === 'TRADE') {
            const type = event.type.toUpperCase();
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
                const targetSymbol = event.new_ticker.toUpperCase();
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

    renderTable();
}

function parseRatio(ratioStr) {
    if (!ratioStr.includes(':')) return parseFloat(ratioStr);
    const [newR, oldR] = ratioStr.split(':').map(Number);
    return newR / oldR;
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
        new_ticker: fields.newTicker, // Fixed column name mapping
        status: 'pending'
    }]);

    if (!error) {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ ticker: cleanSymbol, ...fields, isSubmission: true })
        });
        alert("Action submitted! Once verified by UMC, it will reflect. 🚀");
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
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ tickers: [...new Set(missing)] })
            });
            showStatus("New stocks added to tracker. Wait 10s and Sync again.");
        }
        renderTable();
    } catch (e) { showStatus("Price sync failed.", true); }
    finally { btn.innerHTML = originalHTML; }
}

function renderTable() {
    const body = document.getElementById('holdings-body');
    if (!body) return;
    
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
                <button onclick="openCorpModal('${h.symbol}')" class="action-btn" title="Log Corporate Action">
                    <i class="fas fa-plus-circle"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    updateTotals(totals.inv, totals.cur);
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

// --- 7. HELPERS ---
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
