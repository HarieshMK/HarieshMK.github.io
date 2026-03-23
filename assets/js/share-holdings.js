/**
 * Share Holdings Engine
 * Handles Zerodha CSV parsing, FIFO logic, and Supabase Sync
 */

const SYMBOLS_TO_PROCESS = [];
let processedHoldings = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    // 1. File Upload Handlers
    dropZone.onclick = () => csvInput.click();
    
    csvInput.onchange = (e) => handleFile(e.target.files[0]);

    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    syncBtn.onclick = () => startSync();
});

// --- CORE LOGIC ---

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
            showStatus(`Found ${cleanData.length} trades. Ready to sync.`);
        } else {
            showStatus("Error: Could not find valid headers in CSV.", true);
        }
    };
    reader.readAsText(file);
}

/**
 * Scans rows to find where the Zerodha headers actually start
 */
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

/**
 * The FIFO Calculation Engine
 */
function calculateFIFO(trades) {
    const portfolio = {};

    // Group by Symbol and sort by Date (ascending)
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
                    portfolio[trade.symbol].shift(); // Remove fully sold buy lot
                } else {
                    oldestBuy.qty -= sellQty;
                    sellQty = 0; // Partially sold buy lot
                }
            }
        }
    });

    // Flatten back to a "Holdings" list
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
            current_price: avgPrice, // Placeholder until API sync
            lots: lots // Keeping individual lots for "Audit" view later
        };
    }).filter(h => h.qty > 0);

    renderTable();
}

// --- UI RENDERERS ---

function renderTable() {
    const body = document.getElementById('holdings-body');
    let totalInvested = 0;

    body.innerHTML = processedHoldings.map(h => {
        totalInvested += h.invested;
        const pl = 0; // Placeholder
        return `
            <tr>
                <td><strong>${h.symbol}</strong></td>
                <td>${h.qty}</td>
                <td>₹${h.avg_price.toFixed(2)}</td>
                <td>₹${h.invested.toLocaleString('en-IN')}</td>
                <td>₹${h.current_price.toFixed(2)}</td>
                <td>₹${h.invested.toLocaleString('en-IN')}</td>
                <td class="${pl >= 0 ? 'text-success' : 'text-danger'}">0%</td>
            </tr>
        `;
    }).join('');

    document.getElementById('total-invested').innerText = `₹${totalInvested.toLocaleString('en-IN')}`;
}

async function startSync() {
    showStatus("Connecting to Supabase & Fetching Market Prices...");
    
    // TODO: 1. Fetch Corporate Actions (Splits/Bonuses) for these symbols
    // TODO: 2. Fetch Current Market Price
    // TODO: 3. Upsert to Supabase 'processed_holdings' table

    // Placeholder for next step
    setTimeout(() => {
        showStatus("Sync Successful! Holdings updated.", false);
    }, 1500);
}

function showStatus(msg, isError = false) {
    const box = document.getElementById('status-box');
    const text = document.getElementById('status-text');
    box.style.display = 'flex';
    text.innerText = msg;
    box.style.color = isError ? '#ef4444' : 'inherit';
}

function parseCSV(text) {
    return text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));
}
