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
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => processRows(res.data) });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            processRows(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
        };
        reader.readAsArrayBuffer(file);
    }
}

function processRows(rows) {
    parsedData = [];
    rows.forEach(row => {
        // ZERODHA LOGIC
        if (row.trade_id || row.symbol) {
            const qty = parseFloat(row.quantity) || 0;
            const price = parseFloat(row.price) || 0;
            const isBuy = (row.trade_type || '').toLowerCase() === 'buy';
            parsedData.push({ date: row.trade_date, share: row.symbol, amount: isBuy ? (qty * price) : -(qty * price) });
        } 
        // ICICI PRU LOGIC (with Tax Accumulation)
        else if (row['Scheme Name'] || row['Folio no']) {
            const dateStr = row['Date'] || '';
            const rawAmt = parseFloat(String(row['Amount'] || '').replace(/,/g, ''));
            const isTax = String(row['Transaction Type'] || '').toLowerCase().includes('stamp') || String(row['Transaction Type'] || '').toLowerCase().includes('tax');

            if (dateStr && !isNaN(rawAmt) && !isTax) {
                parsedData.push({ date: dateStr, share: row['Scheme Name'], amount: rawAmt });
            } else if (isTax && !isNaN(rawAmt) && parsedData.length > 0) {
                // Bundle tax into the previous transaction
                parsedData[parsedData.length - 1].amount += rawAmt;
            }
        }
    });
    displayPreview();
}

function displayPreview() {
    document.getElementById('preview-body').innerHTML = parsedData.map(d => `
        <tr style="border-bottom: 1px solid #334155;"><td style="padding: 10px 0;">${d.date}</td><td>${d.share}</td><td>₹${d.amount.toFixed(2)}</td></tr>
    `).join('');
    document.getElementById('count-badge').innerText = parsedData.length;
    document.getElementById('mapping-section').style.display = 'block';
    document.getElementById('dropzone').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
    if (error) alert(error.message);
    else window.location.href = "/dashboard/";
};
</script>
