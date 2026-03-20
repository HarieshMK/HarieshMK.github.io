---
layout: default
title: Bulk Import
permalink: /import-transactions/
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<div class="dashboard-container" style="max-width: 800px; margin: 40px auto; padding: 0 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-family: 'Lora'; margin: 0;">Smart Import</h2>
        <a href="/dashboard/" style="color: #94a3b8; text-decoration: none; font-size: 0.85rem; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px;">✕ Exit to Dashboard</a>
    </div>

    <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 30px;">Upload your broker tradebook or AMC statement to sync your goals.</p>

    <div id="dropzone" style="border: 2px dashed #334155; border-radius: 20px; padding: 60px 20px; text-align: center; background: #1e293b; cursor: pointer;">
        <div style="font-size: 2.5rem; margin-bottom: 15px;">📥</div>
        <p style="margin-bottom: 5px;"><strong>Click to upload</strong> or drag and drop</p>
        <p style="font-size: 0.75rem; color: #64748b;">Supports CSV, XLS, XLSX</p>
        <input type="file" id="file-input" style="display: none;" accept=".csv, .xls, .xlsx">
    </div>

    <div id="mapping-section" style="display: none; margin-top: 30px;">
        <div class="goal-card" style="background: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
            <h3 style="margin-top: 0; font-size: 1rem; color: #f1f5f9;">Step 2: Assign to Goal</h3>
            <select id="import-goal-id" style="width: 100%; padding: 12px; border-radius: 8px; background: #0f172a; color: #fff; border: 1px solid #334155; margin-bottom: 20px; outline: none;"></select>
            
            <div style="max-height: 250px; overflow-y: auto; border: 1px solid #334155; border-radius: 8px; padding: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #cbd5e1;">
                    <thead><tr style="text-align: left; color: #64748b; border-bottom: 1px solid #334155;"><th style="padding-bottom: 8px;">Date</th><th>Share/Scheme</th><th style="text-align: right;">Amount</th></tr></thead>
                    <tbody id="preview-body"></tbody>
                </table>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px;">
                <button id="btn-import-finish" style="padding: 14px; border-radius: 10px; background: #0ea5e9; color: white; border: none; font-weight: bold; cursor: pointer; font-size: 0.9rem;">
                    Import & Finish
                </button>
                <button id="btn-import-more" style="padding: 14px; border-radius: 10px; background: transparent; color: #38bdf8; border: 1px solid #0ea5e9; font-weight: bold; cursor: pointer; font-size: 0.9rem;">
                    Import & Add More
                </button>
            </div>
        </div>
    </div>
</div>

<div id="toast" style="display: none; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 12px 24px; border-radius: 30px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000;">✅ Successfully Imported!</div>

<script>
let parsedData = [];
let lastAction = 'finish';

document.getElementById('dropzone').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => handleFile(e.target.files[0]);

document.getElementById('btn-import-finish').onclick = () => { lastAction = 'finish'; startImport(); };
document.getElementById('btn-import-more').onclick = () => { lastAction = 'more'; startImport(); };

// 1. THE HASH FUNCTION (Must be present for uniqueness logic)
function generateRowHash(row, userId) {
    const rowStr = JSON.stringify(row) + userId;
    let hash = 0;
    for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return 'h' + Math.abs(hash);
}

async function handleFile(file) {
    if (!file) return;
    if (file.name.endsWith('.csv')) {
        Papa.parse(file, { header: false, skipEmptyLines: true, complete: (res) => processRawArray(res.data) });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            processRawArray(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }));
        };
        reader.readAsArrayBuffer(file);
    }
}

