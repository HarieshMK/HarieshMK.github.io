---
layout: default
title: My Financial Goals
permalink: /dashboard/
---

<div id="asset-modal" style="display:none; position:fixed; z-index:5000; left:0; top:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.85); backdrop-filter: blur(12px);">
    <div class="post-card" style="max-width: 800px; margin: 50px auto; max-height: 85vh; overflow-y: auto; border: 1px solid #1e293b; background: #0f172a;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.5rem;">📈 Update Market Values</h2>
            <button onclick="closeAssetModal()" style="background:none; border:none; color:#64748b; font-size: 2rem; cursor:pointer; line-height: 1;">&times;</button>
        </div>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 25px;">Enter current values from your broker apps. If left at 0, the system uses Estimated Values.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
            <thead>
                <tr style="text-align: left; border-bottom: 1px solid #334155; color: #94a3b8;">
                    <th style="padding: 12px;">Broker</th>
                    <th style="padding: 12px;">Instrument</th>
                    <th style="padding: 12px; text-align: right;">Current Market Value</th>
                </tr>
            </thead>
            <tbody id="asset-table-body"></tbody>
        </table>
        <div style="margin-top: 30px; display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="closeAssetModal()" class="filter-btn">Cancel</button>
            <button id="save-assets-btn" onclick="saveMarketValues()" class="filter-btn active" style="padding: 10px 30px;">Save All Changes</button>
        </div>
    </div>
</div>

<div class="dashboard-container" style="padding: 20px; max-width: 1000px; margin: 0 auto; font-family: 'Inter', -apple-system, sans-serif;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px;">
        <h2 style="margin: 0; font-weight: 800; letter-spacing: -0.02em;">📊 My Financial Goals</h2>
        <div style="display: flex; gap: 12px;">
            <button onclick="openAssetModal()" class="filter-btn" style="border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.05);">Update Portfolio</button>
            <a href="/add-goal/" class="auth-link" style="text-decoration: none; border: 1px solid #0ea5e9; color: #0ea5e9; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">+ Add New Goal</a>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="post-card" style="text-align: center; border-color: #1e293b;">
            <p style="color: #64748b; margin-bottom: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Active Goals</p>
            <h3 id="total-goals-count" style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 1.8rem;">0</h3>
        </div>
        <div class="post-card" style="text-align: center; border-color: #1e293b;">
            <p style="color: #64748b; margin-bottom: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Est. Net Worth</p>
            <h3 id="total-net-worth" style="margin: 0; font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 1.8rem;">₹0</h3>
        </div>
    </div>

    <div style="display: flex; justify-content: center; margin-bottom: 35px; gap: 12px;">
        <button id="btn-group-goal" onclick="setDisplayMode('goal')" class="filter-btn active">Group by Goal</button>
        <button id="btn-group-asset" onclick="setDisplayMode('asset')" class="filter-btn">Group by Instrument</button>
    </div>

    <div id="dashboard-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 25px;"></div>
</div>

