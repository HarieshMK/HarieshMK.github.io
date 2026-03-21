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
        <a href="/dashboard/" style="color: #94a3b8; text-decoration: none; font-size: 0.85rem; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px;">✕ Exit to dashboard</a>
    </div>

    <div id="goal-info-header" style="margin-bottom: 20px; padding: 10px; background: #0f172a; border-radius: 8px; border: 1px solid #334155; color: #38bdf8; font-size: 0.9rem; font-weight: bold;">
        📍 Loading Goal Context...
    </div>

    <div id="dropzone" style="border: 2px dashed #334155; border-radius: 20px; padding: 60px 20px; text-align: center; background: #1e293b; cursor: pointer;">
        <div style="font-size: 2.5rem; margin-bottom: 15px;">📥</div>
        <p style="margin-bottom: 5px;"><strong>Click to upload</strong> or drag and drop</p>
        <p style="font-size: 0.75rem; color: #64748b;">Supports CSV, XLS, XLSX</p>
        <input type="file" id="file-input" style="display: none;" accept=".csv, .xls, .xlsx">
    </div>

    <div id="mapping-section" style="display: none; margin-top: 30px;">
        <div class="goal-card" style="background: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
            <h3 style="margin-top: 0; font-size: 1rem; color: #f1f5f9; margin-bottom: 15px;">Preview Transactions</h3>
            
            <div style="max-height: 300px; overflow-y: auto; border: 1px solid #334155; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; color: #cbd5e1;">
                    <thead style="position: sticky; top: 0; background: #1e293b; z-index: 10;">
                        <tr style="text-align: left; color: #64748b; border-bottom: 1px solid #334155;">
                        <th style="padding: 12px 10px;">Date</th>
                        <th style="padding: 12px 10px;">Item</th>
                        <th style="padding: 12px 10px; text-align: right;">Amount</th>
                        <th style="padding: 12px 10px; text-align: center;">Action</th>
                    </tr>
                    </thead>
                    <tbody id="preview-body"></tbody>
                </table>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px;">
                <button id="btn-import-finish" style="padding: 14px; border-radius: 10px; background: #0ea5e9; color: white; border: none; font-weight: bold; cursor: pointer;">Import & Finish</button>
                <button id="btn-import-more" style="padding: 14px; border-radius: 10px; background: transparent; color: #38bdf8; border: 1px solid #0ea5e9; font-weight: bold; cursor: pointer;">Import & Add More</button>
            </div>
        </div>
    </div>
</div>

<div id="toast" style="display: none; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 12px 24px; border-radius: 30px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000;"></div>

<script>
let parsedData = [];
let lastAction = 'finish';
let currentGoalId = new URLSearchParams(window.location.search).get('goal_id');

document.getElementById('dropzone').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => handleFile(e.target.files[0]);
document.getElementById('btn-import-finish').onclick = () => { lastAction = 'finish'; startImport(); };
document.getElementById('btn-import-more').onclick = () => { lastAction = 'more'; startImport(); };

// Helper to handle various date formats (DD-MM-YYYY to YYYY-MM-DD)
function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const parts = String(dateStr).split(/[-/ ]/);
    if (parts.length >= 3) {
        // If it looks like DD-MM-YYYY
        if (parts[0].length <= 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr.split(' ')[0]; // Default fallback
}

function generateRowHash(row, userId) {
    const s = JSON.stringify(row) + userId;
    let h = 0;
    for(let i=0; i<s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return 'h' + Math.abs(h);
}

async function handleFile(file) {
    if (!file) return;
    if (file.name.endsWith('.csv')) {
        Papa.parse(file, { skipEmptyLines: true, complete: (res) => processRawArray(res.data) });
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            processRawArray(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }));
        };
        reader.readAsArrayBuffer(file);
    }
}

