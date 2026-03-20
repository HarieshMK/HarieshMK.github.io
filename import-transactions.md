---
layout: default
title: Bulk Import
permalink: /import-transactions/
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<div class="dashboard-container" style="max-width: 800px; margin: 40px auto;">
    <h2 style="font-family: 'Lora'; margin-bottom: 10px;">Smart Import</h2>
    <p style="color: var(--d-text-muted); font-size: 0.9rem; margin-bottom: 30px;">Drag & drop your Zerodha Tradebook (CSV) or ICICI Pru Statement (XLS/CSV).</p>

    <div id="dropzone" style="border: 2px dashed #334155; border-radius: 20px; padding: 60px 20px; text-align: center; background: #1e293b; cursor: pointer;">
        <div style="font-size: 2rem; margin-bottom: 10px;">📄</div>
        <p><strong>Click to upload</strong> or drag and drop</p>
        <input type="file" id="file-input" style="display: none;" accept=".csv, .xls, .xlsx">
    </div>

    <div id="mapping-section" style="display: none; margin-top: 40px;">
        <div class="goal-card" style="background: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
            <h3 style="margin-top: 0;">Assign Goal</h3>
            <select id="import-goal-id" style="width: 100%; padding: 12px; border-radius: 8px; background: #0f172a; color: #fff; border: 1px solid #334155; margin-bottom: 20px;"></select>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; color: #fff;">
                    <thead><tr style="text-align: left; color: #94a3b8;"><th>Date</th><th>Item/Share</th><th>Final Amount</th></tr></thead>
                    <tbody id="preview-body"></tbody>
                </table>
            </div>

            <button id="process-btn" style="width: 100%; margin-top: 30px; padding: 15px; border-radius: 12px; background: #0ea5e9; color: white; border: none; font-weight: bold; cursor: pointer;">
                Import <span id="count-badge">0</span> Transactions
            </button>
        </div>
    </div>
</div>

<script>
let parsedData = [];

document.getElementById('dropzone').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => handleFile(e.target.files[0]);

async function handleFile(file) {
    if (!file) return;
    
    if (file.name.endsWith('.csv')) {
        // We set header: false so we can manually find the real header row
        Papa.parse(file, { 
            header: false, 
            skipEmptyLines: true, 
            complete: (res) => processRawArray(res.data) 
        });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // Convert to raw array (rows and columns) instead of JSON objects
            const rawArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            processRawArray(rawArray);
        };
        reader.readAsArrayBuffer(file);
    }
}

function processRawArray(rows) {
    parsedData = [];
    let headerRowIndex = -1;
    let headers = [];

    // 1. Find the Anchor Row (The row containing 'symbol' or 'trade_id')
    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].map(c => String(c || '').trim().toLowerCase());
        if (cols.includes('symbol') || cols.includes('trade_id') || cols.includes('scheme name')) {
            headerRowIndex = i;
            headers = cols;
            break;
        }
    }

    if (headerRowIndex === -1) {
        alert("Could not detect a valid trade table. Please ensure the file contains a 'symbol' or 'scheme name' column.");
        return;
    }

    // 2. Process rows appearing AFTER the header
    const dataRows = rows.slice(headerRowIndex + 1);
    
    dataRows.forEach(row => {
        // Create a temporary object mapping header names to row values
        let entry = {};
        headers.forEach((h, idx) => {
            entry[h] = row[idx];
        });

        // ZERODHA LOGIC (Look for 'symbol' or 'trade_id')
        if (entry['symbol'] || entry['trade_id']) {
            const qty = parseFloat(entry['quantity']) || 0;
            const price = parseFloat(entry['price']) || 0;
            const type = String(entry['trade_type'] || '').toLowerCase();
            const isBuy = type === 'buy';
            
            if (qty > 0) {
                parsedData.push({ 
                    date: entry['trade date'] || entry['date'], 
                    share: String(entry['symbol']).toUpperCase(), 
                    amount: isBuy ? (qty * price) : -(qty * price) 
                });
            }
        } 
        // ICICI PRU LOGIC
        else if (entry['scheme name'] || entry['folio no']) {
            const dateStr = entry['date'] || '';
            const rawAmt = parseFloat(String(entry['amount'] || '').replace(/,/g, ''));
            const type = String(entry['transaction type'] || '').toLowerCase();
            const isTax = type.includes('stamp') || type.includes('tax');

            if (dateStr && !isNaN(rawAmt) && !isTax) {
                parsedData.push({ date: dateStr, share: entry['scheme name'], amount: rawAmt });
            } else if (isTax && !isNaN(rawAmt) && parsedData.length > 0) {
                parsedData[parsedData.length - 1].amount += rawAmt;
            }
        }
    });

    displayPreview();
}

function displayPreview() {
    if (parsedData.length === 0) {
        alert("No valid transactions found in the table.");
        return;
    }
    document.getElementById('preview-body').innerHTML = parsedData.map(d => `
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 0;">${d.date}</td><td>${d.share}</td><td>₹${d.amount.toFixed(2)}</td></tr>
    `).join('');
    document.getElementById('count-badge').innerText = parsedData.length;
    document.getElementById('mapping-section').style.display = 'block';
    document.getElementById('dropzone').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: goals } = await supabase.from('goals').select('id, goal_name').eq('user_id', session.user.id);
    document.getElementById('import-goal-id').innerHTML = goals.map(g => `<option value="${g.id}">${g.goal_name}</option>`).join('');
});

document.getElementById('process-btn').onclick = async () => {
    const btn = document.getElementById('process-btn');
    const goalId = document.getElementById('import-goal-id').value;
    const { data: { session } } = await supabase.auth.getSession();
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    const entries = parsedData.map(d => ({
        user_id: session.user.id,
        goal_id: goalId,
        transaction_date: d.date,
        amount: d.amount,
        share_name: d.share
    }));

    const { error } = await supabase.from('transactions').insert(entries);
    if (error) {
        alert(error.message);
        btn.innerText = "Import Transactions";
        btn.disabled = false;
    } else {
        window.location.href = "/dashboard/";
    }
};
</script>
