---
layout: default
title: Add New Goal
permalink: /add-goal/
---

<div class="post-card" style="max-width: 600px; margin: 20px auto;">
    <h2 style="margin-top: 0;">🎯 Create a New Financial Goal</h2>
    <p style="color: #64748b;">Define your target and how you plan to achieve it.</p>

    <form id="goal-form">
        <label>Goal Name</label>
        <input type="text" id="goal_name" placeholder="e.g. Dream House, Kids Education" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Target Amount (Current Price)</label>
                <input type="number" id="target_price" placeholder="₹" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
            <div>
                <label>Inflation Rate (%)</label>
                <input type="number" id="inflation_rate" value="6" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Start Date</label>
                <input type="date" id="start_date" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
            <div>
                <label>Target Date (Maturity)</label>
                <input type="date" id="target_date" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">

        <h3>🚀 Initial Investment Option</h3>
        <p style="font-size: 0.85rem; color: #64748b;">You can add more options to this goal later from the dashboard.</p>
        
        <label>Select Instrument</label>
        <select id="instrument_select" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </select>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Investment Mode</label>
                <select id="investment_mode" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    <option value="SIP">Monthly SIP</option>
                    <option value="Manual">Manual Transactions</option>
                </select>
            </div>
            <div>
                <label>Expected Returns (%)</label>
                <input type="number" id="expected_returns" step="0.1" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #111; color: #888;" readonly>
            </div>
        </div>

        <button type="submit" id="submit-btn" class="btn" style="width: 100%; cursor: pointer;">Save Goal & Start Tracking</button>
    </form>
</div>

<script src="{{ '/assets/js/investment-options.js' | relative_url }}"></script>
<script>
    // 1. Populate the Dropdown from your Registry
    const select = document.getElementById('instrument_select');
    Object.keys(InvestmentRegistry).forEach(option => {
        let el = document.createElement('option');
        el.textContent = option;
        el.value = option;
        select.appendChild(el);
    });

    // 2. Automatically update returns when instrument changes
    select.addEventListener('change', (e) => {
        const selected = e.target.value;
        document.getElementById('expected_returns').value = InvestmentRegistry[selected].returns;
    });

    // Trigger initial value
    document.getElementById('expected_returns').value = InvestmentRegistry[select.value].returns;

    // 3. Form Submission Logic
    document.getElementById('goal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Saving...";

        // Step A: Get User Session (Babysitting check)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please login first!");
            window.location.href = "/login/";
            return;
        }

        const userId = session.user.id;

        // Step B: Save to 'goals' table
        const { data: goalData, error: goalError } = await supabase
            .from('goals')
            .insert([{
                user_id: userId,
                goal_name: document.getElementById('goal_name').value,
                target_price: document.getElementById('target_price').value,
                start_date: document.getElementById('start_date').value,
                target_date: document.getElementById('target_date').value,
                inflation_rate: document.getElementById('inflation_rate').value
            }])
            .select();

        if (goalError) {
            console.error(goalError);
            alert("Error saving goal");
            return;
        }

        // Step C: Save to 'goal_allocations' table
        const goalId = goalData[0].id;
        const { error: allocError } = await supabase
            .from('goal_allocations')
            .insert([{
                goal_id: goalId,
                user_id: userId,
                instrument_name: document.getElementById('instrument_select').value,
                investment_mode: document.getElementById('investment_mode').value,
                expected_returns: document.getElementById('expected_returns').value,
                allocation_start_date: document.getElementById('start_date').value
            }]);

        if (allocError) {
            alert("Goal created, but error adding investment option.");
        } else {
            alert("Goal Created Successfully!");
            window.location.href = "/dashboard/"; // We will build this next!
        }
        btn.innerText = "Save Goal & Start Tracking";
    });
</script>
