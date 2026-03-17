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
        <h2 id="goal-title" style="margin: 0; font-size: 1.2rem; color: #64748b;">Loading History...</h2>
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
                        <th style="padding: 15px 20px;">Amount</th>
                        <th style="padding: 15px 20px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody id="history-table-body">
                    </tbody>
            </table>
        </div>
        <p id="empty-msg" style="display:none; text-align:center; padding: 40px; color: #64748b; font-style: italic;">
            No transactions recorded for this goal yet.
        </p>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('goal_id');

    if (!goalId) { window.location.href = "/dashboard/"; return; }

    // 1. Fetch Goal Name for the Header
    const { data: goalData } = await supabase
        .from('goals')
        .select('goal_name')
        .eq('id', goalId)
        .single();

    if (goalData) {
        document.getElementById('goal-title').innerText = goalData.goal_name;
    }

    // 2. Fetch Transactions (Newest First)
    const { data: trans, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('goal_id', goalId)
        .order('transaction_date', { ascending: false });

    const tbody = document.getElementById('history-table-body');
    
    if (!trans || trans.length === 0) {
        document.getElementById('empty-msg').style.display = "block";
        return;
    }

    trans.forEach(t => {
        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #1e293b";
        row.style.transition = "background 0.2s";
        
        row.innerHTML = `
            <td style="padding: 15px 20px;">${new Date(t.transaction_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
            <td style="padding: 15px 20px; font-weight: bold; color: #4ade80;">₹${Math.round(t.amount).toLocaleString('en-IN')}</td>
            <td style="padding: 15px 20px; text-align: right;">
                <button onclick="deleteRow('${t.id}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; cursor: pointer; padding: 4px 8px; font-size: 0.9rem;" title="Delete Record">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

async function deleteRow(id) {
    if (!confirm("Are you sure you want to delete this transaction record? This cannot be undone.")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else location.reload();
}
</script>
