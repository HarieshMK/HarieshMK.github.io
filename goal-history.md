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
                📥 CSV
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
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('goal_id');
    if (!goalId) { window.location.href = "/dashboard/"; return; }

    const { data: goal, error } = await supabase
        .from('goals')
        .select('*, goal_allocations (*), transactions (*)')
        .eq('id', goalId)
        .single();

    if (error || !goal) return;

    document.getElementById('goal-title').innerText = goal.goal_name;
    const tbody = document.getElementById('history-table-body');
    let combinedHistory = [];

    goal.goal_allocations.forEach(alloc => {
        if (alloc.investment_mode === 'SIP') {
            const startDate = new Date(alloc.allocation_start_date);
            const today = new Date();
            const preferredDay = alloc.sip_date || startDate.getDate(); 
            
            // 1st Transaction: Actual Start Date
            combinedHistory.push({
                date: new Date(startDate),
                type: 'SIP (Initial)',
                amount: parseFloat(alloc.monthly_investment),
                id: null
            });

            // Subsequent Transactions: Snap to preferred day
            let nextDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, preferredDay);
            
          // Subsequent Transactions: Snap to preferred day with natural rollover
            let monthOffset = 1;
            let nextDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, preferredDay);

            while (nextDate <= today) {
                combinedHistory.push({
                    date: new Date(nextDate),
                    type: 'SIP (Auto)',
                    amount: parseFloat(alloc.monthly_investment),
                    id: null
                });
                
                // Always calculate from the original Start Date + Offset
                // This ensures if Feb rolls to March 1st, the next month still targets the 31st (May)
                monthOffset++;
                nextDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, preferredDay);
            }
        } else if (alloc.investment_mode === 'Lumpsum') {
            combinedHistory.push({
                date: new Date(alloc.allocation_start_date),
                type: 'Lumpsum',
                amount: parseFloat(alloc.current_value_override || 0),
                id: null
            });
        }
    });

    if (goal.transactions) {
        goal.transactions.forEach(t => {
            combinedHistory.push({ date: new Date(t.transaction_date), type: 'Manual Log', amount: parseFloat(t.amount), id: t.id });
        });
    }

    combinedHistory.sort((a, b) => b.date - a.date);
    renderRows(combinedHistory);
    window.currentHistoryData = combinedHistory;
});

function renderRows(data) {
    const tbody = document.getElementById('history-table-body');
    if (data.length === 0) { document.getElementById('empty-msg').style.display = "block"; return; }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #1e293b";
        row.innerHTML = `
            <td style="padding: 15px 20px;">${item.date.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
            <td style="padding: 15px 20px;">
                <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; border: 1px solid #64748b; color: #64748b; text-transform: uppercase;">${item.type}</span>
            </td>
            <td style="padding: 15px 20px; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono', monospace;">₹${Math.round(item.amount).toLocaleString('en-IN')}</td>
            <td style="padding: 15px 20px; text-align: right;">
                ${item.id ? `<button onclick="deleteRow('${item.id}')" style="background:rgba(239, 68, 68, 0.1); border:1px solid #ef4444; color:#ef4444; border-radius:4px; cursor:pointer; padding:4px 8px;">🗑️</button>` : `<span style="color:#475569; font-size: 0.8rem;">🔒</span>`}
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
        csvContent += `${formattedDate},${item.type},${item.amount}\n`;
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
    if (!confirm("Are you sure? This will remove this manual entry.")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else location.reload();
}
</script>
