---
layout: default
title: Edit Goal
permalink: /edit-goal/
---

<div class="post-card" style="max-width: 600px; margin: 20px auto;">
    <h2 id="page-title">🛠 Edit Your Goal</h2>
    
    <div id="choice-section" style="margin-bottom: 30px;">
        <p style="color: #64748b;">How would you like to apply these changes?</p>
        
        <div onclick="selectMode('mistake')" class="mode-card" style="border: 1px solid #333; padding: 15px; border-radius: 8px; cursor: pointer; margin-bottom: 10px; transition: 0.3s;">
            <strong style="color: #ef4444;">🔴 Fix a Mistake</strong>
            <p style="font-size: 0.85rem; margin: 5px 0 0; color: #94a3b8;">I entered wrong info. Delete my history and re-write everything from the start.</p>
        </div>

        <div onclick="selectMode('strategy')" class="mode-card" style="border: 1px solid #333; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
            <strong style="color: #3b82f6;">🔵 Update Strategy</strong>
            <p style="font-size: 0.85rem; margin: 5px 0 0; color: #94a3b8;">I am changing my plan (e.g. SIP Step-up). Keep my history; only change future months.</p>
        </div>
    </div>

    <form id="goal-form" style="display: none;">
        <input type="hidden" id="edit_mode">

        <div id="manual-warning" style="display: none; background: rgba(234, 179, 8, 0.1); border: 1px solid #eab308; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.85rem; color: #eab308;">
            <strong>Note:</strong> For Manual goals, changing settings here only updates the goal's targets. To fix specific past entries, please use the <strong>Transaction History</strong> page.
        </div>

        <div id="effective-date-container" style="display: none; background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <label style="color: #3b82f6;">📅 When should this change start?</label>
            <input type="date" id="effective_date" style="width: 100%; padding: 10px; margin-top: 5px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
        </div>

        <label>Goal Name</label>
        <input type="text" id="goal_name" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <label>Target Amount</label>
                <input type="number" id="target_price" required style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
            <div>
                <label>Expected Returns (%)</label>
                <input type="number" id="expected_returns" step="any" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>
        </div>

        <label id="start_date_label">Start Date</label>
        <input type="date" id="start_date" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <label id="amount_label">Monthly SIP Amount</label>
        <input type="number" id="investment_amount" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <button type="submit" id="submit-btn" class="btn" style="width: 100%; cursor: pointer; padding: 12px; font-weight: bold;">Apply Changes</button>
        <p onclick="location.reload()" style="text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 15px; cursor: pointer;">← Change Mode</p>
    </form>
</div>

<script>
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('id');

    // 1. Initial Load & Auto-Routing
    window.onload = async function() {
        const { data, error } = await supabase
            .from('goals')
            .select(`*, goal_allocations(*)`)
            .eq('id', goalId)
            .single();

        if (data) {
            const mode = data.goal_allocations[0].investment_mode;
            
            // AUTO-ROUTING LOGIC
            if (mode === 'Lumpsum' || mode === 'Manual') {
                // Skip Choice Section for non-SIP goals
                selectMode('mistake'); 
            } else {
                // Stay on choice section for SIP
                document.getElementById('choice-section').style.display = 'block';
            }
            
            fillFormData(data);
        }
    };

    function fillFormData(data) {
    const goalNameInput = document.getElementById('goal_name');
    const targetPriceInput = document.getElementById('target_price');
    const startDateInput = document.getElementById('start_date');
    const amountInput = document.getElementById('investment_amount');
    const amountLabel = document.getElementById('amount_label');
    const manualWarning = document.getElementById('manual-warning');

    // Fill basic info
    goalNameInput.value = data.goal_name;
    targetPriceInput.value = data.target_price;
    startDateInput.value = data.start_date;
    
    const alloc = data.goal_allocations[0];
    document.getElementById('expected_returns').value = alloc.expected_returns;
    const mode = alloc.investment_mode;

    // Logic for different Investment Modes
    if (mode === 'Manual') {
        manualWarning.style.display = 'block';
        amountInput.style.display = 'none'; // Hide amount for manual
        if(amountLabel) amountLabel.style.display = 'none';
    } else if (mode === 'Lumpsum') {
        manualWarning.style.display = 'none';
        amountLabel.innerText = "Lumpsum Amount";
        amountInput.value = alloc.current_value_override;
        amountInput.disabled = false;
    } else {
        // SIP Mode
        manualWarning.style.display = 'none';
        amountLabel.innerText = "Monthly SIP Amount";
        amountInput.value = alloc.monthly_investment;
        amountInput.disabled = false;
    }
}

    function selectMode(mode) {
        document.getElementById('choice-section').style.display = 'none';
        document.getElementById('goal-form').style.display = 'block';
        document.getElementById('edit_mode').value = mode;

        if (mode === 'strategy') {
            document.getElementById('page-title').innerText = "🔵 Update Strategy";
            document.getElementById('effective-date-container').style.display = 'block';
            document.getElementById('goal_name').readOnly = true;
            document.getElementById('start_date').readOnly = true;
            document.getElementById('start_date').style.opacity = '0.5';
        } else {
            document.getElementById('page-title').innerText = "🔴 Fix a Mistake";
            document.getElementById('effective-date-container').style.display = 'none';
        }
    }

    // 2. The Final Submission Brain
