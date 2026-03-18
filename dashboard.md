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

    <div style="display: flex; justify-content: center; margin-bottom: 30px; gap: 10px;">
        <button id="btn-group-goal" onclick="setDisplayMode('goal')" class="filter-btn active">Group by Goal</button>
        <button id="btn-group-asset" onclick="setDisplayMode('asset')" class="filter-btn">Group by Instrument</button>
    </div>

    <div id="dashboard-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
        <p id="loading-text">Fetching your financial data...</p>
    </div>
</div>

<style>
    .filter-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: 0.3s; font-size: 0.85rem; }
    .filter-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; font-weight: bold; }
    .child-row { background: rgba(15, 23, 42, 0.5); margin-top: 10px; padding: 15px; border-radius: 8px; border-left: 3px solid #0ea5e9; }
    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    .action-btn { font-size: 0.75rem; padding: 8px; background: transparent; border: 1px solid rgba(100, 116, 139, 0.3); color: #f1f5f9; cursor: pointer; border-radius: 6px; text-align: center; transition: 0.2s; }
    .action-btn:hover { border-color: #0ea5e9; background: rgba(14, 165, 233, 0.05); }
    .chevron { transition: transform 0.3s ease; cursor: pointer; font-size: 1.2rem; color: #64748b; }
    .chevron.open { transform: rotate(180deg); }
</style>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

async function deleteGoal(goalId) {
    if (!confirm("Are you sure? This will delete the goal and all recorded investments permanently.")) return;
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) { alert("Error deleting goal: " + error.message); } 
    else { location.reload(); }
}

function setDisplayMode(mode) {
    currentDisplayMode = mode;
    document.getElementById('btn-group-goal').classList.toggle('active', mode === 'goal');
    document.getElementById('btn-group-asset').classList.toggle('active', mode === 'asset');
    renderDashboard();
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

    rawGoalsData = goals;
    renderDashboard();
});

function renderDashboard() {
    const container = document.getElementById('dashboard-cards-container');
    const countEl = document.getElementById('total-goals-count');
    const netWorthEl = document.getElementById('total-net-worth');
    
    if (!rawGoalsData || rawGoalsData.length === 0) {
        container.innerHTML = "<p>No goals found. Start by adding one!</p>";
        return;
    }

    container.innerHTML = "";
    countEl.innerText = rawGoalsData.length;
    let overallNetWorth = 0;

    // --- 1. THE GROUPING ENGINE ---
    const groups = {};
    rawGoalsData.forEach(goal => {
        const alloc = goal.goal_allocations[0];
        const currentVal = calculateGoalValue(goal);
        overallNetWorth += currentVal;

        // Grouping key (Case-Insensitive)
        const key = (currentDisplayMode === 'goal' ? goal.goal_name : (alloc.instrument_name || 'Uncategorized')).toLowerCase();
        const displayName = currentDisplayMode === 'goal' ? goal.goal_name : (alloc.instrument_name || 'Uncategorized');

        if (!groups[key]) {
            groups[key] = {
                name: displayName,
                totalTarget: 0,
                totalCurrent: 0,
                items: []
            };
        }
        groups[key].totalTarget += parseFloat(goal.target_price || 0);
        groups[key].totalCurrent += currentVal;
        groups[key].items.push({ ...goal, currentVal });
    });

    netWorthEl.innerText = "₹" + Math.round(overallNetWorth).toLocaleString('en-IN');

    // --- 2. THE UI RENDERER ---
    Object.values(groups).forEach(group => {
        const progress = (group.totalCurrent / group.totalTarget) * 100;
        const groupID = group.name.replace(/\s+/g, '-').toLowerCase();
        const card = document.createElement('div');
        card.className = "post-card";
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-family: 'Lora', serif !important; font-size: 1.3rem;">${group.name}</h3>
                <span class="chevron" id="arrow-${groupID}" onclick="toggleDrawer('${groupID}')">▼</span>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px; font-weight: 700;">
                    <span style="color: #64748b;">Consolidated Progress</span>
                    <span style="color: #0ea5e9;">${progress.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #1e293b; height: 6px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${Math.min(progress, 100)}%; background: #0ea5e9; height: 100%;"></div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Total Value</span>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #4ade80;">₹${Math.round(group.totalCurrent).toLocaleString('en-IN')}</div>
                </div>
                <div style="text-align: right;">
                    <span id="xirr-btn-${groupID}" onclick="viewGroupXIRR('${groupID}')" style="font-size: 0.75rem; color: #0ea5e9; cursor: pointer; text-decoration: underline;">View XIRR</span>
                </div>
            </div>

            <div id="drawer-${groupID}" style="display: none; margin-top: 20px; border-top: 1px solid rgba(100, 116, 139, 0.1); padding-top: 10px;">
                ${group.items.map(item => `
                    <div class="child-row">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
                            <strong style="color: #cbd5e1;">${currentDisplayMode === 'goal' ? (item.goal_allocations[0].instrument_name || 'Asset') : item.goal_name}</strong>
                            <span style="color: #0ea5e9;">₹${Math.round(item.currentVal).toLocaleString('en-IN')}</span>
                        </div>
                        <div class="action-grid">
                            <button class="action-btn" onclick="window.location.href='/log-transaction/?goal_id=${item.id}'">Add transactions</button>
                            <button class="action-btn" onclick="window.location.href='/goal-history/?goal_id=${item.id}'">Transaction history</button>
                            <button class="action-btn" onclick="window.location.href='/edit-goal/?id=${item.id}'">Edit goal</button>
                            <button class="action-btn" onclick="deleteGoal('${item.id}')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Delete goal</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- UTILITY FUNCTIONS ---

function calculateGoalValue(goal) {
    let currentVal = 0;
    if (goal.transactions && goal.transactions.length > 0) {
        goal.transactions.forEach(trans => {
            const transDate = new Date(trans.transaction_date);
            const yearsSinceTrans = (new Date() - transDate) / (1000 * 60 * 60 * 24 * 365);
            const benchmarkReturn = parseFloat(goal.goal_allocations[0]?.expected_returns) || 12;
            const growthFactor = Math.pow(1 + (benchmarkReturn / 100), Math.max(0, yearsSinceTrans));
            currentVal += parseFloat(trans.amount) * growthFactor;
        });
    }
    return currentVal;
}

function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`);
    const a = document.getElementById(`arrow-${id}`);
    const isOpen = d.style.display === 'block';
    d.style.display = isOpen ? 'none' : 'block';
    a.classList.toggle('open', !isOpen);
    a.innerText = isOpen ? '▼' : '▲';
}

function viewGroupXIRR(id) {
    const btn = document.getElementById(`xirr-btn-${id}`);
    btn.innerText = "Calculating...";
    // Mock Delay for XIRR calculation
    setTimeout(() => {
        btn.innerText = "XIRR: 14.2%"; // In reality, you'd run your XIRR math here
        btn.style.textDecoration = "none";
        btn.style.color = "#4ade80";
    }, 800);
}
</script>
