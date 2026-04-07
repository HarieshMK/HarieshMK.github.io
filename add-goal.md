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
                <input type="number" id="inflation_rate" value="6" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Start Date</label>
                <input type="date" id="start_date" required style="width: 100%; padding: 10px; margin-bottom: 5px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
            <div>
                <label>Target Date (Maturity)</label>
                <input type="date" id="target_date" required style="width: 100%; padding: 10px; margin-bottom: 5px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>
        
        <div id="goal-duration-text" style="font-size: 0.8rem; color: #94a3b8; font-style: italic; margin-bottom: 15px; text-align: right; display: none;"></div>

        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">

        <h3>🚀 Investment Strategy</h3>
        
        <div style="margin-bottom: 15px;">
            <label>AMC / Broker / Platform <span style="color: #ef4444;">*</span></label>
            <input type="text" id="broker_name" placeholder="e.g. Zerodha, HDFC Bank, ICICI Prudential, etc." required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            <p style="font-size: 0.7rem; color: #64748b; margin-top: 5px;">Used to group investments for accurate XIRR and value tracking.</p>
        </div>

        <label>Select Instrument</label>
        <select id="instrument_select" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            <option value="" disabled selected>Choose an instrument...</option>
        </select>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Investment Mode</label>
                <select id="investment_mode" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    <option value="SIP">SIP</option>
                    <option value="Lumpsum">Lumpsum</option>
                    <option value="Manual">Manual</option>
                </select>
            </div>
            <div>
                <label id="amount_label">Monthly SIP Amount</label>
                <input type="number" id="investment_amount" placeholder="₹ per month" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <div id="sip_date_container" style="margin-bottom: 15px;">
            <label>Preferred SIP Day (1-31)</label>
            <input type="number" id="sip_date" min="1" max="31" placeholder="e.g. 5" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            <p style="font-size: 0.75rem; color: #64748b; margin-top: 5px;">Required for SIP mode.</p>
        </div>

        <div>
            <label>Expected Returns (%)</label>
            <input type="number" id="expected_returns" step="any" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
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
    const sipDateContainer = document.getElementById('sip_date_container');
    const sipDateInput = document.getElementById('sip_date');
    const startDateInput = document.getElementById('start_date');
    const targetDateInput = document.getElementById('target_date');
    const durationDisplay = document.getElementById('goal-duration-text');

   // 1. Setup Instrument Dropdown
        Object.keys(InvestmentRegistry).forEach(option => {
            const asset = InvestmentRegistry[option];
            
            // Only show if it's explicitly marked as an investment
            if (asset.isInvestment === true) {
                let el = document.createElement('option');
                el.textContent = option;
                el.value = option;
                select.appendChild(el);
            }
        });

    // 2. Duration Logic
    function updateDuration() {
        const start = new Date(startDateInput.value);
        const end = new Date(targetDateInput.value);
        if (startDateInput.value && targetDateInput.value && end > start) {
            const diffYears = ((end - start) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
            durationDisplay.innerText = `* Planned for ${diffYears} years`;
            durationDisplay.style.display = 'block';
        } else {
            durationDisplay.style.display = 'none';
        }
    }
    startDateInput.addEventListener('change', updateDuration);
    targetDateInput.addEventListener('change', updateDuration);

    // 3. Handle UI Changes
    select.addEventListener('change', (e) => {
        if (InvestmentRegistry[e.target.value]) {
            document.getElementById('expected_returns').value = InvestmentRegistry[e.target.value].returns;
        }
    });

    modeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === "SIP") {
            amountLabel.innerText = "Monthly SIP Amount";
            amountInput.placeholder = "₹ per month";
            amountInput.disabled = false;
            amountInput.required = true;
            sipDateContainer.style.display = "block";
            sipDateInput.required = true;
        } else if (val === "Lumpsum") {
            amountLabel.innerText = "Lumpsum Amount";
            amountInput.placeholder = "₹ one-time";
            amountInput.disabled = false;
            amountInput.required = true;
            sipDateContainer.style.display = "none";
            sipDateInput.required = false;
            sipDateInput.value = "";
        } else {
            amountLabel.innerText = "Manual Mode";
            amountInput.placeholder = "Log via dashboard";
            amountInput.disabled = true;
            amountInput.required = false;
            amountInput.value = "";
            sipDateContainer.style.display = "none";
            sipDateInput.required = false;
            sipDateInput.value = "";
        }
    });

    // 4. Form Submission
    document.getElementById('goal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Manual Validation Check
        if (modeSelect.value === 'SIP' && !sipDateInput.value) {
            alert("Please provide a Preferred SIP Day.");
            return;
        }

        const btn = document.getElementById('submit-btn');
        btn.innerText = "Saving...";
        btn.disabled = true;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { 
            alert("Please login first!"); 
            btn.disabled = false;
            btn.innerText = "Save Goal & Start Tracking";
            return; 
        }

        const userId = session.user.id;
        const brokerName = document.getElementById('broker_name').value.trim();

        // --- STEP A: Create Goal ---
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

        const goalId = goalData[0].id;
        const startDateVal = document.getElementById('start_date').value;
        const start = new Date(startDateVal);
        const today = new Date();
        const sipAmount = parseFloat(amountInput.value) || 0;
        const preferredDay = (modeSelect.value === 'SIP' && sipDateInput.value) ? parseInt(sipDateInput.value) : start.getDate();

        // --- STEP B: Generate Transaction History ---
        let transactionsToInsert = [];
        if (modeSelect.value === 'SIP') {
            let monthOffset = 0;
            while (true) {
                let nextDate = new Date(start.getFullYear(), start.getMonth() + monthOffset, preferredDay);
                if (nextDate > today) break;
                transactionsToInsert.push({
                    goal_id: goalId,
                    user_id: userId,
                    transaction_date: nextDate.toISOString().split('T')[0],
                    amount: sipAmount,
                });
                monthOffset++;
                if (monthOffset > 600) break;
            }
        } else if (modeSelect.value === 'Lumpsum') {
            transactionsToInsert.push({
                goal_id: goalId,
                user_id: userId,
                transaction_date: start.toISOString().split('T')[0],
                amount: sipAmount,
            });
        }

        // --- STEP C: Create Allocation ---
        const { error: allocError } = await supabase
            .from('goal_allocations')
            .insert([{
                goal_id: goalId,
                user_id: userId,
                broker_name: brokerName,
                instrument_name: select.value,
                investment_mode: modeSelect.value,
                expected_returns: document.getElementById('expected_returns').value,
                allocation_start_date: startDateVal,
                current_value_override: modeSelect.value === 'Lumpsum' ? sipAmount : 0,
                monthly_investment: modeSelect.value === 'SIP' ? sipAmount : 0,
                sip_date: modeSelect.value === 'SIP' ? preferredDay : null
            }]);

        // --- STEP D: Insert Transactions ---
        if (transactionsToInsert.length > 0) {
            const { error: transError } = await supabase.from('transactions').insert(transactionsToInsert);
            if (transError) console.error("Transaction Error:", transError);
        }

        if (allocError) {
            alert("Goal created, but error adding allocation: " + allocError.message);
            btn.disabled = false;
            btn.innerText = "Save Goal & Start Tracking";
        } else {
            alert("Goal Created Successfully!");
            window.location.href = "/dashboard/";
        }
    });
</script>
