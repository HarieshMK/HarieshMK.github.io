/**
 * Share Holdings Engine v2.0
 * Zerodha CSV Parser + FIFO Engine + Google Sheet Price Proxy
 */

// 1. PLACEHOLDER: Paste your Google Web App URL here
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; 

let processedHoldings = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    // File Upload Handlers
    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFile(e.target.files[0]);
        
        dropZone.ondragover = (e) => { 
            e.preventDefault(); 
            dropZone.style.borderColor = "#0ea5e9";
            dropZone.style.background = "#f0f9ff";
        };
        dropZone.ondragleave = () => {
            dropZone.style.borderColor = "#cbd5e1";
            dropZone.style.background = "#f8fafc";
        };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
        };
    }

    if (syncBtn) {
        syncBtn.onclick = () => startSync();
    }
});

// --- FILE HANDLING ---

async function handleFile(file) {
    if (!file) return;
    showStatus("Reading Zerodha Tradebook...");
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const rawRows = parseCSV(text);
        const cleanData = findAndMapHeaders(rawRows);
        
        if (cleanData.length > 0) {
            calculateFIFO(cleanData);
            const syncBtn = document.getElementById('sync-btn');
            if (syncBtn) syncBtn.disabled = false;
            showStatus(`Found ${cleanData.length} trades. Ready to sync with market prices.`);
        } else {
            showStatus("Error: Could not find 'Symbol', 'Quantity', or 'Price' in CSV.", true);
        }
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    return text.split('\n').map(row => 
        row.split(',').map(cell => cell.replace(/"/g, '').trim())
    );
}

function findAndMapHeaders(rows) {
    let headerIndex = -1;
    // We look for these key Zerodha headers
    const targetHeaders = ['symbol', 'trade type', 'quantity', 'price'];

    for (let i = 0; i < rows.length; i++) {
        const rowStr = rows[i].join('|').toLowerCase();
        if (targetHeaders.every(h => rowStr.includes(h))) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) return [];

    const headers = rows[headerIndex].map(h => h.trim().toLowerCase());
    return rows.slice(headerIndex + 1)
        .filter(row => row.length >= headers.length && row[0] !== "")
        .map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            return {
                symbol: obj['symbol'],
                type: (obj['trade type'] || "").toUpperCase(),
                qty: parseInt(obj['quantity']),
                price: parseFloat(obj['price']),
                date: obj['trade date'] || obj['order execution time'] || ""
            };
        });
}

// --- FIFO CALCULATION ---

function calculateFIFO(trades) {
    const portfolio = {};
    // Sort by date to ensure FIFO logic works
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    trades.forEach(trade => {
        if (!portfolio[trade.symbol]) portfolio[trade.symbol] = [];

        if (trade.type.includes('BUY')) {
            portfolio[trade.symbol].push({ qty: trade.qty, price: trade.price });
        } else if (trade.type.includes('SELL')) {
            let sellQty = trade.qty;
            while (sellQty > 0 && portfolio[trade.symbol].length > 0) {
                let oldestBuy = portfolio[trade.symbol][0];
                if (oldestBuy.qty <= sellQty) {
                    sellQty -= oldestBuy.qty;
                    portfolio[trade.symbol].shift();
                } else {
                    oldestBuy.qty -= sellQty;
                    sellQty = 0;
                }
            }
        }
    });

    processedHoldings = Object.keys(portfolio).map(symbol => {
        const lots = portfolio[symbol];
        const totalQty = lots.reduce((sum, lot) => sum + lot.qty, 0);
        const avgPrice = totalQty > 0 
            ? lots.reduce((sum, lot) => sum + (lot.qty * lot.price), 0) / totalQty 
            : 0;

        return {
            symbol,
            qty: totalQty,
            avg_price: avgPrice,
            invested: totalQty * avgPrice,
            current_price: avgPrice // Initially matches buy price
        };
    }).filter(h => h.qty > 0);

    renderTable();
}

// --- GOOGLE SHEET SYNC ---

async function startSync() {
    showStatus("Fetching latest NSE prices...");
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error("Price Engine unreachable");
        const sheetPrices = await response.json();
        
        processedHoldings.forEach(holding => {
            // Find match (e.g., RELIANCE matches NSE:RELIANCE)
            const match = sheetPrices.find(p => 
                p.ticker && p.ticker.toUpperCase().includes(holding.symbol.toUpperCase())
            );

            if (match && match.price) {
                holding.current_price = parseFloat(match.price);
            }
        });

        renderTable();
        showStatus("Portfolio values updated successfully!");

    } catch (error) {
        console.error("Sync Error:", error);
        showStatus("Sync failed. Check if Web App is published to 'Anyone'.", true);
    } finally {
        if (syncBtn) syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Run FIFO Sync';
    }
}

// --- UI UPDATE ---

function renderTable() {
    const body = document.getElementById('holdings-body');
    let totalInv = 0;
    let totalCur = 0;

    if (!body) return;

    if (processedHoldings.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-state">No active holdings found.</td></tr>';
        return;
    }

    body.innerHTML = processedHoldings.map(h => {
        const curVal = h.qty * h.current_price;
        totalInv += h.invested;
        totalCur += curVal;

        const plAmt = curVal - h.invested;
        const plPct = h.invested > 0 ? ((plAmt / h.invested) * 100).toFixed(2) : 0;
        const colorClass = plAmt >= 0 ? 'text-success' : 'text-danger';

        return `
            <tr>
                <td><strong>${h.symbol}</strong></td>
                <td>${h.qty}</td>
                <td>₹${h.avg_price.toFixed(2)}</td>
                <td>₹${h.invested.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                <td>₹${h.current_price.toFixed(2)}</td>
                <td>₹${curVal.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                <td style="color: ${plAmt >= 0 ? '#10b981' : '#ef4444'}; font-weight:bold;">
                    ${plAmt >= 0 ? '+' : ''}${plPct}%
                </td>
            </tr>
        `;
    }).join('');

    // Update Metrics
    updateEl('total-invested', `₹${totalInv.toLocaleString('en-IN', {maximumFractionDigits:0})}`);
    updateEl('current-value', `₹${totalCur.toLocaleString('en-IN', {maximumFractionDigits:0})}`);
    
    const plAmt = totalCur - totalInv;
    const plPct = totalInv > 0 ? ((plAmt / totalInv) * 100).toFixed(2) : 0;
    const plEl = document.getElementById('total-pl');
    if (plEl) {
        plEl.innerText = `₹${plAmt.toLocaleString('en-IN', {maximumFractionDigits:0})} (${plPct}%)`;
        plEl.style.color = plAmt >= 0 ? '#10b981' : '#ef4444';
    }
}

function updateEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function showStatus(msg, isError = false) {
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        box.className = isError ? 'status-msg error' : 'status-msg';
        // Hide status after 5 seconds if not an error
        if (!isError) setTimeout(() => { box.style.display = 'none'; }, 5000);
    }
}
