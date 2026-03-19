---
layout: default
title: Log Transaction
permalink: /log-transaction/
---

<div class="log-container" style="max-width: 600px; margin: 20px auto; padding: 0 20px;">
    
    <div class="post-card" style="margin-bottom: 30px;">
        <h2 style="margin-top: 0;">💸 Log Investment</h2>
        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 25px;">Record an actual investment made towards your goal.</p>

        <form id="transaction-form">
            <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Select Goal</label>
            <select id="goal_select" required style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none; appearance: none;">
                <option value="">Loading your goals...</option>
            </select>

            <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Investment Date</label>
            <input type="date" id="transaction_date" required style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Amount (₹)</label>
                    <input type="number" id="amount" placeholder="0.00" required style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;">
                </div>
                <div>
                    <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 5px;">Type</label>
                    <select id="transaction_type" style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;">
                        <option value="Buy">Buy / Invest</option>
                        <option value="Sell">Sell / Withdraw</option>
                    </select>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                <button type="submit" id="btn-another" class="btn" style="background: #0ea5e9; color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                    Save and Add Another
                </button>
                <button type="submit" id="btn-finish" style="background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                    Record and Finish
                </button>
            </div>
        </form>
    </div>

    <div style="border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #f1f5f9;">Recent Activity</h3>
            <span style="font-size: 0.75rem; color: #64748b; background: rgba(30, 41, 59, 0.8); padding: 2px 8px; border-radius: 4px;">Session Log</span>
        </div>
        
        <div id="recent-list" style="display: flex; flex-direction: column; gap: 10px;">
            <p id="no-recent" style="color: #475569; font-size: 0.85rem; font-style: italic; text-align: center; padding: 20px;">
                No transactions added in this session yet.
            </p>
        </div>
    </div>

</div>

<div id="toast" style="display: none; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 12px 24px; border-radius: 30px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000;">
    ✅ Transaction Saved!
</div>

<script>
    let lastClicked = 'another';

    document.addEventListener('DOMContentLoaded', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { window.location.href = "/login/"; return; }

        const goalSelect = document.getElementById('goal_select');
        const urlParams = new URLSearchParams(window.location.search);
        const preSelectedGoal = urlParams.get('goal_id');

        // Setup Button Clicks
        document.getElementById('btn-another').onclick = () => lastClicked = 'another';
        document.getElementById('btn-finish').onclick = () => lastClicked = 'finish';

        // Set default date to today
        document.getElementById('transaction_date').valueAsDate = new Date();

        // 1. Fetch Goals
        const { data: goals, error } = await supabase
            .from('goals')
            .select('id, goal_name')
            .eq('user_id', session.user.id);

        if (error || !goals) {
            goalSelect.innerHTML = '<option>Error loading goals</option>';
            return;
        }

        goalSelect.innerHTML = goals.map(g => 
            `<option value="${g.id}" ${g.id === preSelectedGoal ? 'selected' : ''}>${g.goal_name}</option>`
        ).join('');

        // 2. Handle Submission
        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('btn-another');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Saving...";
            submitBtn.disabled = true;

            const goalId = goalSelect.value;
            const goalName = goalSelect.options[goalSelect.selectedIndex].text;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('transaction_type').value;
            const date = document.getElementById('transaction_date').value;
            
            const finalAmount = type === 'Sell' ? -Math.abs(amount) : Math.abs(amount);

            const { error: transError } = await supabase
                .from('transactions')
                .insert([{
                    goal_id: goalId,
                    user_id: session.user.id,
                    transaction_date: date,
                    amount: finalAmount,
                    transaction_type: type
                }]);

            if (transError) {
                alert("Error: " + transError.message);
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            } else {
                // Update the bottom activity list
                updateActivityUI(goalName, finalAmount, date);

                if (lastClicked === 'finish') {
                    window.location.href = "/dashboard/";
                } else {
                    // Feedback and Reset
                    showToast();
                    document.getElementById('amount').value = '';
                    document.getElementById('amount').focus();
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                }
            }
        });
    });

    function showToast() {
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    function updateActivityUI(name, amount, date) {
        const list = document.getElementById('recent-list');
        const emptyMsg = document.getElementById('no-recent');
        if (emptyMsg) emptyMsg.remove();

        const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const color = amount >= 0 ? '#4ade80' : '#f87171';
        const prefix = amount >= 0 ? '+' : '';

        const entry = document.createElement('div');
        entry.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #1e293b; border-radius: 8px; border-left: 4px solid " + color + "; margin-bottom: 8px; animation: fadeIn 0.3s ease;";
        
        entry.innerHTML = `
            <div>
                <div style="font-size: 0.9rem; color: #f1f5f9; font-weight: 600;">${name}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${formattedDate}</div>
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: ${color}; font-weight: bold;">
                ${prefix}₹${Math.abs(amount).toLocaleString('en-IN')}
            </div>
        `;

        list.insertBefore(entry, list.firstChild);
        
        // Keep the list to a maximum of 5 items for cleanliness
        if (list.children.length > 5) {
            list.removeChild(list.lastChild);
        }
    }
</script>

<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
