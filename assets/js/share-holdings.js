/**
 * Share Holdings Engine v2.2
 * Supports CSV & XLSX + Flexible Header Search + Dynamic Sync
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkSFTyJzrmoV67msqbKwbFc5qcZ7T5Ul84WuBOGaCshYx8H-Agm0n2GXHw-UEaysGnZA/exec"; 

let processedHoldings = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const csvInput = document.getElementById('csv-input');
    const syncBtn = document.getElementById('sync-btn');

    if (dropZone && csvInput) {
        dropZone.onclick = () => csvInput.click();
        csvInput.onchange = (e) => handleFile(e.target.files[0]);
        // ... (Drag & Drop handlers remain the same)
    }
    if (syncBtn) syncBtn.onclick = () => startSync();
});

async function handleFile(file) {
    if (!file) return;
    showStatus(`Reading ${file.name}...`);
    
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (e) => {
        let rawRows = [];

        if (isExcel) {
            // EXCEL PROCESSING
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
        } else {
            // CSV PROCESSING
            const text = e.target.result;
            rawRows = text.split('\n').map(row => 
                row.split(',').map(cell => cell.replace(/"/g, '').trim())
            );
        }

        const cleanData = findAndMapHeaders(rawRows);
        
        if (cleanData.length > 0) {
            calculateFIFO(cleanData);
            document.getElementById('sync-btn').disabled = false;
            showStatus(`Successfully loaded ${cleanData.length} transactions.`);
        } else {
            showStatus("Error: Required headers (Symbol, Quantity, Price) not found in file.", true);
        }
    };

    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
}

/** * FLEXIBLE HEADER SEARCH LOGIC
 * Scans every row and every column for keywords 
 */
function findAndMapHeaders(rows) {
    let headerIndex = -1;
    const required = ['symbol', 'quantity', 'price']; 
    // We look for 'trade type' too, but symbol/qty/price are the dealbreakers

    for (let i = 0; i < rows.length; i++) {
        const rowValues = rows[i].map(v => String(v).toLowerCase());
        const hasAll = required.every(req => rowValues.some(col => col.includes(req)));
        
        if (hasAll) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) return [];

    const headers = rows[headerIndex].map(h => String(h).trim().toLowerCase());
    
    return rows.slice(headerIndex + 1)
        .filter(row => row.length > 0 && row[headers.indexOf('symbol')] !== "")
        .map(row => {
            return {
                symbol: row[headers.indexOf('symbol')],
                type: (row[headers.findIndex(h => h.includes('type'))] || "BUY").toUpperCase(),
                qty: Math.abs(parseInt(row[headers.indexOf('quantity')])),
                price: parseFloat(row[headers.indexOf('price')]),
                date: row[headers.findIndex(h => h.includes('date') || h.includes('time'))] || ""
            };
        });
}

// ... (Rest of calculateFIFO, startSync, and renderTable functions remain the same as previous version)