<style>
    :root {
        --accent: #0ea5e9;
        --accent-hover: #0284c7;
        --bg-card: #0f172a;
        --border-muted: #1e293b;
        --track: #1e293b;
    }

    /* Core Card Styling */
    .post-card { 
        background: var(--bg-card); 
        border: 1px solid var(--border-muted); 
        padding: 24px; 
        border-radius: 20px; 
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .post-card.active-card { z-index: 1000 !important; border-color: var(--accent); ring: 2px solid var(--accent); }

    .filter-btn { 
        background: #1e293b; border: 1px solid #334155; color: #94a3b8; 
        padding: 10px 20px; border-radius: 12px; cursor: pointer; 
        transition: 0.2s; font-size: 0.9rem; font-weight: 500;
    }
    .filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 0 15px rgba(14, 165, 233, 0.3); }

    /* Premium Progress Bar */
    .progress-track { width: 100%; background: var(--track); height: 12px; border-radius: 20px; overflow: hidden; position: relative; }
    .progress-fill { background: var(--accent); height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
    .progress-fill::after { 
        content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 30px; 
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2)); 
    }

    /* Drawer & Tree UI */
    .drawer-content { position: relative; padding-left: 15px; margin-top: 20px; border-top: 1px solid #1e293b; }
    .child-item-row { position: relative; padding: 20px 0 20px 25px; border-bottom: 1px solid rgba(30, 41, 59, 0.5); }
    .child-item-row::before { 
        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; 
        background: linear-gradient(to bottom, var(--accent), transparent); opacity: 0.3;
    }

    /* Actions Menu Styling */
    .dots-btn { 
        background: #1e293b; color: #94a3b8; border: 1px solid #334155; 
        width: 32px; height: 32px; border-radius: 8px; cursor: pointer; 
        display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .dots-btn:hover { background: #334155; color: #fff; }

    .dropdown-content { 
        display: none; position: absolute; right: 0; top: 40px; background: #1e293b; 
        min-width: 180px; z-index: 2000; border-radius: 12px; border: 1px solid #334155; 
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); overflow: hidden;
    }
    .dropdown-content a { color: #f1f5f9; padding: 12px 16px; text-decoration: none; display: block; font-size: 0.85rem; transition: 0.2s; }
    .dropdown-content a:hover { background: var(--accent); color: white; }
    .show { display: block !important; animation: fadeIn 0.2s ease; }

    /* Values & Typography */
    .mono-value { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .gain-positive { color: #4ade80; }
    .gain-negative { color: #f87171; }
    .info-icon { display: inline-block; width: 14px; height: 14px; background: #334155; color: #38bdf8; border-radius: 50%; font-size: 10px; line-height: 14px; text-align: center; cursor: help; margin-left: 5px; }
    .xirr-clickable { color: var(--accent); cursor: pointer; font-weight: 700; border-bottom: 1px dashed var(--accent); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script>
let currentDisplayMode = 'goal';
let rawGoalsData = [];

// ... [Keep helper functions: openAssetModal, closeAssetModal, saveMarketValues, normalize, getStats exactly as they were] ...

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
        <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 15px; font-weight: 600;">${assets[k].b}</td>
            <td style="padding: 15px; color: #94a3b8;">${assets[k].i}</td>
            <td style="padding: 15px; text-align: right;">
                <input type="number" class="asset-input" data-key="${k}" value="${assets[k].v}" 
                style="background:#020617; border:1px solid #334155; color:#38bdf8; padding:8px; border-radius:8px; font-family:'JetBrains Mono'; text-align:right; width:140px;">
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
        card.className = "post-card";
        card.id = `card-${grp.id}`;
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: -0.01em;">${grp.name}</h3>
                <span class="chevron" id="arrow-${grp.id}" onclick="toggleDrawer('${grp.id}')" style="cursor:pointer; background: #1e293b; padding: 6px; border-radius: 8px; color:#64748b; font-size: 0.8rem;">▼</span>
            </div>

            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 8px; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700;">
                    <span>PROGRESS</span>
                    <span style="color: var(--accent);">${prog.toFixed(1)}%</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${prog}%"></div></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Invested</div>
                    <div class="mono-value" style="font-size: 1.1rem; color: #cbd5e1;">₹${Math.round(grp.inv).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Current ${grp.est ? `<span class="info-icon" title="Estimated">i</span>` : ''}</div>
                    <div class="mono-value" style="font-size: 1.1rem; color: #38bdf8;">₹${Math.round(grp.cur).toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Gain</div>
                    <div class="mono-value ${gainAmt >= 0 ? 'gain-positive' : 'gain-negative'}" style="font-size: 1rem;">₹${Math.round(gainAmt).toLocaleString('en-IN')} (${gainPerc.toFixed(1)}%)</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">XIRR</div>
                    <div id="xirr-btn-${grp.id}" class="xirr-clickable mono-value" style="font-size: 1.1rem;">View</div>
                </div>
            </div>

            <div id="drawer-${grp.id}" style="display: none;" class="drawer-content">
                ${grp.items.map(item => {
                    const itemProg = item.target_price > 0 ? Math.min((item.curVal / item.target_price) * 100, 100) : 0;
                    const iGainAmt = item.curVal - item.s.inv;
                    const iGainPerc = item.s.inv > 0 ? (iGainAmt / item.s.inv) * 100 : 0;
                    
                    return `
                    <div class="child-item-row">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <div style="font-size: 1rem; font-weight: 700; color: #f1f5f9;">${currentDisplayMode === 'goal' ? (item.goal_allocations?.[0]?.instrument_name || 'Asset') : item.goal_name}</div>
                                <div style="font-size: 0.75rem; color: #64748b; font-weight: 500;">${item.goal_allocations?.[0]?.broker_name || 'Manual'}</div>
                            </div>
                            <div style="position: relative;">
                                <button onclick="event.stopPropagation(); toggleMenu('${item.id}', '${grp.id}')" class="dots-btn">⋮</button>
                                <div id="menu-${item.id}" class="dropdown-content">
                                    <a href="/log-transaction/?goal_id=${item.id}">Add Transaction</a>
                                    <a href="/goal-history/?goal_id=${item.id}">View History</a>
                                    <a href="/edit-goal/?id=${item.id}">Edit Goal</a>
                                    <a href="#" onclick="deleteGoal('${item.id}')" style="color: #f87171; border-top: 1px solid rgba(255,255,255,0.05);">Delete</a>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
                            <div><div style="font-size: 0.55rem; color: #64748b; font-weight: 700;">INV</div><div class="mono-value" style="font-size: 0.85rem;">₹${Math.round(item.s.inv).toLocaleString('en-IN')}</div></div>
                            <div><div style="font-size: 0.55rem; color: #64748b; font-weight: 700;">CUR</div><div class="mono-value" style="font-size: 0.85rem;">₹${Math.round(item.curVal).toLocaleString('en-IN')}</div></div>
                            <div><div style="font-size: 0.55rem; color: #64748b; font-weight: 700;">GAIN</div><div class="mono-value ${iGainAmt >= 0 ? 'gain-positive' : 'gain-negative'}" style="font-size: 0.85rem;">${iGainPerc.toFixed(1)}%</div></div>
                            <div style="text-align: right;"><div style="font-size: 0.55rem; color: #64748b; font-weight: 700;">XIRR</div><div id="xirr-child-${item.id}" class="xirr-clickable mono-value" style="font-size: 0.85rem;">View</div></div>
                        </div>

                        <div class="progress-track" style="height: 6px; background: #020617;"><div class="progress-fill" style="width: ${itemProg}%; background: #475569;"></div></div>
                    </div>`;
                }).join('')}
            </div>`;
            
        container.appendChild(card);
        
        document.getElementById(`xirr-btn-${grp.id}`).onclick = function() { runXIRR(this, grp.txs, grp.cur); };
        grp.items.forEach(item => {
            document.getElementById(`xirr-child-${item.id}`).onclick = function() { runXIRR(this, item.transactions || [], item.curVal); };
        });
    });
}

// ... [Keep calculateXIRR, runXIRR, toggleDrawer unchanged] ...

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
    a.innerText = open ? '▼' : '▲';
}

function toggleMenu(itemId, cardId) {
    const m = document.getElementById(`menu-${itemId}`);
    const card = document.getElementById(`card-${cardId}`);
    const isVisible = m.classList.contains("show");
    
    document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.post-card').forEach(c => c.classList.remove('active-card'));
    
    if (!isVisible) {
        m.classList.add("show");
        card.classList.add("active-card");
    }
}

function setDisplayMode(m) { 
    currentDisplayMode = m; 
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-group-${m}`).classList.add('active');
    renderDashboard(); 
}

async function deleteGoal(id) { if (confirm("Delete this goal?")) { await supabase.from('goals').delete().eq('id', id); location.reload(); } }

window.onclick = e => { 
    if (!e.target.matches('.dots-btn')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.post-card').forEach(c => c.classList.remove('active-card'));
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