document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('edit_mode').value;
    const btn = document.getElementById('submit-btn');
    btn.innerText = "Applying...";
    btn.disabled = true;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session.user.id;

    // Fetch current values from the form
    const newName = document.getElementById('goal_name').value;
    const newTarget = parseFloat(document.getElementById('target_price').value);
    const newReturns = parseFloat(document.getElementById('expected_returns').value);
    const newAmount = parseFloat(document.getElementById('investment_amount').value) || 0;
    const newStart = document.getElementById('start_date').value;

    const { data: currentAlloc } = await supabase.from('goal_allocations').select('*').eq('goal_id', goalId).single();
    const investMode = currentAlloc.investment_mode;

    if (mode === 'mistake') {
        // --- PATH A: FIX A MISTAKE ---
        // 1. Update Goal Table (Name, Target, Start Date)
        await supabase.from('goals').update({ 
            goal_name: newName, 
            target_price: newTarget, 
            start_date: newStart 
        }).eq('id', goalId);

        // 2. Update Allocation Table (Returns + Amount)
        let allocUpdate = { 
            expected_returns: parseFloat(newReturns), // Force float precision
            allocation_start_date: newStart 
        };
        if (investMode === 'SIP') allocUpdate.monthly_investment = newAmount;
        if (investMode === 'Lumpsum') allocUpdate.current_value_override = newAmount;
        
        await supabase.from('goal_allocations').update(allocUpdate).eq('goal_id', goalId);

        // 3. Re-generate Transactions
        if (investMode !== 'Manual') {
            await supabase.from('transactions').delete().eq('goal_id', goalId);
            
            if (investMode === 'SIP') {
                let txs = [];
                let d = new Date(newStart);
                let today = new Date();
                let offset = 0;
                while (true) {
                    let next = new Date(d.getFullYear(), d.getMonth() + offset, d.getDate());
                    if (next > today) break;
                    txs.push({ goal_id: goalId, user_id: userId, transaction_date: next.toISOString().split('T')[0], amount: newAmount });
                    offset++;
                }
                if (txs.length > 0) await supabase.from('transactions').insert(txs);
            } else if (investMode === 'Lumpsum') {
                await supabase.from('transactions').insert([{ goal_id: goalId, user_id: userId, transaction_date: newStart, amount: newAmount }]);
            }
        }
    } else {
        // --- PATH B: UPDATE STRATEGY ---
        const effDate = document.getElementById('effective_date').value;
        if (!effDate) { alert("Please select an effective date!"); btn.disabled = false; return; }

        // 1. Update Goal Table (Target Amount might have changed too!)
        await supabase.from('goals').update({ target_price: newTarget }).eq('id', goalId);

        // 2. Update Allocation Table
        await supabase.from('goal_allocations').update({ 
            monthly_investment: newAmount, 
            expected_returns: newReturns, 
            last_strategy_update: effDate 
        }).eq('goal_id', goalId);

        // 3. Future Transactions
        await supabase.from('transactions').delete().eq('goal_id', goalId).gte('transaction_date', effDate);
        
        let txs = [];
        let d = new Date(effDate);
        let today = new Date();
        let offset = 0;
        while (true) {
            let next = new Date(d.getFullYear(), d.getMonth() + offset, d.getDate());
            if (next > today) break;
            txs.push({ goal_id: goalId, user_id: userId, transaction_date: next.toISOString().split('T')[0], amount: newAmount });
            offset++;
        }
        if (txs.length > 0) await supabase.from('transactions').insert(txs);
    }

    window.location.href = "/dashboard/";
});
</script>
