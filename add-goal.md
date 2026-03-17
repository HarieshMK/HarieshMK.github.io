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

        <h3>🚀 Investment Strategy</h3>
        
        <label>Select Instrument</label>
        <select id="instrument_select" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;"></select>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Investment Mode</label>
                <select id="investment_mode" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    <option value="SIP">Monthly SIP</option>
                    <option value="Lumpsum">One-time Lumpsum</option>
                    <option value="Manual">Manual (Self-Log)</option>
                </select>
            </div>
            <div>
                <label id="amount_label">Monthly SIP Amount</label>
                <input type="number" id="investment_amount" placeholder="₹ per month" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <div>
            <label>Expected Returns (%)</label>
            <input type="number" id="expected_returns" step="any" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
        </div>

        <button type="submit" id="submit-btn" class="btn" style="width: 100%; cursor: pointer;">Save Goal & Start Tracking</button>
    </form>
</div>

<script src="{{ '/assets/js/investment-options.js' | relative_url }}"></script>
<script>
    const select = document.getElementById('instrument_select');
    const modeSelect = document.getElementById('investment_mode');
    const amountLabel = document.getElementById('amount_label');
    const amountInput = document.getElementById('investment_amount');

    // 1. Setup Instrument Dropdown
    Object.keys(InvestmentRegistry).forEach(option => {
        let el = document.createElement('option');
        el.textContent = option;
        el.value = option;
        select.appendChild(el);
    });

    // 2. Handle UI Changes (Returns & Labels)
    select.addEventListener('change', (e) => {
        document.getElementById('expected_returns').value = InvestmentRegistry[e.target.value].returns;
    });
    document.getElementById('expected_returns').value = InvestmentRegistry[select.value].returns;

    modeSelect.addEventListener('change', (e) => {
        if (e.target.value === "SIP") {
            amountLabel.innerText = "Monthly SIP Amount";
            amountInput.placeholder = "₹ per month";
            amountInput.disabled = false;
        } else if (e.target.value === "Lumpsum") {
            amountLabel.innerText = "Lumpsum Amount";
            amountInput.placeholder = "₹ one-time";
            amountInput.disabled = false;
        } else {
            amountLabel.innerText = "Manual Mode";
            amountInput.placeholder = "Log via dashboard";
            amountInput.disabled = true;
            amountInput.value = "";
        }
    });

    // 3. Form Submission
    document.getElementById('goal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Saving...";
        btn.disabled = true;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert("Please login first!"); return; }

        const userId = session.user.id;

        // Step A: Create Goal
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
            alert("Error saving goal: " + goalError.message);
            btn.disabled = false;
            btn.innerText = "Save Goal & Start Tracking";
            return;
        }

        // Step B: Create Allocation (Now including current_value_override or amount logic)
        const goalId = goalData[0].id;
        const { error: allocError } = await supabase
            .from('goal_allocations')
            .insert([{
                goal_id: goalId,
                user_id: userId,
                instrument_name: select.value,
                investment_mode: modeSelect.value,
                expected_returns: document.getElementById('expected_returns').value,
                allocation_start_date: document.getElementById('start_date').value,
                // If Lumpsum, we treat the amount as the starting value
                current_value_override: modeSelect.value === 'Lumpsum' ? amountInput.value : 0
            }]);

        if (allocError) {
            alert("Goal created, but error adding allocation.");
        } else {
            alert("Goal Created Successfully!");
            window.location.href = "/dashboard/";
        }
    });
</script>
