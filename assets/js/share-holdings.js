/**
 * Share Holdings Engine v5.2 - "The Diagnostic Fix"
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM1ra94SDop0TSB9xgmH-Cy-_Ha-nCJE8IlcDEgWzyGG-jdMVZ_C8SqullEoYebqg6/exec"; 
let processedHoldings = []; 
let currentScanningSymbol = "";
let sortColumn = 'symbol';
let sortDirection = 'asc';

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing Portfolio Engine...");
    
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        showStatus("Please login to view your holdings.", true);
        return;
    }

    // 1. Load data from DB (Awaiting this ensures processedHoldings is populated)
    await loadPortfolioFromDB(session.user.id);

    // 2. Load cached prices
    const cachedPrices = localStorage.getItem('portfolio_prices');
    if (cachedPrices) {
        applyPrices(JSON.parse(cachedPrices));
    }

    // 3. Background Sync
    startSync(); 

    // --- SETUP LISTENERS ---
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('manual-sync-trigger'); // Updated ID to match your trigger

    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFileUpload(e.target.files[0], session.user.id);
    }
    
    if (syncBtn) {
        syncBtn.onclick = () => startSync();
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
            lot.qty = Math.floor(lot.qty * multiplier); // Round down to whole shares
            lot.price = lot.price / multiplier; 
        });
    }
    
    // --- CASE B: DEMERGER ---
    else if (actionType === 'DEMERGER' && portfolio[symbol].length > 0) {
        if (!targetSymbol) return;
        
        const costToParentPct = parseFloat(event.cost_proportion_pct);
        if (isNaN(costToParentPct)) return; 

        const parentFactor = costToParentPct / 100;
        const childFactor = 1 - parentFactor;

        if (!portfolio[targetSymbol]) portfolio[targetSymbol] = [];

        portfolio[symbol].forEach(lot => {
            const originalTotalCost = lot.qty * lot.price;
            const newChildQty = Math.floor(lot.qty * multiplier); // Round down to whole shares

            if (newChildQty > 0) {
                portfolio[targetSymbol].push({
                    qty: newChildQty,
                    price: (originalTotalCost * childFactor) / (lot.qty * multiplier), // Price based on theoretical full entitlement
                    date: lot.date 
                });
            }

            lot.price = (originalTotalCost * parentFactor) / lot.qty;
        });
    }

 // --- CASE C: MERGER ---
    else if (actionType === 'MERGER' && portfolio[symbol].length > 0) {
        if (!targetSymbol) return;
        if (!portfolio[targetSymbol]) portfolio[targetSymbol] = [];

        portfolio[symbol].forEach(lot => {
            const newQty = Math.floor(lot.qty * multiplier);
            if (newQty > 0) {
                portfolio[targetSymbol].push({
                    qty: newQty,
                    price: (lot.qty * lot.price) / (lot.qty * multiplier),
                    date: lot.date 
                });
            }
        });
        portfolio[symbol] = []; 
        }
    }
    }); 

    // Now map the results to the global variable
    processedHoldings = Object.keys(portfolio).map(symbol => {
        const lots = portfolio[symbol];
        const totalQty = lots.reduce((s, l) => s + l.qty, 0);
        const totalCost = lots.reduce((s, l) => s + (l.qty * l.price), 0);
        return {
            symbol,
            qty: totalQty,
            avg_price: totalQty > 0 ? totalCost / totalQty : 0,
            invested: totalCost,
            current_price: 0 // Will be updated by startSync()
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

// --- Updated open/close to handle background blur ---
function openCorpModal(symbol) {
    currentScanningSymbol = symbol;
    document.getElementById('modal-ticker').innerText = symbol;
    document.getElementById('corp-modal').style.display = 'flex';
    
    // This blurs the specific portfolio container behind the modal
    document.querySelector('.portfolio-container').style.filter = 'blur(5px)';
}

function closeCorpModal() {
    document.getElementById('corp-modal').style.display = 'none';
    
    // This removes the blur
    document.querySelector('.portfolio-container').style.filter = 'none';
}

// --- Updated submitForApproval (Replaced alerts) ---
async function submitForApproval() {
    const type = document.getElementById('action-type').value;
    const ratioStr = document.getElementById('action-ratio').value;
    const date = document.getElementById('action-date').value;
    const newTicker = (document.getElementById('new-ticker-input')?.value || "").toUpperCase().trim();
    const costPct = document.getElementById('cost-proportion-input')?.value;

    const cleanSymbol = currentScanningSymbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim();
    
    let numericRatio = 1;
    if (ratioStr.includes(':')) {
        const [partsA, partsB] = ratioStr.split(':').map(Number);
        numericRatio = (type === 'BONUS') ? (partsA + partsB) / partsB : partsA / partsB;
    } else {
        numericRatio = parseFloat(ratioStr);
    }

    // REPLACED ALERTS HERE
    if (!ratioStr || !date) { 
        showStatus("Please fill all details", true); 
        return; 
    }
    if (type === 'DEMERGER' && !costPct) {
        showStatus("Please enter the Cost Proportion percentage.", true);
        return;
    }

    const { error } = await supabase.from('corporate_actions').insert([{
        ticker_symbol: cleanSymbol,
        action_type: type,
        ratio_factor: numericRatio,
        record_date: date,
        new_ticker: newTicker,
        cost_proportion_pct: costPct ? parseFloat(costPct) : 100,
        status: 'pending'
    }]);

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
        
        // REPLACED ALERT HERE
        showStatus(`Action submitted for ${cleanSymbol}!`);
        closeCorpModal();
    } else {
        // REPLACED ALERT HERE
        showStatus("Submission failed: " + error.message, true);
    }
}


// --- 5. SYNC (Efficiency Improvement) ---
async function startSync() {
    const refreshIcon = document.getElementById('manual-sync-trigger');
    const liveLabel = document.getElementById('sync-status-label');
    
    // Start Animation
    if (refreshIcon) refreshIcon.classList.add('spinning');

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
        const sheetPrices = await res.json();
        
        // Save to local storage for next visit
        localStorage.setItem('portfolio_prices', JSON.stringify(sheetPrices));
        
        // Apply prices to the global processedHoldings array
        applyPrices(sheetPrices);

        if (liveLabel) liveLabel.style.display = 'inline';
    } catch (e) { 
        console.error("Price sync failed:", e);
    } finally {
        // Stop Animation
        if (refreshIcon) refreshIcon.classList.remove('spinning');
    }
}

// Helper to map prices to holdings
function applyPrices(priceData) {
    const priceMap = new Map();
    priceData.forEach(p => {
        const cleanTicker = String(p.ticker || "").toUpperCase().trim().replace(/^(NSE:|BOM:|BSE:)/i, '');
        priceMap.set(cleanTicker, parseFloat(p.price));
    });

    processedHoldings.forEach(h => {
        const cleanSym = h.symbol.replace(/^(NSE:|BOM:|BSE:)/i, '').trim().toUpperCase();
        const price = priceMap.get(cleanSym);
        if (price) h.current_price = price;
    });

    renderTable();
}

// Bridge function for the onclick="triggerSync()" in your HTML
function triggerSync() {
    startSync();
}

function renderTable() {
    const body = document.getElementById('holdings-body');
    if (!body) return;
    
    if (processedHoldings.length === 0) {
        body.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px;">No active holdings found.</td></tr>';
        return;
    }

    // 1. Prepare data with P&L values for sorting
    processedHoldings.forEach(h => {
        h.current_value = h.qty * h.current_price;
        h.pl_value = h.current_value - h.invested;
        h.pl_pct = h.invested > 0 ? (h.pl_value / h.invested) * 100 : (h.current_value > 0 ? 100 : 0);
    });

    // 2. Sort the data
    processedHoldings.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        
        // Handle strings (Symbols) vs Numbers
        if (typeof valA === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
    });

    let totals = { inv: 0, cur: 0 };

    // 3. Render rows
    body.innerHTML = processedHoldings.map(h => {
        totals.inv += h.invested; 
        totals.cur += h.current_value;
        const plClass = h.pl_value >= 0 ? 'text-success' : 'text-danger';
        
        return `<tr>
            <td><b>${h.symbol}</b></td>
            <td>${h.qty}</td>
            <td>₹${h.avg_price.toFixed(2)}</td>
            <td>₹${h.invested.toLocaleString('en-IN')}</td>
            <td>₹${h.current_price.toFixed(2)}</td>
            <td>₹${h.current_value.toLocaleString('en-IN')}</td>
            <td class="${plClass}">₹${h.pl_value.toLocaleString('en-IN')}</td>
            <td class="${plClass}">${h.pl_pct.toFixed(2)}%</td>
            <td style="text-align:center;">
                <button onclick="openCorpModal('${h.symbol}')" style="background:none; border:none; color:#0ea5e9; cursor:pointer; font-size:1.2rem;">
                    <i class="fas fa-plus-circle"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    updateSortIcons();
    updateTotals(totals.inv, totals.cur);
}

// 4. The Sorting Controller
function sortHoldings(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    renderTable();
}

// 5. Update UI Icons
function updateSortIcons() {
    const columns = ['symbol', 'qty', 'avg_price', 'invested', 'current_price', 'current_value', 'pl_value', 'pl_pct'];
    columns.forEach(col => {
        const el = document.getElementById(`sort-${col}`);
        if (el) {
            if (sortColumn === col) {
                el.innerHTML = sortDirection === 'asc' ? ' ↑' : ' ↓';
                el.style.color = '#0ea5e9';
            } else {
                el.innerHTML = '';
            }
        }
    });
}
function filterTable() {
    const input = document.getElementById('stock-search');
    const clearBtn = document.getElementById('clear-search');
    const filter = input.value.toUpperCase();
    const tr = document.querySelectorAll('#holdings-body tr');

    // Only update clearBtn if it actually exists in the HTML
    if (clearBtn) {
        clearBtn.style.display = input.value.length > 0 ? "block" : "none";
    }

    tr.forEach(row => {
        const td = row.getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            row.style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    });
}

// Add this for the expanding search bar
function toggleSearch() {
    const input = document.getElementById('stock-search');
    input.classList.toggle('active');
    if (input.classList.contains('active')) {
        input.focus();
    } else {
        input.value = "";
        filterTable(); // Reset table when closing
    }
}

function clearSearch() {
    const input = document.getElementById('stock-search');
    input.value = "";
    filterTable(); // This will hide the X and show all rows automatically
    input.focus(); // Keeps the cursor in the box in case they want to type something else
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
        
        // Toggle classes instead of hardcoding colors
        plEl.classList.remove('text-success', 'text-danger');
        plEl.classList.add(totalPL >= 0 ? 'text-success' : 'text-danger');
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
