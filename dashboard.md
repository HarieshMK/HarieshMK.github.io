---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<style>
    /* Bridge between Dashboard and your Global CSS */
    :root {
        --d-accent: #0ea5e9;
        --d-accent-soft: rgba(14, 165, 233, 0.1);
        --d-card-bg: #ffffff;
        --d-border: #e2e8f0;
        --d-text-main: #0f172a;
        --d-text-muted: #64748b;
    }

    .dark-theme {
        --d-card-bg: #1e293b;
        --d-border: #334155;
        --d-text-main: #ffffff;
        --d-text-muted: #94a3b8;
    }

    /* Tighten the Dashboard Layout */
    .dashboard-container { 
        padding: 0 10px; 
        max-width: 1000px; 
        margin: 0 auto; 
    }

    /* Premium Card Overrides */
    .goal-card {
        background: var(--d-card-bg);
        border: 1px solid var(--d-border);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }
    .goal-card:hover {
        transform: translateY(-4px);
        border-color: var(--d-accent);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .active-card { border-color: var(--d-accent) !important; ring: 2px solid var(--d-accent); }

    /* Modern Progress Bar */
    .p-track { height: 8px; background: var(--d-border); border-radius: 10px; overflow: hidden; margin: 8px 0; }
    .p-fill { height: 100%; background: var(--d-accent); border-radius: 10px; transition: width 1s ease; }
    .child-track { height: 4px; background: rgba(0,0,0,0.05); }
    .dark-theme .child-track { background: rgba(255,255,255,0.05); }

    /* Remove that dotted line and make it a badge */
    .xirr-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--d-accent);
        background: var(--d-accent-soft);
        padding: 2px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: 0.2s;
        border: none; /* Fixes the dotted line issue */
    }
    .xirr-badge:hover { background: var(--d-accent); color: white; }

    /* Three Dots Button Modernization */
    .menu-btn {
        background: var(--d-border);
        border: none;
        color: var(--d-text-muted);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Dropdown UI */
    .drop-menu {
        display: none; position: absolute; right: 0; top: 35px; 
        background: var(--d-card-bg); border: 1px solid var(--d-border);
        min-width: 160px; z-index: 2000; border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden;
    }
    .drop-menu a { 
        display: block; padding: 10px 15px; font-size: 0.8rem; 
        color: var(--d-text-main); text-decoration: none !important;
    }
    .drop-menu a:hover { background: var(--d-accent-soft); color: var(--d-accent); }
    .show { display: block !important; }

    /* Modal Styling */
    .modal-overlay {
        display:none; position:fixed; z-index:5000; left:0; top:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
</style>

<div id="asset-modal" class="modal-overlay">
    <div class="goal-card" style="max-width: 600px; margin: 50px auto; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Update Market Values</h3>
            <button onclick="closeAssetModal()" style="background:none; border:none; color:var(--d-text-muted); font-size: 1.5rem; cursor:pointer;">&times;</button>
        </div>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr><th>Broker</th><th>Instrument</th><th style="text-align: right;">Current Value</th></tr>
                </thead>
                <tbody id="asset-table-body"></tbody>
            </table>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="closeAssetModal()" class="filter-btn">Cancel</button>
            <button id="save-assets-btn" onclick="saveMarketValues()" class="filter-btn active">Save All</button>
        </div>
    </div>
</div>

<div class="dashboard-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; margin-top: 20px;">
        <h2 style="margin: 0; font-family: 'Lora', serif;">Financial Goals</h2>
        <div style="display: flex; gap: 10px;">
            <button onclick="openAssetModal()" class="filter-btn" style="font-size: 0.75rem;">Update Values</button>
            <a href="/add-goal/" class="auth-link" style="font-size: 0.75rem; padding: 6px 15px;">+ New Goal</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
        <div class="goal-card" style="text-align: center; padding: 15px;">
            <div style="color: var(--d-text-muted); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Active Goals</div>
            <div id="total-goals-count" style="font-family: 'JetBrains Mono'; font-size: 1.5rem; font-weight: 800; color: var(--d-text-main);">0</div>
        </div>
        <div class="goal-card" style="text-align: center; padding: 15px;">
            <div style="color: var(--d-text-muted); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Net Worth</div>
            <div id="total-net-worth" style="font-family: 'JetBrains Mono'; font-size: 1.5rem; font-weight: 800; color: var(--d-accent);">₹0</div>
        </div>
    </div>

    <div style="display: flex; justify-content: center; margin-bottom: 25px; gap: 8px;">
        <button id="btn-group-goal" onclick="setDisplayMode('goal')" class="filter-btn active">By Goal</button>
        <button id="btn-group-asset" onclick="setDisplayMode('asset')" class="filter-btn">By Asset</button>
    </div>

    <div id="dashboard-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;"></div>
</div>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

// ... [Existing helper functions: normalize, getStats, openAssetModal, closeAssetModal, saveMarketValues remain identical] ...

function normalize(s) { return s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unk'; }
function getStats(g) {
    let inv = 0, theo = 0;
    const ret = parseFloat(g.goal_allocations?.[0]?.expected_returns) || 12;
    (g.transactions || []).forEach(t => {
        const amt = parseFloat(t.amount) || 0; inv += amt;
        const y = Math.max(0, (new Date() - new Date(t.transaction_date)) / 31557600000);
        theo += amt * Math.pow(1 + (ret / 100), y);
    });
    return { inv, theo };
}

function openAssetModal() {
    const assets = {};
    rawGoalsData.forEach(g => {
        (g.goal_allocations || []).forEach(a => {
            const k = `${a.broker_name || 'Direct'}|${a.instrument_name || 'Other'}`;
            if (!assets[k]) assets[k] = { b: a.broker_name || 'Direct', i: a.instrument_name || 'Other', v: a.current_value_override || 0 };
        });
    });
    document.getElementById('asset-table-body').innerHTML = Object.keys(assets).map(k => `
        <tr>
            <td style="font-weight: 600; color: var(--d-text-main);">${assets[k].b}</td>
            <td style="color: var(--d-text-muted);">${assets[k].i}</td>
            <td style="text-align: right;">
                <input type="number" class="asset-input" data-key="${k}" value="${assets[k].v}" 
                style="background:var(--d-card-bg); border:1px solid var(--d-border); color:var(--d-accent); padding:5px; border-radius:6px; font-family:'JetBrains Mono'; text-align:right; width:100px;">
            </td>
        </tr>`).join('');
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() { document.getElementById('asset-modal').style.display = 'none'; }

async function saveMarketValues() {
    const btn = document.getElementById('save-assets-btn');
    btn.innerText = "Saving..."; btn.disabled = true;
    const updates = Array.from(document.querySelectorAll('.asset-input')).map(input => {
        const [b, i] = input.getAttribute('data-key').split('|');
        return supabase.from('goal_allocations').update({ current_value_override: parseFloat(input.value) || 0 }).match({ broker_name: b, instrument_name: i });
    });
    await Promise.all(updates);
    location.reload();
}

function renderDashboard() {
    const container = document.getElementById('dashboard-cards-container');
    container.innerHTML = "";
    
    const buckets = {};
    rawGoalsData.forEach(g => {
        const s = getStats(g);
        (g.goal_allocations || []).forEach(a => {
            const k = normalize((a.broker_name || 'Direct') + (a.instrument_name || 'Other'));
            if (!buckets[k]) buckets[k] = { tSum: 0, actual: parseFloat(a.current_value_override) || 0 };
            buckets[k].tSum += s.theo;
        });
    });

    const groups = {};
    let totalNW = 0;

    rawGoalsData.forEach(g => {
        const s = getStats(g);
        let curVal = 0, isEstimated = false;
        if (g.goal_allocations?.length) {
            g.goal_allocations.forEach(a => {
                const b = buckets[normalize((a.broker_name || 'Direct') + (a.instrument_name || 'Other'))];
                if (b.actual > 0) { curVal += (b.actual * (s.theo / b.tSum)); } 
                else { curVal += s.theo; isEstimated = true; }
            });
        } else { curVal = s.theo; isEstimated = true; }

        totalNW += curVal;
        const groupKey = currentDisplayMode === 'goal' ? normalize(g.goal_name) : normalize(g.goal_allocations?.[0]?.instrument_name || 'Other');
        const displayName = currentDisplayMode === 'goal' ? g.goal_name : (g.goal_allocations?.[0]?.instrument_name || 'Other');

        if (!groups[groupKey]) groups[groupKey] = { name: displayName, id: groupKey, target: 0, cur: 0, inv: 0, items: [], txs: [], est: false };
        groups[groupKey].target += parseFloat(g.target_price || 0);
        groups[groupKey].cur += curVal;
        groups[groupKey].inv += s.inv;
        if (isEstimated) groups[groupKey].est = true;
        groups[groupKey].txs.push(...(g.transactions || []));
        groups[groupKey].items.push({ ...g, curVal, s, isEstimated });
    });

    document.getElementById('total-goals-count').innerText = Object.keys(groups).length;
    document.getElementById('total-net-worth').innerText = "₹" + Math.round(totalNW).toLocaleString('en-IN');

    Object.values(groups).forEach(grp => {
        const prog = grp.target > 0 ? Math.min((grp.cur / grp.target) * 100, 100) : 0;
        const gainAmt = grp.cur - grp.inv;
        const gainPerc = grp.inv > 0 ? (gainAmt / grp.inv) * 100 : 0;
        
        const card = document.createElement('div');
        card.className = "goal-card";
        card.id = `card-${grp.id}`;
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; font-family: 'Lora'; font-size: 1.1rem; color: var(--d-text-main);">${grp.name}</h4>
                <span class="chevron" id="arrow-${grp.id}" onclick="toggleDrawer('${grp.id}')" style="cursor:pointer; color:var(--d-text-muted); font-size: 0.7rem;">▼ Details</span>
            </div>

            <div class="p-track"><div class="p-fill" style="width: ${prog}%"></div></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-top: 5px; color: var(--d-text-muted); font-weight: 700;">
                <span>PROGRESS</span>
                <span style="color: var(--d-accent);">${prog.toFixed(1)}%</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; border-top: 1px solid var(--d-border); padding-top: 15px;">
                <div>
                    <div style="font-size: 0.55rem; color: var(--d-text-muted); text-transform: uppercase;">Current Value</div>
                    <div style="font-family: 'JetBrains Mono'; font-size: 1rem; color: var(--d-text-main); font-weight: 800;">₹${Math.round(grp.cur).toLocaleString('en-IN')}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.55rem; color: var(--d-text-muted); text-transform: uppercase;">XIRR</div>
                    <button id="xirr-btn-${grp.id}" class="xirr-badge">View</button>
                </div>
                <div>
                    <div style="font-size: 0.55rem; color: var(--d-text-muted); text-transform: uppercase;">Total Gain</div>
                    <div style="font-family: 'JetBrains Mono'; font-size: 0.85rem; color: ${gainAmt >= 0 ? '#10b981' : '#ef4444'}; font-weight: 700;">
                        ${gainPerc >= 0 ? '+' : ''}${gainPerc.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div id="drawer-${grp.id}" style="display: none; margin-top: 15px; border-top: 1px dashed var(--d-border); padding-top: 15px;">
                ${grp.items.map(item => {
                    const itemProg = item.target_price > 0 ? Math.min((item.curVal / item.target_price) * 100, 100) : 0;
                    return `
                    <div style="padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.03); position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--d-text-main);">${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}</div>
                                <div style="font-size: 0.65rem; color: var(--d-text-muted);">${item.goal_allocations?.[0]?.broker_name || 'Manual'}</div>
                            </div>
                            <div style="position: relative;">
                                <button onclick="event.stopPropagation(); toggleMenu('${item.id}', '${grp.id}')" class="menu-btn">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="menu-${item.id}" class="drop-menu">
                                    <a href="/log-transaction/?goal_id=${item.id}">Add Transaction</a>
                                    <a href="/goal-history/?goal_id=${item.id}">History</a>
                                    <a href="/edit-goal/?id=${item.id}">Edit</a>
                                    <a href="#" onclick="deleteGoal('${item.id}')" style="color: #ef4444;">Delete</a>
                                </div>
                            </div>
                        </div>
                        <div class="p-track child-track"><div class="p-fill" style="width: ${itemProg}%; background: var(--d-text-muted);"></div></div>
                    </div>`;
                }).join('')}
            </div>`;
            
        container.appendChild(card);
        
        document.getElementById(`xirr-btn-${grp.id}`).onclick = function() { runXIRR(this, grp.txs, grp.cur); };
    });
}

// ... [XIRR logic and toggle helpers remain unchanged but reference new class names] ...

function calculateXIRR(flows, dates) {
    let r = 0.1;
    for (let i = 0; i < 40; i++) {
        let f = 0, df = 0;
        flows.forEach((v, j) => {
            const t = (dates[j] - dates[0]) / 31557600000;
            f += v / Math.pow(1 + r, t);
            df -= t * v / Math.pow(1 + r, t + 1);
        });
        if (Math.abs(df) < 0.01) break;
        r = r - f / df;
    }
    return r;
}

function runXIRR(el, txs, cur) {
    if (!txs || txs.length === 0) { el.innerText = "0%"; return; }
    el.innerText = "...";
    const f = txs.map(t => -parseFloat(t.amount)); f.push(cur);
    const d = txs.map(t => new Date(t.transaction_date)); d.push(new Date());
    el.innerText = (calculateXIRR(f, d) * 100).toFixed(1) + "%";
}

function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`), a = document.getElementById(`arrow-${id}`);
    const open = d.style.display === 'block';
    d.style.display = open ? 'none' : 'block';
    a.innerText = open ? '▼ Details' : '▲ Hide';
}

function toggleMenu(itemId, cardId) {
    const m = document.getElementById(`menu-${itemId}`);
    const card = document.getElementById(`card-${cardId}`);
    const isVisible = m.classList.contains("show");
    document.querySelectorAll('.drop-menu').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('active-card'));
    if (!isVisible) { m.classList.add("show"); card.classList.add("active-card"); }
}

function setDisplayMode(m) { 
    currentDisplayMode = m; 
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-group-${m}`).classList.add('active');
    renderDashboard(); 
}

async function deleteGoal(id) { if (confirm("Delete this goal?")) { await supabase.from('goals').delete().eq('id', id); location.reload(); } }

window.onclick = e => { 
    if (!e.target.closest('.menu-btn')) {
        document.querySelectorAll('.drop-menu').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('active-card'));
    } 
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = "/login/";
    const { data: g } = await supabase.from('goals').select('*, goal_allocations (*), transactions (*)').eq('user_id', session.user.id);
    rawGoalsData = g || [];
    renderDashboard();
});
</script>
