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
        --d-success: #10b981;
        --d-danger: #ef4444;
    }

    .dark-theme {
        --d-card-bg: #1e293b;
        --d-border: #334155;
        --d-text-main: #ffffff;
        --d-text-muted: #94a3b8;
    }

    .dashboard-container { padding: 0 10px; max-width: 900px; margin: 0 auto; }

    /* Premium Card & Hover Effect */
    .goal-card {
        background: var(--d-card-bg);
        border: 1px solid var(--d-border);
        border-radius: 20px;
        padding: 24px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        margin-bottom: 24px;
    }
    .goal-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: var(--d-accent);
    }
    
    .active-card { border-color: var(--d-accent) !important; ring: 2px solid var(--d-accent-soft); }

    /* Animated Progress Bar */
    .p-track { height: 10px; background: var(--d-border); border-radius: 10px; overflow: hidden; margin: 12px 0; position: relative; }
    .p-fill { 
        height: 100%; 
        background: linear-gradient(90deg, #0284c7 0%, var(--d-accent) 50%, #0284c7 100%); 
        background-size: 200% 100%;
        animation: shine 2s linear infinite;
        border-radius: 10px; 
        transition: width 1s ease; 
    }
    .child-track .p-fill { 
        background: linear-gradient(90deg, #7dd3fc 0%, #bae6fd 50%, #7dd3fc 100%); 
        background-size: 200% 100%;
    }
    @keyframes shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Modern Buttons */
    .btn-modern {
        padding: 8px 18px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid var(--d-border);
        background: var(--d-card-bg);
        color: var(--d-text-main);
        font-family: 'Inter', sans-serif;
    }
    .btn-modern.primary { background: var(--d-accent); color: white; border: none; }
    .btn-modern.primary:hover { background: #0284c7; transform: scale(1.02); }
    .btn-modern.active { background: var(--d-accent-soft); border-color: var(--d-accent); color: var(--d-accent); }

    /* 4-Column Grid Layout */
    .fin-grid { display: grid; grid-template-columns: 1fr 1fr 1.2fr 0.8fr; gap: 10px; align-items: center; }
    .fin-label { font-size: 0.6rem; color: var(--d-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .fin-value { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700; color: var(--d-text-main); }
    
    .xirr-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--d-accent);
        background: var(--d-accent-soft);
        padding: 4px 10px;
        border-radius: 8px;
        cursor: pointer;
        border: none;
        width: 100%;
        text-align: center;
    }
    .xirr-badge:hover { background: var(--d-accent); color: white; }

    /* Minimalist Three Dots Dropdown */
    .menu-btn { background: none; border: none; color: var(--d-text-muted); cursor: pointer; padding: 8px; transition: 0.2s; }
    .menu-btn:hover { color: var(--d-accent); }
    .drop-menu {
        display: none; position: absolute; right: 0; top: 35px; 
        background: var(--d-card-bg); border: 1px solid var(--d-border);
        min-width: 180px; z-index: 2000; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden;
    }
    .drop-menu a { display: block; padding: 12px 16px; font-size: 0.8rem; color: var(--d-text-main); text-decoration: none !important; font-weight: 500; }
    .drop-menu a:hover { background: var(--d-accent-soft); }
    .drop-menu a.delete { color: var(--d-danger); }
    .show { display: block !important; }

    .modal-overlay {
        display:none; position:fixed; z-index:5000; left:0; top:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.4); backdrop-filter: blur(8px);
    }
</style>

<div id="asset-modal" class="modal-overlay">
    <div class="goal-card" style="max-width: 500px; margin: 10vh auto; position: relative;">
        <h3 style="margin-top: 0;">Update Market Values</h3>
        <div id="asset-table-body" style="max-height: 400px; overflow-y: auto;"></div>
        <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="closeAssetModal()" class="btn-modern">Cancel</button>
            <button id="save-assets-btn" onclick="saveMarketValues()" class="btn-modern primary">Update All</button>
        </div>
    </div>
</div>

<div class="dashboard-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 40px 0;">
        <h1 style="margin: 0; font-family: 'Lora', serif; font-size: 2.2rem;">My Goals</h1>
        <div style="display: flex; gap: 12px;">
            <button onclick="openAssetModal()" class="btn-modern">Update Values</button>
            <a href="/add-goal/" class="btn-modern primary" style="text-decoration:none;">+ Add Goal</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
        <div class="goal-card" style="margin-bottom:0; padding: 20px; text-align:center;">
            <div class="fin-label">Active Goals</div>
            <div id="total-goals-count" class="fin-value" style="font-size: 1.8rem;">0</div>
        </div>
        <div class="goal-card" style="margin-bottom:0; padding: 20px; text-align:center;">
            <div class="fin-label">Total Net Worth</div>
            <div id="total-net-worth" class="fin-value" style="font-size: 1.8rem; color: var(--d-accent);">₹0</div>
        </div>
    </div>

    <div style="display: flex; justify-content: center; margin-bottom: 30px; gap: 12px;">
        <button id="btn-group-goal" onclick="setDisplayMode('goal')" class="btn-modern active">Goal View</button>
        <button id="btn-group-asset" onclick="setDisplayMode('asset')" class="btn-modern">Asset View</button>
    </div>

    <div id="dashboard-cards-container"></div>
</div>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

// Technical Helper: Normalize strings for buckets
function normalize(s) { return s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unk'; }

// Technical Helper: Valuation and XIRR Math
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

function calculateXIRR(flows, dates) {
    let r = 0.1;
    for (let i = 0; i < 50; i++) {
        let f = 0, df = 0;
        flows.forEach((v, j) => {
            const t = (dates[j] - dates[0]) / 31557600000;
            f += v / Math.pow(1 + r, t);
            df -= t * v / Math.pow(1 + r, t + 1);
        });
        if (Math.abs(df) < 0.001) break;
        r = r - f / df;
    }
    return r;
}

// UI Function: Running XIRR from DOM
function runXIRR(el, goalId, childIndex = -1) {
    el.innerText = "...";
    const goal = rawGoalsData.find(g => g.id === goalId);
    if (!goal || !goal.transactions?.length) { el.innerText = "0%"; return; }
    
    // Logic: Calculate for group or specific child
    let txs = goal.transactions;
    let cur = el.getAttribute('data-cur'); 
    
    const f = txs.map(t => -parseFloat(t.amount)); f.push(parseFloat(cur));
    const d = txs.map(t => new Date(t.transaction_date)); d.push(new Date());
    const xirrValue = (calculateXIRR(f, d) * 100).toFixed(1);
    el.innerText = xirrValue + "%";
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
        let curVal = 0;
        (g.goal_allocations || []).forEach(a => {
            const b = buckets[normalize((a.broker_name || 'Direct') + (a.instrument_name || 'Other'))];
            curVal += b.actual > 0 ? (b.actual * (s.theo / b.tSum)) : s.theo;
        });

        totalNW += curVal;
        const groupKey = currentDisplayMode === 'goal' ? normalize(g.goal_name) : normalize(g.goal_allocations?.[0]?.instrument_name || 'Other');
        const displayName = currentDisplayMode === 'goal' ? g.goal_name : (g.goal_allocations?.[0]?.instrument_name || 'Other');

        if (!groups[groupKey]) groups[groupKey] = { name: displayName, id: groupKey, target: 0, cur: 0, inv: 0, items: [], txs: [], gId: g.id };
        groups[groupKey].target += parseFloat(g.target_price || 0);
        groups[groupKey].cur += curVal;
        groups[groupKey].inv += s.inv;
        groups[groupKey].txs.push(...(g.transactions || []));
        groups[groupKey].items.push({ ...g, curVal, s });
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
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div>
                    <h2 style="margin: 0; font-family: 'Lora'; font-size: 1.4rem; color: var(--d-text-main);">${grp.name}</h2>
                    <div style="font-size: 0.65rem; color: var(--d-text-muted); font-weight: 700; margin-top: 4px;">TARGET: ₹${Math.round(grp.target).toLocaleString('en-IN')}</div>
                </div>
                <div onclick="toggleDrawer('${grp.id}')" style="cursor:pointer; color:var(--d-text-muted); padding: 5px;" id="arrow-${grp.id}">▼</div>
            </div>

            <div class="p-track"><div class="p-fill" style="width: ${prog}%"></div></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--d-text-muted); margin-bottom: 24px;">
                <span>GOAL PROGRESS</span>
                <span style="color: var(--d-accent); font-weight:800;">${prog.toFixed(1)}%</span>
            </div>

            <div class="fin-grid">
                <div>
                    <div class="fin-label">Invested</div>
                    <div class="fin-value">₹${Math.round(grp.inv).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div class="fin-label">Current</div>
                    <div class="fin-value" style="color: var(--d-accent);">₹${Math.round(grp.cur).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div class="fin-label">Gain</div>
                    <div class="fin-value" style="color: ${gainAmt >= 0 ? 'var(--d-success)' : 'var(--d-danger)'};">
                        ₹${Math.round(gainAmt).toLocaleString('en-IN')} (${gainPerc.toFixed(1)}%)
                    </div>
                </div>
                <div>
                    <div class="fin-label">XIRR</div>
                    <button class="xirr-badge" data-cur="${grp.cur}" onclick="runXIRR(this, '${grp.items[0].id}')">View</button>
                </div>
            </div>

            <div id="drawer-${grp.id}" style="display: none; margin-top: 30px; padding-top: 15px; border-top: 1px dashed var(--d-border);">
                ${grp.items.map((item, idx) => {
                    const itemProg = item.target_price > 0 ? Math.min((item.curVal / item.target_price) * 100, 100) : 0;
                    const itemGainAmt = item.curVal - item.s.inv;
                    const itemGainPerc = item.s.inv > 0 ? (itemGainAmt / item.s.inv) * 100 : 0;
                    const typeLabel = item.goal_allocations?.[0]?.instrument_name?.toLowerCase().includes('fund') ? 'SIP' : 'Manual';

                    return `
                    <div style="padding: 20px 0; border-bottom: 1px solid rgba(0,0,0,0.03); position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; font-weight: 700; color: var(--d-text-main);">
                                ${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}
                                <span style="font-size: 0.6rem; color: var(--d-text-muted); font-weight:500; margin-left:8px;">${typeLabel} • ${item.goal_allocations?.[0]?.broker_name || 'Direct'}</span>
                            </div>
                            <div style="position: relative;">
                                <button onclick="event.stopPropagation(); toggleMenu('${item.id}', '${grp.id}')" class="menu-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="menu-${item.id}" class="drop-menu">
                                    <a href="/log-transaction/?goal_id=${item.id}">Add Transaction</a>
                                    <a href="/goal-history/?goal_id=${item.id}">Transaction History</a>
                                    <a href="/edit-goal/?id=${item.id}">Edit Goal</a>
                                    <a href="#" onclick="deleteGoal('${item.id}')" class="delete">Delete Goal</a>
                                </div>
                            </div>
                        </div>

                        <div class="fin-grid">
                            <div><div class="fin-label">Invested</div><div class="fin-value" style="font-size:0.8rem;">₹${Math.round(item.s.inv).toLocaleString('en-IN')}</div></div>
                            <div><div class="fin-label">Current</div><div class="fin-value" style="font-size:0.8rem;">₹${Math.round(item.curVal).toLocaleString('en-IN')}</div></div>
                            <div><div class="fin-label">Gain</div><div class="fin-value" style="font-size:0.8rem; color: ${itemGainAmt >= 0 ? 'var(--d-success)' : 'var(--d-danger)'};">₹${Math.round(itemGainAmt).toLocaleString('en-IN')} (${itemGainPerc.toFixed(1)}%)</div></div>
                            <div><div class="fin-label">XIRR</div><button class="xirr-badge" data-cur="${item.curVal}" onclick="runXIRR(this, '${item.id}')">View</button></div>
                        </div>
                        <div class="p-track child-track" style="margin-top:15px;"><div class="p-fill" style="width: ${itemProg}%"></div></div>
                    </div>`;
                }).join('')}
            </div>`;
            
        container.appendChild(card);
    });
}

// Modal & Data Actions
function openAssetModal() {
    const assets = {};
    rawGoalsData.forEach(g => {
        (g.goal_allocations || []).forEach(a => {
            const k = `${a.broker_name || 'Direct'}|${a.instrument_name || 'Other'}`;
            if (!assets[k]) assets[k] = { b: a.broker_name || 'Direct', i: a.instrument_name || 'Other', v: a.current_value_override || 0 };
        });
    });
    document.getElementById('asset-table-body').innerHTML = Object.keys(assets).map(k => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--d-border);">
            <div style="font-size:0.8rem;"><strong>${assets[k].i}</strong><br><span style="color:var(--d-text-muted); font-size:0.7rem;">${assets[k].b}</span></div>
            <input type="number" class="asset-input" data-key="${k}" value="${assets[k].v}" style="width:110px; padding:8px; border-radius:8px; border:1px solid var(--d-border); background:var(--d-card-bg); color:var(--d-accent); font-family:'JetBrains Mono';">
        </div>`).join('');
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() { document.getElementById('asset-modal').style.display = 'none'; }

async function saveMarketValues() {
    const btn = document.getElementById('save-assets-btn');
    btn.innerText = "Updating...";
    const updates = Array.from(document.querySelectorAll('.asset-input')).map(input => {
        const [b, i] = input.getAttribute('data-key').split('|');
        return supabase.from('goal_allocations').update({ current_value_override: parseFloat(input.value) || 0 }).match({ broker_name: b, instrument_name: i });
    });
    await Promise.all(updates);
    location.reload();
}

// UI Toggles
function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`), a = document.getElementById(`arrow-${id}`);
    const open = d.style.display === 'block';
    d.style.display = open ? 'none' : 'block';
    a.innerText = open ? '▼' : '▲';
}

function toggleMenu(itemId, cardId) {
    const m = document.getElementById(`menu-${itemId}`);
    const isVisible = m.classList.contains("show");
    document.querySelectorAll('.drop-menu').forEach(el => el.classList.remove('show'));
    if (!isVisible) m.classList.add("show");
}

function setDisplayMode(m) { 
    currentDisplayMode = m; 
    document.querySelectorAll('.btn-modern').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-group-${m}`).classList.add('active');
    renderDashboard(); 
}

async function deleteGoal(id) { if (confirm("Permanently delete this goal?")) { await supabase.from('goals').delete().eq('id', id); location.reload(); } }

window.onclick = e => { if (!e.target.closest('.menu-btn')) document.querySelectorAll('.drop-menu').forEach(d => d.classList.remove('show')); }

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = "/login/";
    const { data: g } = await supabase.from('goals').select('*, goal_allocations (*), transactions (*)').eq('user_id', session.user.id);
    rawGoalsData = g || [];
    renderDashboard();
});
</script>
