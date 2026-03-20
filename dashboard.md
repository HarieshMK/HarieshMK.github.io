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

    .dashboard-container { padding: 0 10px; max-width: 850px; margin: 0 auto; }

    .goal-card {
        background: var(--d-card-bg);
        border: 1px solid var(--d-border);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
        position: relative;
        margin-bottom: 20px;
    }
    
    .active-card { border-color: var(--d-accent) !important; box-shadow: 0 0 0 2px var(--d-accent-soft); }

    .p-track { height: 8px; background: var(--d-border); border-radius: 10px; overflow: hidden; margin: 8px 0; }
    .p-fill { height: 100%; background: var(--d-accent); border-radius: 10px; transition: width 1s ease; }
    .child-track { height: 4px; background: rgba(0,0,0,0.05); margin-top: 10px;}
    .dark-theme .child-track { background: rgba(255,255,255,0.05); }

    .xirr-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--d-accent);
        background: var(--d-accent-soft);
        padding: 2px 8px;
        border-radius: 6px;
        cursor: pointer;
        border: none;
    }

    /* Minimalist Three Dots */
    .menu-btn {
        background: none;
        border: none;
        color: var(--d-text-muted);
        cursor: pointer;
        padding: 5px;
        display: flex;
        align-items: center;
        opacity: 0.6;
        transition: opacity 0.2s;
    }
    .menu-btn:hover { opacity: 1; color: var(--d-accent); }

    .drop-menu {
        display: none; position: absolute; right: 0; top: 30px; 
        background: var(--d-card-bg); border: 1px solid var(--d-border);
        min-width: 160px; z-index: 2000; border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .drop-menu a { display: block; padding: 10px 15px; font-size: 0.8rem; color: var(--d-text-main); text-decoration: none !important; }
    .drop-menu a:hover { background: var(--d-accent-soft); }
    .show { display: block !important; }

    .modal-overlay {
        display:none; position:fixed; z-index:5000; left:0; top:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
</style>

<div id="asset-modal" class="modal-overlay">
    <div class="goal-card" style="max-width: 500px; margin: 50px auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Market Values</h3>
            <button onclick="closeAssetModal()" style="background:none; border:none; color:var(--d-text-muted); font-size: 1.5rem;">&times;</button>
        </div>
        <div id="asset-table-body"></div>
        <div style="margin-top: 20px; text-align: right;">
            <button id="save-assets-btn" onclick="saveMarketValues()" class="auth-link" style="border:none; background:var(--d-accent); color:white;">Save All</button>
        </div>
    </div>
</div>

<div class="dashboard-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 30px 0;">
        <h2 style="margin: 0; font-family: 'Lora', serif;">My Goals</h2>
        <div style="display: flex; gap: 10px;">
            <button onclick="openAssetModal()" class="filter-btn" style="font-size: 0.7rem;">Update Values</button>
            <a href="/add-goal/" class="auth-link" style="font-size: 0.7rem;">+ Add Goal</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
        <div class="goal-card" style="text-align: center; padding: 15px; margin-bottom:0;">
            <div style="color: var(--d-text-muted); font-size: 0.6rem; text-transform: uppercase;">Active</div>
            <div id="total-goals-count" style="font-family: 'JetBrains Mono'; font-size: 1.2rem; font-weight: 800;">0</div>
        </div>
        <div class="goal-card" style="text-align: center; padding: 15px; margin-bottom:0;">
            <div style="color: var(--d-text-muted); font-size: 0.6rem; text-transform: uppercase;">Net Worth</div>
            <div id="total-net-worth" style="font-family: 'JetBrains Mono'; font-size: 1.2rem; font-weight: 800; color: var(--d-accent);">₹0</div>
        </div>
    </div>

    <div style="display: flex; justify-content: center; margin-bottom: 25px; gap: 8px;">
        <button id="btn-group-goal" onclick="setDisplayMode('goal')" class="filter-btn active">By Goal</button>
        <button id="btn-group-asset" onclick="setDisplayMode('asset')" class="filter-btn">By Asset</button>
    </div>

    <div id="dashboard-cards-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
</div>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

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
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--d-border);">
            <div style="font-size:0.85rem;"><strong>${assets[k].i}</strong><br><small>${assets[k].b}</small></div>
            <input type="number" class="asset-input" data-key="${k}" value="${assets[k].v}" style="width:100px; padding:5px; border-radius:5px; border:1px solid var(--d-border); background:var(--d-card-bg); color:var(--d-accent);">
        </div>`).join('');
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() { document.getElementById('asset-modal').style.display = 'none'; }

async function saveMarketValues() {
    const updates = Array.from(document.querySelectorAll('.asset-input')).map(input => {
        const [b, i] = input.getAttribute('data-key').split('|');
        return supabase.from('goal_allocations').update({ current_value_override: parseFloat(input.value) || 0 }).match({ broker_name: b, instrument_name: i });
    });
    await Promise.all(updates);
    location.reload();
}

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

        if (!groups[groupKey]) groups[groupKey] = { name: displayName, id: groupKey, target: 0, cur: 0, inv: 0, items: [], txs: [] };
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; font-family: 'Lora'; font-size: 1.2rem; color: var(--d-text-main);">${grp.name}</h4>
                <div onclick="toggleDrawer('${grp.id}')" style="cursor:pointer; color:var(--d-text-muted); font-size: 0.9rem;" id="arrow-${grp.id}">▼</div>
            </div>

            <div class="p-track"><div class="p-fill" style="width: ${prog}%"></div></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--d-text-muted);">
                <span>PROGRESS</span>
                <span style="color: var(--d-accent); font-weight:700;">${prog.toFixed(1)}%</span>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-top: 20px; border-top: 1px solid var(--d-border); padding-top: 20px;">
                <div>
                    <div style="font-size: 0.6rem; color: var(--d-text-muted); text-transform: uppercase;">Current Value</div>
                    <div style="font-family: 'JetBrains Mono'; font-size: 1.2rem; color: var(--d-text-main); font-weight: 800;">₹${Math.round(grp.cur).toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.8rem; font-weight:700; color: ${gainAmt >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
                        ₹${Math.round(gainAmt).toLocaleString('en-IN')} (${gainPerc >= 0 ? '+' : ''}${gainPerc.toFixed(1)}%)
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.6rem; color: var(--d-text-muted); text-transform: uppercase; margin-bottom:5px;">XIRR</div>
                    <button id="xirr-btn-${grp.id}" class="xirr-badge">View</button>
                </div>
            </div>

            <div id="drawer-${grp.id}" style="display: none; margin-top: 20px; padding-top: 10px; border-top: 1px dashed var(--d-border);">
                ${grp.items.map(item => {
                    const itemProg = item.target_price > 0 ? Math.min((item.curVal / item.target_price) * 100, 100) : 0;
                    const typeLabel = item.goal_allocations?.[0]?.instrument_name?.toLowerCase().includes('fund') ? 'SIP' : 'Manual';
                    const itemGainAmt = item.curVal - item.s.inv;
                    const itemGainPerc = item.s.inv > 0 ? (itemGainAmt / item.s.inv) * 100 : 0;

                    return `
                    <div style="padding: 15px 0; border-bottom: 1px solid rgba(0,0,0,0.03); position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex-grow: 1;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-size: 0.85rem; font-weight: 700;">${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}</span>
                                    <button id="xirr-child-${item.id}" class="xirr-badge" style="font-size:0.6rem;" onclick="event.stopPropagation(); runXIRR(this, ${JSON.stringify(item.transactions)}, ${item.curVal})">View XIRR</button>
                                </div>
                                <div style="font-size: 0.65rem; color: var(--d-text-muted); margin-top:2px;">${typeLabel} • ₹${Math.round(item.curVal).toLocaleString('en-IN')} (${itemGainPerc >= 0 ? '+' : ''}${itemGainPerc.toFixed(1)}%)</div>
                                <div class="p-track child-track"><div class="p-fill" style="width: ${itemProg}%; background: var(--d-text-muted); opacity: 0.5;"></div></div>
                            </div>
                            <div style="margin-left: 15px;">
                                <button onclick="event.stopPropagation(); toggleMenu('${item.id}', '${grp.id}')" class="menu-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="menu-${item.id}" class="drop-menu">
                                    <a href="/log-transaction/?goal_id=${item.id}">Add Transaction</a>
                                    <a href="/goal-history/?goal_id=${item.id}">History</a>
                                    <a href="/edit-goal/?id=${item.id}">Edit</a>
                                    <a href="#" onclick="deleteGoal('${item.id}')" style="color: #ef4444;">Delete</a>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
            
        container.appendChild(card);
        document.getElementById(`xirr-btn-${grp.id}`).onclick = function() { runXIRR(this, grp.txs, grp.cur); };
    });
}

function runXIRR(el, txs, cur) {
    if (!txs || txs.length === 0) { el.innerText = "0%"; return; }
    const f = txs.map(t => -parseFloat(t.amount)); f.push(cur);
    const d = txs.map(t => new Date(t.transaction_date)); d.push(new Date());
    el.innerText = (calculateXIRR(f, d) * 100).toFixed(1) + "%";
}

function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`), a = document.getElementById(`arrow-${id}`);
    const open = d.style.display === 'block';
    d.style.display = open ? 'none' : 'block';
    a.innerText = open ? '▼' : '▲';
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
