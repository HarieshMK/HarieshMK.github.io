---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<div id="asset-modal" style="display:none; position:fixed; z-index:1001; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
    <div class="post-card" style="max-width: 800px; margin: 50px auto; max-height: 80vh; overflow-y: auto; border: 1px solid #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">📈 Update Market Values</h2>
            <button onclick="closeAssetModal()" style="background:none; border:none; color:#64748b; font-size:1.5rem; cursor:pointer;">&times;</button>
        </div>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px;">Update the current values from your broker apps. Changes will reflect across all linked goals.</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid #334155; color: #64748b;">
                    <th style="padding: 10px;">S.No</th>
                    <th style="padding: 10px;">Broker</th>
                    <th style="padding: 10px;">Instrument</th>
                    <th style="padding: 10px;">Last Value</th>
                    <th style="padding: 10px;">Current Market Value</th>
                </tr>
            </thead>
            <tbody id="asset-table-body">
                </tbody>
        </table>

        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="closeAssetModal()" class="filter-btn">Cancel</button>
            <button id="save-assets-btn" onclick="saveMarketValues()" class="filter-btn active" style="padding: 8px 25px;">Save All Changes</button>
        </div>
    </div>
</div>

<div class="dashboard-container" style="padding: 20px; max-width: 1000px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="margin: 0;">📊 My Financial Goals</h2>
        <div style="display: flex; gap: 10px;">
            <button onclick="openAssetModal()" class="filter-btn" style="border-color: #4ade80; color: #4ade80;">Update Portfolio</button>
            <a href="/add-goal/" class="auth-link" style="text-decoration: none; border-color: #0ea5e9; color: #0ea5e9;">+ Add New Goal</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="post-card" style="text-align: center; margin-bottom: 0 !important;">
            <p style="color: #64748b; margin-bottom: 5px; font-size: 0.85rem; text-transform: uppercase;">Total Goals</p>
            <h3 id="total-goals-count" style="margin: 0; font-family: 'JetBrains Mono', monospace;">0</h3>
        </div>
        <div class="post-card" style="text-align: center; margin-bottom: 0 !important;">
            <p style="color: #64748b; margin-bottom: 5px; font-size: 0.85rem; text-transform: uppercase;">Est. Net Worth</p>
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
    /* Reuse styles from previous message */
    .filter-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: 0.3s; font-size: 0.85rem; }
    .filter-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; font-weight: bold; }
    .post-card { background: #000; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .child-item-row { padding: 12px 0; border-bottom: 1px solid rgba(100, 116, 139, 0.1); }
    .asset-input { background: #000; border: 1px solid #334155; color: #fff; padding: 5px 10px; border-radius: 4px; width: 120px; font-family: 'JetBrains Mono', monospace; }
    .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background-color: #1e293b;
    min-width: 140px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
    z-index: 1001;
    border: 1px solid #334155;
    border-radius: 8px;
    overflow: hidden;
}
.dropdown-content a {
    color: #cbd5e1;
    padding: 10px 15px;
    text-decoration: none;
    display: block;
    font-size: 0.85rem;
}
.dropdown-content a:hover {
    background-color: #334155;
}
</style>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

// --- ASSET MODAL LOGIC ---
function openAssetModal() {
    const uniqueAssets = {};
    rawGoalsData.forEach(goal => {
        if (goal.goal_allocations && goal.goal_allocations.length > 0) {
            goal.goal_allocations.forEach(alloc => {
                const key = (alloc.broker_name || 'Unspecified') + '|' + (alloc.instrument_name || 'Uncategorized');
                if (!uniqueAssets[key]) {
                    uniqueAssets[key] = {
                        broker: alloc.broker_name || 'Unspecified',
                        instrument: alloc.instrument_name || 'Uncategorized',
                        lastValue: alloc.current_value_override || 0
                    };
                }
            });
        }
    });

    const tbody = document.getElementById('asset-table-body');
    tbody.innerHTML = '';
    const assetKeys = Object.keys(uniqueAssets);
    
    if (assetKeys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No investments found.</td></tr>';
    } else {
        assetKeys.forEach((key, index) => {
            const asset = uniqueAssets[key];
            tbody.insertAdjacentHTML('beforeend', `
                <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.5);">
                    <td style="padding: 12px;">${index + 1}</td>
                    <td style="padding: 12px; color: #cbd5e1;">${asset.broker}</td>
                    <td style="padding: 12px; color: #cbd5e1;">${asset.instrument}</td>
                    <td style="padding: 12px; color: #64748b;">₹${Math.round(asset.lastValue).toLocaleString('en-IN')}</td>
                    <td style="padding: 12px;">
                        <input type="number" class="asset-input" data-key="${key}" value="${asset.lastValue}">
                    </td>
                </tr>
            `);
        });
    }
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() {
    document.getElementById('asset-modal').style.display = 'none';
}

async function saveMarketValues() {
    const btn = document.getElementById('save-assets-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    const inputs = document.querySelectorAll('.asset-input');
    const updates = Array.from(inputs).map(input => {
        const [broker, instrument] = input.getAttribute('data-key').split('|');
        const newValue = parseFloat(input.value) || 0;
        return supabase
            .from('goal_allocations')
            .update({ current_value_override: newValue })
            .match({ broker_name: broker, instrument_name: instrument });
    });

    try {
        await Promise.all(updates);
        location.reload(); 
    } catch (err) {
        alert("Error saving: " + err.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// --- MATH & UTILS ---
function normalizeKey(str) { return str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unknown'; }

function calculateXIRR(cashFlows, dates) {
    if (cashFlows.length < 2) return 0;
    let rate = 0.1; 
    for (let i = 0; i < 50; i++) {
        let f = 0, df = 0;
        for (let j = 0; j < cashFlows.length; j++) {
            const t = (dates[j] - dates[0]) / (31557600000); // ms in a year
            f += cashFlows[j] / Math.pow(1 + rate, t);
            df -= t * cashFlows[j] / Math.pow(1 + rate, t + 1);
        }
        let nextRate = rate - f / df;
        if (Math.abs(nextRate - rate) < 1e-5) return nextRate;
        rate = nextRate;
    }
    return rate;
}

function runXIRR(element, transactions, currentVal) {
    element.innerText = "...";
    setTimeout(() => {
        if (!transactions || transactions.length === 0) { element.innerText = "0%"; return; }
        const flows = transactions.map(t => -parseFloat(t.amount));
        const dates = transactions.map(t => new Date(t.transaction_date));
        flows.push(currentVal);
        dates.push(new Date());
        const result = calculateXIRR(flows, dates);
        element.innerText = (result * 100).toFixed(1) + "%";
        element.style.color = "#4ade80";
    }, 300);
}

function calculateGoalStats(goal) {
    let invested = 0, theoreticalValue = 0;
    if (goal.transactions && goal.transactions.length > 0) {
        const now = new Date();
        const benchmarkReturn = parseFloat(goal.goal_allocations?.[0]?.expected_returns) || 12;
        goal.transactions.forEach(trans => {
            const amt = parseFloat(trans.amount) || 0;
            invested += amt;
            const years = Math.max(0, (now - new Date(trans.transaction_date)) / 31557600000);
            theoreticalValue += amt * Math.pow(1 + (benchmarkReturn / 100), years);
        });
    }
    return { invested, theoreticalValue };
}

// --- RENDER & UI ---
function setDisplayMode(mode) {
    currentDisplayMode = mode;
    document.getElementById('btn-group-goal').classList.toggle('active', mode === 'goal');
    document.getElementById('btn-group-asset').classList.toggle('active', mode === 'asset');
    renderDashboard();
}

function renderDashboard() {
    const container = document.getElementById('dashboard-cards-container');
    const countEl = document.getElementById('total-goals-count');
    const netWorthEl = document.getElementById('total-net-worth');
    
    if (!rawGoalsData || rawGoalsData.length === 0) {
        container.innerHTML = "<p style='color:#64748b; text-align:center; grid-column: 1/-1;'>No goals found.</p>";
        return;
    }

    container.innerHTML = "";
    countEl.innerText = rawGoalsData.length;
    let overallNetWorth = 0;
    const buckets = {};
    const groups = {};

    rawGoalsData.forEach(goal => {
        const stats = calculateGoalStats(goal);
        (goal.goal_allocations || []).forEach(alloc => {
            const bucketKey = normalizeKey((alloc.broker_name || 'Unspecified') + (alloc.instrument_name || 'Uncategorized'));
            if (!buckets[bucketKey]) buckets[bucketKey] = { theoreticalTotal: 0, actualOverride: 0 };
            buckets[bucketKey].theoreticalTotal += stats.theoreticalValue;
            buckets[bucketKey].actualOverride = parseFloat(alloc.current_value_override) || 0;
        });
    });

    rawGoalsData.forEach(goal => {
        const stats = calculateGoalStats(goal);
        let finalValue = 0;
        if (goal.goal_allocations?.length > 0) {
            goal.goal_allocations.forEach(alloc => {
                const bucketKey = normalizeKey((alloc.broker_name || 'Unspecified') + (alloc.instrument_name || 'Uncategorized'));
                const bucket = buckets[bucketKey];
                const weight = bucket.theoreticalTotal > 0 ? (stats.theoreticalValue / bucket.theoreticalTotal) : 1;
                finalValue += bucket.actualOverride > 0 ? (bucket.actualOverride * weight) : stats.theoreticalValue;
            });
        } else {
            finalValue = stats.theoreticalValue;
        }

        goal.currentVal = finalValue;
        overallNetWorth += finalValue;

        const groupKey = currentDisplayMode === 'goal' ? goal.id : normalizeKey(goal.goal_allocations?.[0]?.instrument_name || 'Uncategorized');
        const displayName = currentDisplayMode === 'goal' ? goal.goal_name : (goal.goal_allocations?.[0]?.instrument_name || 'Uncategorized');

        if (!groups[groupKey]) groups[groupKey] = { name: displayName, id: groupKey, totalTarget: 0, totalCurrent: 0, totalInvested: 0, items: [], allTransactions: [] };
        
        groups[groupKey].totalTarget += parseFloat(goal.target_price || 0);
        groups[groupKey].totalCurrent += finalValue;
        groups[groupKey].totalInvested += stats.invested;
        groups[groupKey].allTransactions.push(...(goal.transactions || []));
        groups[groupKey].items.push(goal);
    });

    netWorthEl.innerText = "₹" + Math.round(overallNetWorth).toLocaleString('en-IN');

    Object.values(groups).forEach(group => {
        const progress = group.totalTarget > 0 ? Math.min((group.totalCurrent / group.totalTarget) * 100, 100) : 0;
        const gain = group.totalCurrent - group.totalInvested;
        const card = document.createElement('div');
        card.className = "post-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-family: 'Lora', serif; font-size: 1.4rem;">${group.name}</h3>
                <span id="arrow-${group.id}" onclick="toggleDrawer('${group.id}')" style="cursor: pointer; color:#64748b;">▼</span>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
                    <span style="color: #64748b; text-transform: uppercase;">Progress</span>
                    <span style="color: #0ea5e9; font-weight: bold;">${progress.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #1e293b; height: 6px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${progress}%; background: #0ea5e9; height: 100%;"></div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; border-top: 1px solid rgba(100, 116, 139, 0.1); padding-top: 15px;">
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase;">Invested</div>
                    <div style="font-size: 0.85rem; font-weight: bold; color: #cbd5e1; font-family: 'JetBrains Mono';">₹${Math.round(group.totalInvested).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase;">Current</div>
                    <div style="font-size: 0.85rem; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono';">₹${Math.round(group.totalCurrent).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase;">Gain</div>
                    <div style="font-size: 0.8rem; font-weight: bold; color: ${gain >= 0 ? '#4ade80' : '#f87171'};">
                        ${group.totalInvested > 0 ? ((gain / group.totalInvested) * 100).toFixed(1) : 0}%
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.65rem; color: #64748b; text-transform: uppercase;">XIRR</div>
                    <div id="xirr-btn-${group.id}" style="font-size: 0.8rem; color: #0ea5e9; cursor: pointer; text-decoration: underline;">View</div>
                </div>
            </div>
            <div id="drawer-${group.id}" style="display: none; margin-top: 15px; border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 10px;">
                ${group.items.map(item => `
                    <div class="child-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <div>
                            <div style="font-size: 0.9rem; font-weight: 500;">${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}</div>
                            <div style="font-size: 0.7rem; color: #64748b;">${item.goal_allocations?.[0]?.broker_name || ''}</div>
                        </div>
                        <div style="text-align: right; display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 0.85rem; font-family: 'JetBrains Mono'; color: #cbd5e1;">₹${Math.round(item.currentVal).toLocaleString('en-IN')}</div>
                            <button onclick="toggleMenu('${item.id}')" class="dots-btn" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:1.2rem;">⋮</button>
                            <div id="menu-${item.id}" class="dropdown-content" style="display:none; position:absolute; right:20px; background:#1e293b; border:1px solid #334155; z-index:100;">
                                <a href="/log-transaction/?goal_id=${item.id}" style="display:block; padding:8px; color:#fff; text-decoration:none;">Add Txn</a>
                                <a href="#" onclick="deleteGoal('${item.id}')" style="display:block; padding:8px; color:#ef4444; text-decoration:none;">Delete</a>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>
        `;
        container.appendChild(card);
        document.getElementById(`xirr-btn-${group.id}`).onclick = function() { runXIRR(this, group.allTransactions, group.totalCurrent); };
    });
}

function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`);
    const a = document.getElementById(`arrow-${id}`);
    const isOpen = d.style.display === 'block';
    d.style.display = isOpen ? 'none' : 'block';
    a.innerText = isOpen ? '▼' : '▲';
}

function toggleMenu(id) {
    const m = document.getElementById(`menu-${id}`);
    const isVisible = m.style.display === 'block';
    document.querySelectorAll('.dropdown-content').forEach(el => el.style.display = 'none');
    m.style.display = isVisible ? 'none' : 'block';
}

async function deleteGoal(id) {
    if (confirm("Delete this goal?")) {
        await supabase.from('goals').delete().eq('id', id);
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = "/login/";
    const { data: goals } = await supabase.from('goals').select('*, goal_allocations (*), transactions (*)').eq('user_id', session.user.id);
    rawGoalsData = goals || [];
    renderDashboard();
});
</script>
