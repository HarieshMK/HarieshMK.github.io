---
layout: default
title: Transaction History
permalink: /goal-history/
---

<div class="dashboard-container" style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <button onclick="window.history.back()" style="background:none; border:none; color:#38bdf8; cursor:pointer;">← Back to Dashboard</button>
        <h2 id="goal-title">Transaction History</h2>
    </div>

    <div class="post-card">
        <table style="width: 100%; border-collapse: collapse; color: white; font-size: 0.9rem;">
            <thead>
                <tr style="border-bottom: 2px solid #333; color: #64748b; text-align: left;">
                    <th style="padding: 10px;">Date</th>
                    <th style="padding: 10px;">Amount</th>
                    <th style="padding: 10px; text-align: right;">Action</th>
                </tr>
            </thead>
            <tbody id="history-table-body">
                </tbody>
        </table>
        <p id="empty-msg" style="display:none; text-align:center; padding: 20px; color: #64748b;">No transactions recorded for this goal.</p>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('goal_id');

    if (!goalId) { window.location.href = "/dashboard/"; return; }

    // Fetch transactions for this goal, sorted by date descending
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
        row.innerHTML = `
            <td style="padding: 12px;">${new Date(t.transaction_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
            <td style="padding: 12px;">₹${Math.round(t.amount).toLocaleString('en-IN')}</td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="deleteRow('${t.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

async function deleteRow(id) {
    if (!confirm("Delete this transaction?")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(error.message);
    else location.reload();
}
</script>
