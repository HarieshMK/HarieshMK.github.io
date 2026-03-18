---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<div class="dashboard-container" style="padding: 20px; max-width: 1000px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="margin: 0;">📊 My Financial Goals</h2>
        <a href="/add-goal/" class="auth-link" style="text-decoration: none; border-color: #0ea5e9; color: #0ea5e9;">+ Add New Goal</a>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="post-card" style="text-align: center; margin-bottom: 0 !important;">
            <p style="color: #64748b; margin-bottom: 5px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Total Goals</p>
            <h3 id="total-goals-count" style="margin: 0; font-family: 'JetBrains Mono', monospace;">0</h3>
        </div>
        <div class="post-card" style="text-align: center; margin-bottom: 0 !important;">
            <p style="color: #64748b; margin-bottom: 5px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Est. Net Worth</p>
            <h3 id="total-net-worth" style="margin: 0; font-family: 'JetBrains Mono', monospace; color: #0ea5e9;">₹0</h3>
        </div>
    </div>

    <div id="goals-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
        <p id="loading-text">Fetching your financial data...</p>
    </div>
</div>

<script>
async function deleteGoal(goalId) {
    if (!confirm("Are you sure? This will delete the goal and all recorded investments permanently.")) return;
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) { alert("Error deleting goal: " + error.message); } 
    else { alert("Goal deleted successfully."); location.reload(); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login/"; return; }

    const { data: goals, error } = await supabase
        .from('goals')
        .select('*, goal_allocations (*), transactions (*)')
        .eq('user_id', session.user.id);

    if (error) {
        document.getElementById('loading-text').innerText = "Error loading goals.";
        return;
    }

    const grid = document.getElementById('goals-grid');
    const countEl = document.getElementById('total-goals-count');
    const netWorthEl = document.getElementById('total-net-worth');
    
    if (!goals || goals.length === 0) {
        grid.innerHTML = "<p>No goals found. Start by adding one!</p>";
        return;
    }

    grid.innerHTML = ""; 
    countEl.innerText = goals.length;
    let overallNetWorth = 0;

    goals.forEach(goal => {
        const card = document.createElement('div');
        card.className = "post-card";
        
        // 1. Calculations
        const yearsToGoal = (new Date(goal.target_date) - new Date(goal.start_date)) / (1000 * 60 * 60 * 24 * 365);
        const inflatedPrice = goal.target_price * Math.pow((1 + (goal.inflation_rate/100)), yearsToGoal);

        let totalInvested = 0;
        let currentPortfolioValue = 0;

        goal.goal_allocations.forEach(alloc => {
            const startDate = new Date(alloc.allocation_start_date);
            const today = new Date();
            const monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
            const monthlyRate = (parseFloat(alloc.expected_returns) / 100) / 12;

            if (alloc.investment_mode === 'SIP') {
                const monthlyAmt = parseFloat(alloc.monthly_investment || 0);
                totalInvested += monthlyAmt * (monthsPassed + 1); 
                if (monthlyRate > 0) {
                    currentPortfolioValue += monthlyAmt * ((Math.pow(1 + monthlyRate, monthsPassed + 1) - 1) / monthlyRate) * (1 + monthlyRate);
                } else {
                    currentPortfolioValue += monthlyAmt * (monthsPassed + 1);
                }
            } else if (alloc.investment_mode === 'Lumpsum') {
                const principal = parseFloat(alloc.current_value_override || 0);
                totalInvested += principal;
                currentPortfolioValue += principal * Math.pow(1 + (parseFloat(alloc.expected_returns) / 100), (monthsPassed / 12));
            }
        });

        if (goal.transactions && goal.transactions.length > 0) {
            goal.transactions.forEach(trans => {
                const transDate = new Date(trans.transaction_date);
                const today = new Date();
                const yearsSinceTrans = (today - transDate) / (1000 * 60 * 60 * 24 * 365);
                const benchmarkReturn = goal.goal_allocations[0]?.expected_returns || 12;
                const growthFactor = Math.pow(1 + (benchmarkReturn / 100), Math.max(0, yearsSinceTrans));
                totalInvested += parseFloat(trans.amount);
                currentPortfolioValue += parseFloat(trans.amount) * growthFactor;
            });
        }

        overallNetWorth += currentPortfolioValue;
        const progressPercent = (currentPortfolioValue / inflatedPrice) * 100;

        // 2. UI Injection with site-native classes
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px;">
                <h3 style="margin: 0; font-family: 'Lora', serif !important; font-size: 1.5rem;">${goal.goal_name}</h3>
                <span class="post-date" style="margin: 0 !important;">Due: ${new Date(goal.target_date).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}</span>
            </div>

            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; font-weight: 700;">
                    <span style="color: #64748b;">Goal Progress</span>
                    <span style="color: #0ea5e9;">${progressPercent.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #e2e8f0; height: 8px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${Math.max(0, Math.min(progressPercent, 100))}%; background: #0ea5e9; height: 100%;"></div>
                </div>
            </div>
            
            <div class="calc-results" style="flex-direction: row; padding: 15px; gap: 10px; margin-bottom: 25px; min-width: 0; background: var(--bg-color); border: 1px solid rgba(100, 116, 139, 0.1);">
                <div class="result-item" style="flex: 1; border: none; padding: 0;">
                    <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">Invested</span>
                    <strong style="font-size: 1.2rem; font-family: 'JetBrains Mono', monospace;">₹${Math.round(totalInvested).toLocaleString('en-IN')}</strong>
                </div>
                <div style="width: 1px; background: rgba(100, 116, 139, 0.2); align-self: stretch;"></div>
                <div class="result-item" style="flex: 1; border: none; padding: 0;">
                    <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">Current Value</span>
                    <strong style="font-size: 1.2rem; color: #0ea5e9 !important; font-family: 'JetBrains Mono', monospace;">₹${Math.round(currentPortfolioValue).toLocaleString('en-IN')}</strong>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <button class="auth-link" style="width: 100%; text-align: center; background: transparent; cursor: pointer;" onclick="window.location.href='/log-transaction/?goal_id=${goal.id}'">
                    Add transaction ➕
                </button>
                <button class="auth-link" style="width: 100%; text-align: center; background: transparent; cursor: pointer;" onclick="window.location.href='/goal-history/?goal_id=${goal.id}'">
                    Transaction history📜
                </button>
                <button class="auth-link" style="width: 100%; text-align: center; background: transparent; cursor: pointer;" 
                    onclick="window.location.href='/edit-goal/?id=${goal.id}'">
                    Edit goal ✏️
                </button>
                <button class="auth-link" style="width: 100%; text-align: center; border-color: #ef4444; color: #ef4444; background: transparent; cursor: pointer;" onclick="deleteGoal('${goal.id}')">
                    Delete goal 🗑️
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    netWorthEl.innerText = "₹" + Math.round(overallNetWorth).toLocaleString('en-IN');
});
</script>