function processRawArray(rows) {
    console.log("DEBUG: Processing rows. Total count:", rows.length);
    parsedData = [];
    let colMap = { date: -1, share: -1, amount: -1, type: -1, qty: -1, price: -1 };
    let headerIdx = -1;

    for (let i = 0; i < rows.length; i++) {
        if (!rows[i] || rows[i].length < 3) continue; 
        const row = rows[i].map(c => String(c || '').toLowerCase().trim());
        
        const hasHeaderMatch = row.some(c => 
            c.includes('symbol') || c.includes('scrip') || c.includes('scheme') || 
            c.includes('description') || c.includes('particulars') || c.includes('isin')
        );

        if (hasHeaderMatch) {
            console.log("DEBUG: Found Header at Row:", i, row);
            headerIdx = i;
            row.forEach((c, idx) => {
                if (c.includes('date')) colMap.date = idx;
                if (c.includes('symbol') || c.includes('scrip') || c.includes('scheme') || c.includes('description') || c.includes('particulars')) colMap.share = idx;
                if (c.includes('amount') || c.includes('total') || c.includes('net') || c.includes('settlement') || c.includes('value')) colMap.amount = idx;
                if (c.includes('type') || c.includes('side') || c.includes('transaction')) colMap.type = idx;
                if (c.includes('qty') || c.includes('units') || c.includes('quantity')) colMap.qty = idx;
                if (c.includes('price') || c.includes('rate') || c.includes('nav')) colMap.price = idx;
            });
            break;
        }
    }

    if (headerIdx === -1) {
        console.error("DEBUG FAIL: No headers found.");
        alert("Could not detect the table headers. Ensure your file has columns like 'Date' and 'Scheme'.");
        return;
    }

    rows.slice(headerIdx + 1).forEach((row, idx) => {
        const share = row[colMap.share];
        if (!share || String(share).trim() === "") return;

        const qty = parseFloat(String(row[colMap.qty] || 0).replace(/,/g, ''));
        const price = parseFloat(String(row[colMap.price] || 0).replace(/,/g, ''));
        let amt = parseFloat(String(row[colMap.amount] || 0).replace(/,/g, '')) || (qty * price);
        
        const type = String(row[colMap.type] || '').toLowerCase();
        if (type.includes('sell') || type.includes('redemption') || type === 's' || type.includes('out')) {
            amt = -Math.abs(amt);
        }

        if (!isNaN(amt) && amt !== 0) {
            parsedData.push({
                tempId: idx,
                date: formatDate(row[colMap.date]),
                share: String(share).toUpperCase().trim(),
                amount: amt,
                rawRow: row
            });
        }
    });

    console.log("DEBUG SUCCESS: Parsed Items:", parsedData.length);
    displayPreview();
}

function displayPreview() {
    const body = document.getElementById('preview-body');
    body.innerHTML = parsedData.map(d => `
        <tr id="row-${d.tempId}" style="border-bottom: 1px solid #334155;">
            <td style="padding: 12px 10px;">${d.date}</td>
            <td style="padding: 12px 10px;">${d.share}</td>
            <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: ${d.amount > 0 ? '#4ade80' : '#f87171'};">
                ₹${Math.abs(d.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </td>
            <td style="padding: 12px 10px; text-align: center;">
                <button onclick="removeRow(${d.tempId})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.8rem; font-weight:bold;">Delete</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('mapping-section').style.display = 'block';
    document.getElementById('dropzone').style.display = 'none';
}

function removeRow(id) {
    parsedData = parsedData.filter(d => d.tempId !== id);
    const el = document.getElementById('row-' + id);
    if (el) el.remove();
    if (parsedData.length === 0) resetPage();
}

async function startImport() {
    if (!currentGoalId) { alert("Goal ID missing. Return to dashboard and try again."); return; }
    
    const btnId = lastAction === 'finish' ? 'btn-import-finish' : 'btn-import-more';
    const btn = document.getElementById(btnId);
    const countReq = parsedData.length;

    btn.innerText = "Processing...";
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
    btn.style.opacity = "0.5";

    const { data: { session } } = await supabase.auth.getSession();
    
    // Corrected variable hoisting
    const entries = parsedData.map(d => ({
        user_id: session.user.id,
        goal_id: currentGoalId,
        transaction_date: d.date,
        amount: d.amount,
        share_name: d.share,
        source_hash: generateRowHash(d.rawRow, session.user.id)
    }));

    console.log("DEBUG: Attempting to save these entries:", entries);

    const { error, count } = await supabase.from('transactions').upsert(entries, { 
        onConflict: 'user_id,source_hash', 
        ignoreDuplicates: true, 
        count: 'exact' 
    });

    if (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.innerText = "Try Again";
    } else {
        const actualCount = count || 0;
        const diff = countReq - actualCount;
        if (lastAction === 'more') {
            showToast(diff > 0 ? `✅ ${actualCount} Saved. ⚠️ ${diff} Duplicates Ignored.` : "✅ Successfully Imported!");
            resetPage();
        } else {
            if (diff > 0) alert(`${diff} duplicate transactions were skipped.`);
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

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DEBUG: Page Loaded. Goal ID from URL:", currentGoalId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (!currentGoalId) {
        document.getElementById('goal-info-header').innerText = "⚠️ No Goal Selected!";
        return;
    }

    const { data: goal, error } = await supabase.from('goals').select('goal_name').eq('id', currentGoalId).single();
    
    if (error) {
        console.error("DEBUG: Supabase Error:", error);
        document.getElementById('goal-info-header').innerText = "❌ Error loading goal context.";
    } else if (goal) {
        document.getElementById('goal-info-header').innerText = `🎯 Goal: ${goal.goal_name}`;
    }
});
</script>
