---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<div id="asset-modal" style="display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter: blur(8px);">
    <div class="post-card" style="max-width: 800px; margin: 50px auto; max-height: 85vh; overflow-y: auto; border: 1px solid #334155; background: #000;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">📈 Update Market Values</h2>
            <button onclick="closeAssetModal()" style="background:none; border:none; color:#64748b; font-size:1.5rem; cursor:pointer;">&times;</button>
        </div>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px;">Enter current values from broker apps. Changes reflect across all linked goals proportionally.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid #334155; color: #64748b;">
                    <th style="padding: 10px;">Broker</th>
                    <th style="padding: 10px;">Instrument</th>
                    <th style="padding: 10px;">Last Sync</th>
                    <th style="padding: 10px; text-align: right;">Current Market Value</th>
                </tr>
            </thead>
            <tbody id="asset-table-body"></tbody>
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
        <div style="display: flex; gap: 12px;">
            <button onclick="openAssetModal()" class="filter-btn" style="border-color: #4ade80; color: #4ade80; background: rgba(74, 222, 128, 0.05);">Update Portfolio</button>
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
    .filter-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: 0.3s; font-size: 0.85rem; }
    .filter-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; font-weight: bold; }
    .post-card { background: #000; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .child-item-row { padding: 15px 0; border-bottom: 1px solid rgba(100, 116, 139, 0.1); }
    .child-item-row:last-child { border-bottom: none; }
    .asset-input { background: #0f172a; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 6px; width: 140px; font-family: 'JetBrains Mono'; text-align: right; }
    .menu-container { position: relative; display: inline-block; }
    .dots-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; padding: 0 5px; }
    .dropdown-content { display: none; position: absolute; right: 0; background: #1e293b; min-width: 180px; z-index: 100; border-radius: 8px; border: 1px solid #334155; overflow: hidden; }
    .dropdown-content a { color: #f1f5f9; padding: 10px 15px; text-decoration: none; display: block; font-size: 0.85rem; }
    .dropdown-content a:hover { background: #0ea5e9; }
    .show { display: block; }
    .chevron { transition: 0.3s; cursor: pointer; font-size: 1.2rem; color: #64748b; }
    .chevron.open { transform: rotate(180deg); }
    .xirr-clickable { color: #0ea5e9; cursor: pointer; text-decoration: underline; }
</style>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

function openAssetModal() {
    const assets = {};
    rawGoalsData.forEach(g => {
        (g.goal_allocations || []).forEach(a => {
            const k = `${a.broker_name || 'Direct'}|${a.instrument_name || 'Other'}`;
            if (!assets[k]) assets[k] = { b: a.broker_name || 'Direct', i: a.instrument_name || 'Other', v: a.current_value_override || 0 };
        });
    });
    const tbody = document.getElementById('asset-table-body');
    tbody.innerHTML = Object.keys(assets).map(k => `
        <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.5);">
            <td style="padding: 12px; color: #cbd5e1;">${assets[k].b}</td>
            <td style="padding: 12px; color: #cbd5e1;">${assets[k].i}</td>
            <td style="padding: 12px; color: #64748b;">₹${Math.round(assets[k].v).toLocaleString('en-IN')}</td>
            <td style="padding: 12px; text-align: right;"><input type="number" class="asset-input" data-key="${k}" value="${assets[k].v}"></td>
        </tr>`).join('') || '<tr><td colspan="4" style="text-align:center; padding:20px;">No allocations.</td></tr>';
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() { document.getElementById('asset-modal').style.display = 'none'; }

async function saveMarketValues() {
    const btn = document.getElementById('save-assets-btn');
    btn.innerText = "Syncing..."; btn.disabled = true;
    const updates = Array.from(document.querySelectorAll('.asset-input')).map(input => {
        const [b, i] = input.getAttribute('data-key').split('|');
        return supabase.from('goal_allocations').update({ current_value_override: parseFloat(input.value) || 0 }).match({ broker_name: b, instrument_name: i });
    });
    await Promise.all(updates);
    location.reload();
}

function normalize(s) { return s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unk'; }

function getStats(g) {
    let inv = 0, theo = 0;
    const now = new Date();
    const ret = parseFloat(g.goal_allocations?.[0]?.expected_returns) || 12;
    (g.transactions || []).forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        inv += amt;
        const y = Math.max(0, (now - new Date(t.transaction_date)) / 31557600000);
        theo += amt * Math.pow(1 + (ret / 100), y);
    });
    return { inv, theo };
}

function renderDashboard() {
    const container = document.getElementById('dashboard-cards-container');
    if (!rawGoalsData.length) { container.innerHTML = "<p style='text-align:center;'>No goals found.</p>"; return; }
    container.innerHTML = "";
    
    // 1. Calculate Global Broker Buckets
    const buckets = {};
    rawGoalsData.forEach(g => {
        const s = getStats(g);
        (g.goal_allocations || []).forEach(a => {
            const k = normalize((a.broker_name || 'Direct') + (a.instrument_name || 'Other'));
            if (!buckets[k]) buckets[k] = { tSum: 0, actual: parseFloat(a.current_value_override) || 0 };
            buckets[k].tSum += s.theo;
        });
    });

    // 2. Aggregate by Mode (Logic for Emergency Fund Grouping)
    const groups = {};
    let totalNW = 0;

    rawGoalsData.forEach(g => {
        const s = getStats(g);
        let curVal = 0;
        if (g.goal_allocations?.length) {
            g.goal_allocations.forEach(a => {
                const b = buckets[normalize((a.broker_name || 'Direct') + (a.instrument_name || 'Other'))];
                curVal += b.tSum > 0 ? (b.actual * (s.theo / b.tSum)) : s.theo;
            });
        } else { curVal = s.theo; }

        totalNW += curVal;
        
        // Grouping Key logic: Use Goal Name for goal mode to merge split goals
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
        const gain = grp.cur - grp.inv;
        const card = document.createElement('div');
        card.className = "post-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-family: 'Lora', serif; font-size: 1.4rem;">${grp.name}</h3>
                <span class="chevron" id="arrow-${grp.id}" onclick="toggleDrawer('${grp.id}')">▼</span>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
                    <span style="color: #64748b; text-transform: uppercase;">Progress</span>
                    <span style="color: #0ea5e9; font-weight: bold;">${prog.toFixed(1)}%</span>
                </div>
                <div style="width: 100%; background: #1e293b; height: 6px; border-radius: 10px; overflow: hidden;"><div style="width: ${prog}%; background: #0ea5e9; height: 100%;"></div></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border-top: 1px solid rgba(100, 116, 139, 0.1); padding-top: 15px;">
                <div><div style="font-size: 0.6rem; color: #64748b;">INVESTED</div><div style="font-size: 0.85rem; font-family: 'JetBrains Mono';">₹${Math.round(grp.inv).toLocaleString('en-IN')}</div></div>
                <div><div style="font-size: 0.6rem; color: #64748b;">CURRENT</div><div style="font-size: 0.85rem; color: #4ade80; font-family: 'JetBrains Mono';">₹${Math.round(grp.cur).toLocaleString('en-IN')}</div></div>
                <div><div style="font-size: 0.6rem; color: #64748b;">GAIN</div><div style="font-size: 0.85rem; color: ${gain >= 0 ? '#4ade80' : '#f87171'};">${grp.inv > 0 ? ((gain / grp.inv) * 100).toFixed(1) : 0}%</div></div>
                <div style="text-align: right;"><div style="font-size: 0.6rem; color: #64748b;">XIRR</div><div id="xirr-btn-${grp.id}" class="xirr-clickable" style="font-size: 0.85rem;">View</div></div>
            </div>
            <div id="drawer-${grp.id}" style="display: none; margin-top: 15px; border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 10px;">
                ${grp.items.map(item => `
                    <div class="child-item-row" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.95rem; color: #f1f5f9;">${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}</div>
                            <div style="font-size: 0.7rem; color: #64748b;">${item.goal_allocations?.[0]?.broker_name || ''} • Due ${new Date(item.target_date).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}</div>
                        </div>
                        <div style="text-align: right; display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 0.9rem; font-family: 'JetBrains Mono';">₹${Math.round(item.curVal).toLocaleString('en-IN')}</div>
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
                    </div>`).join('')}
            </div>`;
        container.appendChild(card);
        document.getElementById(`xirr-btn-${grp.id}`).onclick = function() { runXIRR(this, grp.txs, grp.cur); };
    });
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
        let next = r - f / df;
        if (Math.abs(next - r) < 1e-5) return next;
        r = next;
    }
    return r;
}

function runXIRR(el, txs, cur) {
    if (!txs.length) { el.innerText = "0%"; return; }
    el.innerText = "...";
    const f = txs.map(t => -parseFloat(t.amount)); f.push(cur);
    const d = txs.map(t => new Date(t.transaction_date)); d.push(new Date());
    el.innerText = (calculateXIRR(f, d) * 100).toFixed(1) + "%";
    el.style.color = "#4ade80";
}

function toggleDrawer(id) {
    const d = document.getElementById(`drawer-${id}`), a = document.getElementById(`arrow-${id}`);
    const open = d.style.display === 'block';
    d.style.display = open ? 'none' : 'block';
    a.innerText = open ? '▼' : '▲';
}

function toggleMenu(id) {
    const m = document.getElementById(`menu-${id}`);
    const isVisible = m.classList.contains("show");
    document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
    if (!isVisible) m.classList.add("show");
}

function setDisplayMode(m) { 
    currentDisplayMode = m; 
    document.getElementById('btn-group-goal').classList.toggle('active', m === 'goal');
    document.getElementById('btn-group-asset').classList.toggle('active', m === 'asset');
    renderDashboard(); 
}

async function deleteGoal(id) { if (confirm("Delete permanently?")) { await supabase.from('goals').delete().eq('id', id); location.reload(); } }

window.onclick = e => { if (!e.target.matches('.dots-btn')) document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show')); }

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = "/login/";
    const { data: g } = await supabase.from('goals').select('*, goal_allocations (*), transactions (*)').eq('user_id', session.user.id);
    rawGoalsData = g || [];
    renderDashboard();
});
</script>
