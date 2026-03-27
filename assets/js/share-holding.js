/**
 * Share Holdings Engine v2.4
 * FULLY SELF-CONTAINED
 */

// --- 1. DEFINE UI HELPERS FIRST (To prevent ReferenceErrors) ---
function showStatus(msg, isError = false) {
    console.log("Status Update:", msg); // This will show in console even if UI fails
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        box.style.backgroundColor = isError ? '#fee2e2' : '#f0f9ff';
        box.style.color = isError ? '#991b1b' : '#075985';
        if (!isError) setTimeout(() => { box.style.display = 'none'; }, 8000);
    } else {
        // If the HTML elements aren't found, alert the user so we know
        if (isError) alert("Error: " + msg);
    }
}

console.log("Share Holdings Script Initializing...");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; 

let processedHoldings = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFile(e.target.files[0]);
        
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = "#0ea5e9"; };
        dropZone.ondragleave = () => { dropZone.style.borderColor = "#cbd5e1"; };
        dropZone.ondrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
        console.log("Event listeners attached to Drop Zone.");
    }
    if (syncBtn) syncBtn.onclick = () => startSync();
});

// --- 2. THE REST OF THE ENGINE ---

async function handleFile(file) {
    if (!file) return;
    showStatus(`Reading ${file.name}...`);
    
    const reader = new FileReader();
    const isExcel = file.name.match(/\.(xlsx|xls)$/i);

    reader.onload = (e) => {
        try {
            let rawRows = [];
            if (isExcel) {
                if (typeof XLSX === 'undefined') {
                    showStatus("Excel library not loaded! Check HTML script tag.", true);
                    return;
                }
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
            
            if (cleanData.length > 0) {
                calculateFIFO(cleanData);
                if(document.getElementById('sync-btn')) document.getElementById('sync-btn').disabled = false;
                showStatus(`Found ${cleanData.length} trades.`);
            } else {
                showStatus("Required headers (Symbol, Quantity, Price) not found.", true);
            }
        } catch (err) {
            console.error("File Processing Error:", err);
            showStatus("Error reading file.", true);
        }
    };

    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
}

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
        .filter(row => row[sIdx] && row[sIdx] !== "")
        .map(row => ({
            symbol: row[sIdx],
            type: (String(row[tIdx] || "BUY")).toUpperCase(),
            qty: Math.abs(parseInt(row[qIdx])),
            price: parseFloat(row[pIdx]),
            date: row[dIdx] || ""
        }));
}
function calculateFIFO(trades) {
    const portfolio = {};
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    trades.forEach(trade => {
        if (!portfolio[trade.symbol]) portfolio[trade.symbol] = [];
        if (trade.type.includes('BUY')) {
            portfolio[trade.symbol].push({ qty: trade.qty, price: trade.price });
        } else if (trade.type.includes('SELL')) {
            let sellQty = trade.qty;
            while (sellQty > 0 && portfolio[trade.symbol].length > 0) {
                let oldest = portfolio[trade.symbol][0];
                if (oldest.qty <= sellQty) {
                    sellQty -= oldest.qty;
                    portfolio[trade.symbol].shift();
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
            current_price: totalQty > 0 ? totalCost / totalQty : 0
        };
    }).filter(h => h.qty > 0);
    renderTable();
}

async function startSync() {
    showStatus("Syncing with Google Sheet...");
    const btn = document.getElementById('sync-btn');
    btn.innerHTML = 'Syncing...';

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const sheetPrices = await res.json();
        const missing = [];

        processedHoldings.forEach(h => {
            const match = sheetPrices.find(p => p.ticker && p.ticker.includes(h.symbol.toUpperCase()));
            if (match) h.current_price = parseFloat(match.price);
            else missing.push(`NSE:${h.symbol.toUpperCase()}`);
        });

        if (missing.length > 0) {
            showStatus(`Adding ${missing.length} new stocks...`);
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ tickers: missing })
            });
            showStatus("New stocks added! Wait 10s and Sync again.");
        } else {
            showStatus("Update Complete!");
        }
        renderTable();
    } catch (e) {
        showStatus("Sync Error. Check Web App permissions.", true);
    } finally {
        btn.innerHTML = 'Run FIFO Sync';
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
        return `<tr><td><b>${h.symbol}</b></td><td>${h.qty}</td><td>₹${h.avg_price.toFixed(2)}</td><td>₹${h.invested.toFixed(0)}</td><td>₹${h.current_price.toFixed(2)}</td><td>₹${curVal.toFixed(0)}</td><td style="color:${plPct>=0?'#10b981':'#ef4444'}">${plPct}%</td></tr>`;
    }).join('');

    document.getElementById('total-invested').innerText = `₹${totalInv.toLocaleString('en-IN')}`;
    document.getElementById('current-value').innerText = `₹${totalCur.toLocaleString('en-IN')}`;
    const totalPL = totalCur - totalInv;
    const plEl = document.getElementById('total-pl');
    plEl.innerText = `₹${totalPL.toLocaleString('en-IN')} (${totalInv>0?((totalPL/totalInv)*100).toFixed(2):0}%)`;
    plEl.style.color = totalPL >= 0 ? '#10b981' : '#ef4444';
}

function showStatus(msg, isError = false) {
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        box.style.background = isError ? '#fee2e2' : '#f0f9ff';
        if (!isError) setTimeout(() => box.style.display = 'none', 8000);
    }
}