function processRawArray(rows) {
    parsedData = [];
    let headerRowIndex = -1;
    let colMap = { date: undefined, share: undefined, price: undefined, qty: undefined, type: undefined, amount: undefined };

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].map(c => String(c || '').trim().toLowerCase());
        if (cols.some(c => c.includes('symbol') || c.includes('scrip') || c.includes('scheme') || c.includes('trade_id'))) {
            headerRowIndex = i;
            cols.forEach((name, idx) => {
                if (name.includes('trade date') || name.includes('execution date') || name.includes('trade_date')) colMap.date = idx;
                else if (name.includes('date') && colMap.date === undefined) colMap.date = idx;
                
                const isActuallyISIN = name === 'isin' || name.startsWith('isin_') || name.startsWith('isin ');
                if ((name.includes('symbol') || name.includes('scrip')) && !isActuallyISIN) colMap.share = idx;
                else if ((name.includes('scheme') || name.includes('name')) && colMap.share === undefined) colMap.share = idx;

                if (name.includes('avg') || name.includes('average')) colMap.price = idx;
                else if ((name.includes('buy price') || name.includes('rate')) && colMap.price === undefined) colMap.price = idx;

                if (name.includes('qty') || name.includes('quantity') || name.includes('units')) colMap.qty = idx;
                if (name.includes('type') || name.includes('side') || name.includes('transaction_type')) colMap.type = idx;
                if (name.includes('net amount') || name.includes('total')) colMap.amount = idx;
                else if (name.includes('amount') && colMap.amount === undefined) colMap.amount = idx;
            });
            break;
        }
    }

    if (headerRowIndex === -1) { alert("Headers not detected."); return; }

    const dataRows = rows.slice(headerRowIndex + 1);
    dataRows.forEach((row, idx) => {
        const rawShare = row[colMap.share];
        if (!rawShare) return;

        const rawQty = parseFloat(String(row[colMap.qty] || '0').replace(/,/g, ''));
        const rawPrice = parseFloat(String(row[colMap.price] || '0').replace(/,/g, ''));
        const rawTotal = parseFloat(String(row[colMap.amount] || '0').replace(/,/g, ''));
        const isSell = String(row[colMap.type] || '').toLowerCase().match(/sell|redemption|out|s/);
        
        let finalAmount = (!isNaN(rawTotal) && rawTotal !== 0) ? Math.abs(rawTotal) : (rawQty * rawPrice);
        if (isSell) finalAmount = -Math.abs(finalAmount);

        if (!isNaN(finalAmount) && finalAmount !== 0) {
            parsedData.push({
                tempId: idx,
                date: row[colMap.date] ? String(row[colMap.date]).split(' ')[0] : new Date().toISOString().split('T')[0],
                share: String(rawShare).toUpperCase(),
                amount: finalAmount,
                hash: generateRowHash(row, 'user_placeholder') // Final hash generated at import
            });
        }
    });
    displayPreview();
}

function displayPreview() {
    document.getElementById('preview-body').innerHTML = parsedData.map(d => `
        <tr id="row-${d.tempId}" style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0;">${d.date}</td>
            <td>${d.share}</td>
            <td style="text-align: right; color: ${d.amount > 0 ? '#4ade80' : '#f87171'};">₹${Math.abs(d.amount).toFixed(2)}</td>
            <td style="text-align: right;"><button onclick="removeRow(${d.tempId})" style="background:none; border:none; color:#ef4444; cursor:pointer;">×</button></td>
        </tr>
    `).join('');
    document.getElementById('mapping-section').style.display = 'block';
    document.getElementById('dropzone').style.display = 'none';
}

function removeRow(id) {
    parsedData = parsedData.filter(d => d.tempId !== id);
    document.getElementById(`row-${id}`).remove();
    if (parsedData.length === 0) resetPage();
}

async function startImport() {
    const btnId = lastAction === 'finish' ? 'btn-import-finish' : 'btn-import-more';
    const btn = document.getElementById(btnId);
    const countRequested = parsedData.length;

    btn.innerText = "Saving...";
    btn.disabled = true;

    const goalId = document.getElementById('import-goal-id').value;
    const { data: { session } } = await supabase.auth.getSession();
    
    // Regenerate hash with actual User ID
    const entries = parsedData.map(d => ({
        user_id: session.user.id,
        goal_id: goalId,
        transaction_date: d.date,
        amount: d.amount,
        share_name: d.share,
        source_hash: generateRowHash(d, session.user.id) 
    }));

    const { error, count } = await supabase
        .from('transactions')
        .upsert(entries, { onConflict: 'user_id, source_hash', ignoreDuplicates: true, count: 'exact' });

    if (error) {
        alert("Upload failed: " + error.message);
        btn.disabled = false;
        btn.innerText = "Try Again";
    } else {
        const wasDuplicateFound = count < countRequested;
        if (lastAction === 'more') {
            const msg = wasDuplicateFound ? `✅ ${count} saved. ⚠️ ${countRequested - count} duplicates ignored.` : "✅ Imported successfully!";
            showToast(msg);
            resetPage();
        } else {
            if (wasDuplicateFound) alert("Imported! Note: Some duplicates were ignored.");
            window.location.href = "/dashboard/";
        }
    }
}

function resetPage() {
    parsedData = [];
    document.getElementById('mapping-section').style.display = 'none';
    document.getElementById('dropzone').style.display = 'block';
    document.getElementById('file-input').value = "";
}

function showToast(msg = "Successfully Imported!") {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: goals } = await supabase.from('goals').select('id, goal_name').eq('user_id', session.user.id);
    document.getElementById('import-goal-id').innerHTML = goals.map(g => `<option value="${g.id}">${g.goal_name}</option>`).join('');
});
</script>
