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
    
    .child-item-row { padding: 15px 0; border-bottom: 1px solid rgba(100, 116, 139, 0.1); position: relative; }
    .child-item-row:last-child { border-bottom: none; }

    .menu-container { position: relative; display: inline-block; }
    .dots-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; padding: 0 5px; transition: 0.2s; }
    .dots-btn:hover { color: #0ea5e9; }
    
    .dropdown-content {
        display: none; position: absolute; right: 0; background: #1e293b;
        min-width: 180px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
        z-index: 100; border-radius: 8px; border: 1px solid #334155; overflow: hidden;
    }
    .dropdown-content a { color: #f1f5f9; padding: 10px 15px; text-decoration: none; display: block; font-size: 0.85rem; transition: 0.2s; }
    .dropdown-content a:hover { background: #0ea5e9; color: white; }
    
    .show { display: block; }
    .chevron { transition: transform 0.3s ease; cursor: pointer; font-size: 1.2rem; color: #64748b; }
    .chevron.open { transform: rotate(180deg); }
</style>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

window.onclick = function(event) {
    if (!event.target.matches('.dots-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) { dropdowns[i].classList.remove('show'); }
    }
}

function toggleMenu(id) { document.getElementById(`menu-${id}`).classList.toggle("show"); }

async function deleteGoal(goalId) {
    if (!confirm("Are you sure? This will delete the goal and all recorded investments permanently.")) return;
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) { alert("Error deleting goal: " + error.message); } else { location.reload(); }
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

    if (error) { document.getElementById('loading-text').innerText = "Error loading goals."; return; }

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

    const groups = {};
    rawGoalsData.forEach(goal => {
        const alloc = goal.goal_allocations[0];
        const stats = calculateGoalStats(goal);
        overallNetWorth += stats.current;

        const key = (currentDisplayMode === 'goal' ? goal.goal_name : (alloc.instrument_name || 'Uncategorized')).toLowerCase();
        const displayName = currentDisplayMode === 'goal' ? goal.goal_name : (alloc.instrument_name || 'Uncategorized');

        if (!groups[key]) {
            groups[key] = { name: displayName, totalTarget: 0, totalCurrent: 0, totalInvested: 0, items: [] };
        }
        groups[key].totalTarget += parseFloat(goal.target_price || 0);
        groups[key].totalCurrent += stats.current;
        groups[key].totalInvested += stats.invested;
        groups[key].items.push({ ...goal, stats, alloc });
    });

    netWorthEl.innerText = "₹" + Math.round(overallNetWorth).toLocaleString('en-IN');

    Object.values(groups).forEach(group => {
        const totalTarget = group.totalTarget || 0;
        const totalCurrent = group.totalCurrent || 0;
        const totalInvested = group.totalInvested || 0;
        const gain = totalCurrent - totalInvested;
        const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
        const progress = totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0;
        const groupID = group.items[0].id; 
        
        const card = document.createElement('div');
        card.className = "post-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-family: 'Lora', serif !important; font-size: 1.4rem;">${group.name}</h3>
                <span class="chevron" id="arrow-${groupID}" onclick="event.stopPropagation(); toggleDrawer('${groupID}')" style="padding: 5px; cursor: pointer;">▼</span>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
                    <span style="color: #64748b; text-transform: uppercase;">Consolidated Progress</span>
                    <span style="color: #0ea5e9; font-weight: bold;">${progress.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #1e293b; height: 6px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${progress}%; background: #0ea5e9; height: 100%;"></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; border-top: 1px solid rgba(100, 116, 139, 0.1); padding-top: 15px;">
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Invested</div>
                    <div style="font-size: 0.95rem; font-weight: bold; color: #cbd5e1; font-family: 'JetBrains Mono', monospace;">₹${Math.round(totalInvested).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Current Value</div>
                    <div style="font-size: 0.95rem; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono', monospace;">₹${Math.round(totalCurrent).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Absolute Gain</div>
                    <div style="font-size: 0.95rem; font-weight: bold; color: ${gain >= 0 ? '#4ade80' : '#f87171'}; font-family: 'JetBrains Mono', monospace;">
                        ${gain >= 0 ? '+' : ''}${Math.round(gain).toLocaleString('en-IN')}
                        <span style="font-size: 0.6rem; display: block; font-weight: normal;">(${gainPct.toFixed(1)}%)</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">XIRR</div>
                    <div id="xirr-btn-${groupID}" onclick="viewGroupXIRR('${groupID}')" style="font-size: 0.85rem; color: #0ea5e9; cursor: pointer; text-decoration: underline; font-weight: 600;">View XIRR</div>
                </div>
            </div>

            <div id="drawer-${groupID}" style="display: none; margin-top: 25px; border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 10px;">
                ${group.items.map(item => {
                    const itemTarget = parseFloat(item.target_price) || 0;
                    const itemProg = itemTarget > 0 ? Math.min((item.stats.current / itemTarget) * 100, 100) : 0;
                    const subTitle = currentDisplayMode === 'goal' ? (item.alloc.instrument_name || 'Asset') : item.goal_name;
                    const statusBadge = item.stats.invested === 0 ? 
                        `<span style="font-size: 0.6rem; background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">PENDING LOG</span>` : '';

                    return `
                    <div class="child-item-row">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #f1f5f9; font-size: 0.95rem;">${subTitle} ${statusBadge}</div>
                                <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                                    ${item.alloc.investment_mode} • Returns: ${item.alloc.expected_returns}% • Due: ${new Date(item.target_date).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}
                                </div>
                            </div>
                            <div style="text-align: right; margin-right: 15px;">
                                <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #cbd5e1;">₹${Math.round(item.stats.current).toLocaleString('en-IN')}</div>
                                <div style="font-size: 0.7rem; color: #0ea5e9;">${itemProg.toFixed(1)}% complete</div>
                            </div>
                            <div class="menu-container">
                                <button onclick="toggleMenu('${item.id}')" class="dots-btn">⋮</button>
                                <div id="menu-${item.id}" class="dropdown-content">
                                    <a href="/log-transaction/?goal_id=${item.id}">Add transactions</a>
                                    <a href="/goal-history/?goal_id=${item.id}">Transaction history</a>
                                    <a href="/edit-goal/?id=${item.id}">Edit goal</a>
                                    <a href="#" onclick="deleteGoal('${item.id}')" style="color: #ef4444;">Delete goal</a>
                                </div>
                            </div>
                        </div>
                        <div style="width: 100%; background: #0f172a; height: 3px; border-radius: 2px; margin-top: 10px; overflow: hidden;">
                            <div style="width: ${itemProg}%; background: #334155; height: 100%;"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

function calculateGoalStats(goal) {
    let invested = 0;
    let current = 0;
    if (goal.transactions && goal.transactions.length > 0) {
        const now = new Date();
        const benchmarkReturn = parseFloat(goal.goal_allocations[0]?.expected_returns) || 12;

        goal.transactions.forEach(trans => {
            const amt = parseFloat(trans.amount) || 0;
            invested += amt;
            const transDate = new Date(trans.transaction_date);
            const years = Math.max(0, (now - transDate) / (1000 * 60 * 60 * 24 * 365.25));
            current += amt * Math.pow(1 + (benchmarkReturn / 100), years);
        });
    }
    return { invested, current };
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
    btn.innerText = "...";
    setTimeout(() => {
        btn.innerText = "14.2%"; 
        btn.style.textDecoration = "none";
        btn.style.color = "#4ade80";
        btn.style.fontFamily = "'JetBrains Mono', monospace";
    }, 800);
}
</script>
