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
    let colMap = { date: undefined, share: undefined, price: undefined, qty: undefined, type: undefined, amount: undefined };

    // 1. FIND THE HEADER ROW & MAP COLUMNS WITH PRIORITY
    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].map(c => String(c || '').trim().toLowerCase());
        
        if (cols.some(c => c.includes('symbol') || c.includes('scrip') || c.includes('scheme') || c.includes('trade_id'))) {
            headerRowIndex = i;
            
            cols.forEach((name, idx) => {
                // DATE
                if (name.includes('trade date') || name.includes('execution date') || name.includes('trade_date')) colMap.date = idx;
                else if (name.includes('date') && colMap.date === undefined) colMap.date = idx;

                // SHARE/SYMBOL: Strictly prioritize 'symbol' and 'name' over ISIN
                // We check !name.includes('isin') to prevent it from stealing the 'share' slot
                if ((name.includes('symbol') || name.includes('scrip') || name.includes('script')) && !name.includes('isin')) {
                    colMap.share = idx;
                } else if ((name.includes('scheme') || name.includes('name')) && colMap.share === undefined) {
                    colMap.share = idx;
                }

                // PRICE (Anti-LTP Logic)
                if (name.includes('avg') || name.includes('average')) colMap.price = idx;
                else if ((name.includes('buy price') || name.includes('rate')) && colMap.price === undefined) colMap.price = idx;
                else if (name.includes('price') && !name.includes('last') && colMap.price === undefined) colMap.price = idx;
                else if (name.includes('price') && colMap.price === undefined) colMap.price = idx;

                // QUANTITY
                if (name.includes('qty') || name.includes('quantity') || name.includes('units')) colMap.qty = idx;

                // TYPE
                if (name.includes('type') || name.includes('side') || name.includes('transaction_type')) colMap.type = idx;

                // TOTAL AMOUNT
                if (name.includes('net amount') || name.includes('total') || name.includes('settlement')) colMap.amount = idx;
                else if (name.includes('amount') && colMap.amount === undefined) colMap.amount = idx;
            });
            break;
        }
    }

    if (headerRowIndex === -1) {
        alert("Could not detect trade table headers. Ensure the file contains columns like 'Symbol', 'Quantity', and 'Price'.");
        return;
    }

    // 2. PROCESS THE DATA ROWS
    const dataRows = rows.slice(headerRowIndex + 1);
    dataRows.forEach(row => {
        const rawShare = row[colMap.share];
        if (!rawShare || String(rawShare).trim() === "") return;

        const rawDate = row[colMap.date];
        const rawType = String(row[colMap.type] || '').toLowerCase();
        const rawQty = parseFloat(String(row[colMap.qty] || '0').replace(/,/g, ''));
        const rawPrice = parseFloat(String(row[colMap.price] || '0').replace(/,/g, ''));
        const rawTotal = parseFloat(String(row[colMap.amount] || '0').replace(/,/g, ''));

        const isSell = rawType.includes('sell') || rawType.includes('redemption') || rawType.includes('out') || rawType === 's';
        
        let finalAmount = (!isNaN(rawTotal) && rawTotal !== 0) ? Math.abs(rawTotal) : (rawQty * rawPrice);
        if (isSell) finalAmount = -Math.abs(finalAmount);

        if (!isNaN(finalAmount) && finalAmount !== 0) {
            parsedData.push({
                date: rawDate ? String(rawDate).split(' ')[0] : new Date().toISOString().split('T')[0],
                share: String(rawShare).toUpperCase(),
                amount: finalAmount
            });
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
