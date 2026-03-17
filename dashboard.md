---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<div class="dashboard-container" style="padding: 20px; max-width: 1000px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2>📊 My Financial Goals</h2>
        <a href="/add-goal/" class="btn" style="text-decoration: none; font-size: 0.9rem;">+ Add New Goal</a>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="post-card" style="text-align: center;">
            <p style="color: #64748b; margin-bottom: 5px;">Total Goals</p>
            <h3 id="total-goals-count">0</h3>
        </div>
        <div class="post-card" style="text-align: center;">
            <p style="color: #64748b; margin-bottom: 5px;">Est. Net Worth</p>
            <h3 id="total-net-worth">₹0</h3>
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

        // SIP/Lumpsum Growth Math
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

        // Manual Transaction Growth Math
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

        // 2. UI Injection
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 style="margin: 0; color: #38bdf8;">${goal.goal_name}</h3>
                <span style="font-size: 0.75rem; background: #1e293b; padding: 4px 8px; border-radius: 4px;">
                    Due: ${new Date(goal.target_date).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}
                </span>
            </div>

            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-bottom: 5px;">
                    <span>Goal Progress</span>
                    <span>${progressPercent.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #1e293b; height: 6px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${Math.max(0, Math.min(progressPercent, 100))}%; background: #4ade80; height: 100%;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; background: #111; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <div>
                    <p style="color: #64748b; margin: 0;">Invested</p>
                    <p style="margin: 5px 0 0 0;">₹${Math.round(totalInvested).toLocaleString('en-IN')}</p>
                </div>
                <div>
                    <p style="color: #64748b; margin: 0;">Current Value</p>
                    <p style="margin: 5px 0 0 0; color: #4ade80; font-weight: bold;">₹${Math.round(currentPortfolioValue).toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="flex: 1.2; font-size: 0.75rem; white-space: nowrap;" onclick="window.location.href='/log-transaction/?goal_id=${goal.id}'">
                        Add Entry ➕
                    </button>
                    <button class="btn" style="flex: 1.8; font-size: 0.75rem; background: #1e293b; color: white; white-space: nowrap;" onclick="window.location.href='/goal-history/?goal_id=${goal.id}'">
                        Transaction History 📜
                    </button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="flex: 1; background: transparent; color: #ef4444; border: 1px solid #ef4444; font-size: 0.75rem;" onclick="deleteGoal('${goal.id}')">
                        🗑️ Delete Goal
                    </button>
                    <button class="btn" style="flex: 1; font-size: 0.75rem;" onclick="alert('Edit coming soon!')">
                        ✏️ Edit Goal
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    netWorthEl.innerText = "₹" + Math.round(overallNetWorth).toLocaleString('en-IN');
});
</script>
