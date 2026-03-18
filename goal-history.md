---
layout: default
title: All Transaction History
permalink: /goal-history/
---

<div class="dashboard-container" style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <button onclick="window.location.href='/dashboard/'" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
            <span style="font-size: 1.2rem;">←</span> Dashboard
        </button>
        <div style="display: flex; gap: 10px; align-items: center;">
            <button onclick="downloadCSV()" class="auth-link" style="font-size: 0.75rem; padding: 5px 10px; border-color: #4ade80; color: #4ade80; background: transparent; cursor: pointer;">
                📥 Download CSV
            </button>
            <h2 id="goal-title" style="margin: 0; font-size: 1.2rem; color: #64748b;">Loading History...</h2>
        </div>
    </div>

    <div class="post-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 20px; border-bottom: 1px solid #1e293b; background: #111;">
            <h3 style="margin: 0; font-size: 1rem;">📜 All Transaction History</h3>
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; color: white; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid #1e293b; color: #64748b; text-align: left; background: #0f172a;">
                        <th style="padding: 15px 20px;">Date</th>
                        <th style="padding: 15px 20px;">Type</th>
                        <th style="padding: 15px 20px;">Amount</th>
                        <th style="padding: 15px 20px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody id="history-table-body">
                </tbody>
            </table>
        </div>
        <p id="empty-msg" style="display:none; text-align:center; padding: 40px; color: #64748b; font-style: italic;">
            No transactions found for this goal yet.
        </p>
        <div id="edit-modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); align-items: center; justify-content: center;">
    <div class="post-card" style="width: 90%; max-width: 400px; padding: 25px; position: relative;">
        <h3 style="margin-top: 0; margin-bottom: 20px;">✏️ Edit Transaction</h3>
        
        <input type="hidden" id="edit-tx-id">
        
        <label style="display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 5px;">Transaction Date</label>
        <input type="date" id="edit-tx-date" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <label style="display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 5px;">Amount (₹)</label>
        <input type="number" id="edit-tx-amount" step="any" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button onclick="closeModal()" style="background: transparent; border: 1px solid #333; color: #64748b; padding: 10px; border-radius: 6px; cursor: pointer;">Cancel</button>
            <button id="save-tx-btn" onclick="saveTransactionUpdate()" class="btn" style="padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Save Changes</button>
        </div>
    </div>
</div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('goal_id');
    if (!goalId) { window.location.href = "/dashboard/"; return; }

    // 1. Fetch the goal name and all physical transactions
    const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('goal_name, transactions (*)')
        .eq('id', goalId)
        .single();

    if (goalError || !goal) {
        console.error("Error fetching history:", goalError);
        return;
    }

    document.getElementById('goal-title').innerText = goal.goal_name;
    const tbody = document.getElementById('history-table-body');
    
    // 2. Map transactions for the table
    let history = (goal.transactions || []).map(t => ({
        date: new Date(t.transaction_date),
        type: t.description || 'Investment', // Shows 'System Generated SIP', etc.
        amount: parseFloat(t.amount),
        id: t.id
    }));

    // 3. Sort by date descending (Newest first)
    history.sort((a, b) => b.date - a.date);

    // 4. Render Rows
    if (history.length === 0) {
        document.getElementById('empty-msg').style.display = "block";
    } else {
        renderRows(history);
    }

    window.currentHistoryData = history;
});

function renderRows(data) {
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = ''; 
    
    data.forEach(item => {
        // Format date for the input value (YYYY-MM-DD)
        const rawDate = item.date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format perfectly

        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #1e293b";
        row.innerHTML = `
            <td style="padding: 15px 20px;">${item.date.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
            <td style="padding: 15px 20px;">
                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; border: 1px solid #38bdf8; color: #38bdf8; text-transform: uppercase;">
                    ${item.type}
                </span>
            </td>
            <td style="padding: 15px 20px; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono', monospace;">
                ₹${Math.round(item.amount).toLocaleString('en-IN')}
            </td>
            <td style="padding: 15px 20px; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                <button onclick="openEditModal('${item.id}', '${rawDate}', ${item.amount})" 
                        style="background:rgba(56, 189, 248, 0.1); border:1px solid #38bdf8; color:#38bdf8; border-radius:4px; cursor:pointer; padding:4px 8px;">
                    ✏️
                </button>
                <span style="color: #1e293b;">|</span>
                <button onclick="deleteRow('${item.id}')" 
                        style="background:rgba(239, 68, 68, 0.1); border:1px solid #ef4444; color:#ef4444; border-radius:4px; cursor:pointer; padding:4px 8px;">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function downloadCSV() {
    const data = window.currentHistoryData;
    if (!data || data.length === 0) { alert("No data to download"); return; }

    let csvContent = "Date,Type,Amount\n";
    data.forEach(item => {
        const formattedDate = item.date.toISOString().split('T')[0];
        csvContent += `${formattedDate},"${item.type}",${item.amount}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `History_${document.getElementById('goal-title').innerText.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function deleteRow(id) {
    if (!confirm("Are you sure? This will remove this entry and affect your total returns (XIRR).")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else location.reload();
}
    function openEditModal(id, date, amount) {
    document.getElementById('edit-tx-id').value = id;
    document.getElementById('edit-tx-date').value = date;
    document.getElementById('edit-tx-amount').value = amount;
    
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function saveTransactionUpdate() {
    const id = document.getElementById('edit-tx-id').value;
    const newDate = document.getElementById('edit-tx-date').value;
    const newAmount = parseFloat(document.getElementById('edit-tx-amount').value);
    const btn = document.getElementById('save-tx-btn');

    if (!newDate || isNaN(newAmount)) {
        alert("Please enter valid data");
        return;
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    const { error } = await supabase
        .from('transactions')
        .update({ 
            transaction_date: newDate, 
            amount: newAmount 
        })
        .eq('id', id);

    if (error) {
        alert("Error updating transaction: " + error.message);
        btn.innerText = "Save Changes";
        btn.disabled = false;
    } else {
        location.reload(); // Refresh to show updated data
    }
}
</script>
