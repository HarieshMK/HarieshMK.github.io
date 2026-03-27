/**
 * Share Holdings Engine v2.6
 * CLEANED & VERIFIED
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; 
let processedHoldings = [];

// --- 1. UI HELPERS ---
function showStatus(msg, isError = false) {
    console.log("Status:", msg);
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        box.style.backgroundColor = isError ? '#fee2e2' : '#f0f9ff';
        if (!isError) setTimeout(() => { box.style.display = 'none'; }, 8000);
    }
}

console.log("Share Holdings Script Initializing...");

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFile(e.target.files[0]);
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = "#0ea5e9"; };
        dropZone.ondragleave = () => { dropZone.style.borderColor = "#cbd5e1"; };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
        };
    }
    if (syncBtn) syncBtn.onclick = () => startSync();
});

// --- 2. FILE PROCESSING ---
async function handleFile(file) {
    if (!file) return;
    
    showStatus(`Reading ${file.name}...`);
    console.log("File selected:", file.name);

    const reader = new FileReader();
    const isExcel = file.name.match(/\.(xlsx|xls)$/i);

    reader.onload = (e) => {
        try {
            let rawRows = [];
            if (isExcel) {
                if (typeof XLSX === 'undefined') {
                    showStatus("Library Error: XLSX engine not loaded. Check HTML script tag.", true);
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
                const btn = document.getElementById('sync-btn');
                if(btn) btn.disabled = false;
                showStatus(`Success: Loaded ${cleanData.length} trades.`);
            } else {
                showStatus("Format Error: Missing 'Symbol', 'Quantity', or 'Price' columns.", true);
            }
        } catch (err) {
            console.error("Processing error:", err);
            showStatus("System Error: Failed to process file content.", true);
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

// --- 3. THE FIFO & SYNC ENGINE ---
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
            const match = sheetPrices.find(p => p.ticker && p.ticker.includes(h.symbol.toUpperCase()));
            if (match) h.current_price = parseFloat(match.price);
            else missing.push(`NSE:${h.symbol.toUpperCase()}`);
        });

        if (missing.length > 0) {
            showStatus(`Adding ${missing.length} new tickers...`);
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ tickers: missing })
            });
            showStatus("New stocks added! formulas take ~10s. Click sync again shortly.");
        } else {
            showStatus("All prices updated!");
        }
        renderTable();
    } catch (e) {
        showStatus("Sync failed. Check Web App permissions.", true);
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
