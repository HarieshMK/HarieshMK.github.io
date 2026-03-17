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

    <div id="goals-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
        <p id="loading-text">Fetching your financial data...</p>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = "/login/";
        return;
    }

    // 2. Fetch Goals and their Allocations
    // We use a "Join" here to get the instrument details at the same time
    const { data: goals, error } = await supabase
        .from('goals')
        .select(`
            *,
            goal_allocations (*)
        `)
        .eq('user_id', session.user.id);

    if (error) {
        console.error("Fetch error:", error);
        document.getElementById('loading-text').innerText = "Error loading goals.";
        return;
    }

    const grid = document.getElementById('goals-grid');
    const countEl = document.getElementById('total-goals-count');
    
    if (goals.length === 0) {
        grid.innerHTML = "<p>No goals found. Start by adding one!</p>";
        return;
    }

    grid.innerHTML = ""; // Clear loading text
    countEl.innerText = goals.length;

    // 3. Loop through goals and create cards
    goals.forEach(goal => {
        const card = document.createElement('div');
        card.className = "post-card";
        
        // Simple Logic for Target with Inflation
        // Formula: FV = PV * (1 + r)^n
        const years = (new Date(goal.target_date) - new Date(goal.start_date)) / (1000 * 60 * 60 * 24 * 365);
        const inflatedPrice = goal.target_price * Math.pow((1 + (goal.inflation_rate/100)), years);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 style="margin: 0; color: #38bdf8;">${goal.goal_name}</h3>
                <span style="font-size: 0.75rem; background: #1e293b; padding: 4px 8px; border-radius: 4px;">
                    ${goal.target_date}
                </span>
            </div>
            <hr style="border: 0; border-top: 1px solid #333; margin: 15px 0;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                <div>
                    <p style="color: #64748b; margin: 0;">Target (Today)</p>
                    <p>₹${Number(goal.target_price).toLocaleString('en-IN')}</p>
                </div>
                <div>
                    <p style="color: #64748b; margin: 0;">Adjusted (Future)</p>
                    <p>₹${Math.round(inflatedPrice).toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div style="margin-top: 15px;">
                <p style="color: #64748b; margin: 0; font-size: 0.8rem;">Instruments</p>
                ${goal.goal_allocations.map(a => `
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 5px;">
                        <span>${a.instrument_name} (${a.investment_mode})</span>
                        <span style="color: #4ade80;">${a.expected_returns}%</span>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 20px;">
                <button class="btn" style="width: 100%; font-size: 0.8rem; padding: 8px;" onclick="alert('Transaction logging coming soon!')">
                    Log Transaction
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
});
</script>
