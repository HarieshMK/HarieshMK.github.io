---
layout: default
title: Log Transaction
permalink: /log-transaction/
---

<div class="post-card" style="max-width: 600px; margin: 20px auto;">
    <h2 style="margin-top: 0;">💸 Log Investment</h2>
    <p style="color: #64748b;">Record an actual investment made towards your goal.</p>

    <form id="transaction-form">
        <label>Select Goal</label>
        <select id="goal_select" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            <option value="">Loading your goals...</option>
        </select>

        <label>Investment Date</label>
        <input type="date" id="transaction_date" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Amount (₹)</label>
                <input type="number" id="amount" placeholder="Amount invested" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
            <div>
                <label>Transaction Type</label>
                <select id="transaction_type" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    <option value="Buy">Buy / Invest</option>
                    <option value="Sell">Sell / Withdraw</option>
                </select>
            </div>
        </div>

        <button type="submit" id="submit-btn" class="btn" style="width: 100%; cursor: pointer;">Record Transaction</button>
    </form>
</div>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { window.location.href = "/login/"; return; }

        const goalSelect = document.getElementById('goal_select');
        const urlParams = new URLSearchParams(window.location.search);
        const preSelectedGoal = urlParams.get('goal_id');

        // Set default date to today
        document.getElementById('transaction_date').valueAsDate = new Date();

        // 1. Fetch Goals for the dropdown
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
            const btn = document.getElementById('submit-btn');
            btn.innerText = "Processing...";
            btn.disabled = true;

            const goalId = goalSelect.value;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('transaction_type').value;
            
            // Adjust amount if it's a 'Sell'
            const finalAmount = type === 'Sell' ? -Math.abs(amount) : Math.abs(amount);

            const { error: transError } = await supabase
                .from('transactions')
                .insert([{
                    goal_id: goalId,
                    user_id: session.user.id,
                    transaction_date: document.getElementById('transaction_date').value,
                    amount: finalAmount,
                    transaction_type: type
                }]);

            if (transError) {
                alert("Error logging transaction: " + transError.message);
                btn.disabled = false;
                btn.innerText = "Record Transaction";
            } else {
                alert("Transaction Logged!");
                window.location.href = "/dashboard/";
            }
        });
    });
</script>
