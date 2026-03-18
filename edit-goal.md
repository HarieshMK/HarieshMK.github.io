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

        <label>Monthly SIP Amount</label>
        <input type="number" id="investment_amount" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

        <button type="submit" id="submit-btn" class="btn" style="width: 100%; cursor: pointer; padding: 12px; font-weight: bold;">Apply Changes</button>
        <p onclick="location.reload()" style="text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 15px; cursor: pointer;">← Change Mode</p>
    </form>
</div>

<script>
    const urlParams = new URLSearchParams(window.location.search);
    const goalId = urlParams.get('id');

    // UI Toggle Function
    function selectMode(mode) {
        document.getElementById('choice-section').style.display = 'none';
        document.getElementById('goal-form').style.display = 'block';
        document.getElementById('edit_mode').value = mode;

        if (mode === 'strategy') {
            document.getElementById('page-title').innerText = "🔵 Update Strategy";
            document.getElementById('effective-date-container').style.display = 'block';
            // Disable historical fields
            document.getElementById('goal_name').readOnly = true;
            document.getElementById('start_date').readOnly = true;
            document.getElementById('start_date').style.opacity = '0.5';
        } else {
            document.getElementById('page-title').innerText = "🔴 Fix a Mistake";
            document.getElementById('effective-date-container').style.display = 'none';
        }
        loadExistingData();
    }

    async function loadExistingData() {
        const { data, error } = await supabase
            .from('goals')
            .select(`*, goal_allocations(*)`)
            .eq('id', goalId)
            .single();

        if (data) {
            document.getElementById('goal_name').value = data.goal_name;
            document.getElementById('target_price').value = data.target_price;
            document.getElementById('start_date').value = data.start_date;
            
            const alloc = data.goal_allocations[0];
            document.getElementById('expected_returns').value = alloc.expected_returns;
            document.getElementById('investment_amount').value = alloc.monthly_investment;
        }
    }

    // FORM SUBMISSION LOGIC (The "Brain")
    document.getElementById('goal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('edit_mode').value;
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Applying...";
        btn.disabled = true;

        if (mode === 'mistake') {
            // 1. Delete ALL old transactions for this goal
            await supabase.from('transactions').delete().eq('goal_id', goalId);
            
            // 2. Update Goal & Allocation with new values
            // ... (We will write the full UPDATE logic in the next step) ...
            alert("Mistake fixed! Re-generating history...");
        } else {
            // 1. Find and delete ONLY transactions AFTER the effective date
            const effDate = document.getElementById('effective_date').value;
            await supabase.from('transactions').delete().eq('goal_id', goalId).gte('transaction_date', effDate);
            
            // 2. Update Allocation & log the Strategy Change
            alert("Strategy Updated!");
        }
        window.location.href = "/dashboard/";
    });
</script>
