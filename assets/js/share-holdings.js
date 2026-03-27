/**
 * Share Holdings Engine v2.0
 * Logic: Zerodha CSV Parser + FIFO Engine + Google Sheet Price Proxy
 */

// 1. PLACEHOLDER: Paste your Google Web App URL here
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; 

let processedHoldings = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    // File Upload Handlers
    if (dropZone) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFile(e.target.files[0]);
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
        dropZone.ondragleave = () => dropZone.classList.remove('dragover');
        dropZone.ondrop = (e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
        };
    }

    if (syncBtn) {
        syncBtn.onclick = () => startSync();
    }
});

// --- FILE HANDLING & PARSING ---

async function handleFile(file) {
    if (!file) return;
    showStatus("Reading Tradebook...");
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const rawRows = parseCSV(text);
        const cleanData = findAndMapHeaders(rawRows);
        
        if (cleanData.length > 0) {
            calculateFIFO(cleanData);
            document.getElementById('sync-btn').disabled = false;
            showStatus(`Found ${cleanData.length} trades. Click 'Run FIFO Sync' to fetch prices.`);
        } else {
            showStatus("Error: Could not find valid headers in CSV.", true);
        }
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    return text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));
}

function findAndMapHeaders(rows) {
    let headerIndex = -1;
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
        .filter(row => row.length === headers.length && row[0] !== "")
        .map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            return {
                symbol: obj['symbol'],
                type: obj['trade type'].toUpperCase(),
                qty: parseInt(obj['quantity']),
                price: parseFloat(obj['price']),
                date: obj['trade date'] || obj['trade_date']
            };
        });
}

// --- CORE FIFO ENGINE ---

function calculateFIFO(trades) {
    const portfolio = {};
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    trades.forEach(trade => {
        if (!portfolio[trade.symbol]) portfolio[trade.symbol] = [];

        if (trade.type === 'BUY') {
            portfolio[trade.symbol].push({ qty: trade.qty, price: trade.price });
        } else if (trade.type === 'SELL') {
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
            current_price: avgPrice // Default to buy price until sync
        };
    }).filter(h => h.qty > 0);

    renderTable();
}

// --- SYNC WITH GOOGLE SHEETS ---

async function startSync() {
    showStatus("Fetching live prices from Google Price Engine...");
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error("Could not connect to Google Script");
        const sheetPrices = await response.json();
        
        processedHoldings.forEach(holding => {
            // Match 'RELIANCE' from CSV with 'NSE:RELIANCE' from Sheet
            const match = sheetPrices.find(p => 
                p.ticker && p.ticker.toUpperCase().includes(holding.symbol.toUpperCase())
            );

            if (match && match.price > 0) {
                holding.current_price = parseFloat(match.price);
            }
        });

        renderTable();
        showStatus("Sync Successful! Prices updated.", false);

    } catch (error) {
        console.error("Sync Error:", error);
        showStatus("Sync failed: Check if your Web App is deployed as 'Anyone'", true);
    }
}

// --- UI RENDERER ---

function renderTable() {
    const body = document.getElementById('holdings-body');
    let totalInvested = 0;
    let totalCurrentValue = 0;

    if (!body) return;

    body.innerHTML = processedHoldings.map(h => {
        const currentValue = h.qty * h.current_price;
        totalInvested += h.invested;
        totalCurrentValue += currentValue;

        const plAmt = currentValue - h.invested;
        const plPct = h.invested > 0 ? ((plAmt / h.invested) * 100).toFixed(2) : 0;
        const statusClass = plAmt >= 0 ? 'text-success' : 'text-danger';

        return `
            <tr>
                <td><strong>${h.symbol}</strong></td>
                <td>${h.qty}</td>
                <td>₹${h.avg_price.toFixed(2)}</td>
                <td>₹${h.invested.toLocaleString('en-IN')}</td>
                <td>₹${h.current_price.toFixed(2)}</td>
                <td>₹${currentValue.toLocaleString('en-IN')}</td>
                <td class="${statusClass}">${plAmt >= 0 ? '+' : ''}${plPct}%</td>
            </tr>
        `;
    }).join('');

    // Update the Summary Metric Cards
    updateMetric('total-invested', totalInvested);
    updateMetric('current-value', totalCurrentValue);
    
    const totalPlEl = document.getElementById('total-pl');
    if (totalPlEl) {
        const totalPlAmt = totalCurrentValue - totalInvested;
        const totalPlPct = totalInvested > 0 ? ((totalPlAmt / totalInvested) * 100).toFixed(2) : 0;
        totalPlEl.innerText = `₹${totalPlAmt.toLocaleString('en-IN', {maximumFractionDigits: 0})} (${totalPlPct}%)`;
        totalPlEl.style.color = totalPlAmt >= 0 ? '#10b981' : '#ef4444';
    }
}

function updateMetric(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = `₹${value.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
}

function showStatus(msg, isError = false) {
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    if (box && text) {
        box.style.display = 'flex';
        text.innerText = msg;
        box.style.color = isError ? '#ef4444' : '#0ea5e9';
    }
}
