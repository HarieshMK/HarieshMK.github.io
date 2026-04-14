---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;">
    <div>
        <h1 style="margin: 0; color: #38bdf8; font-family: 'Lora', serif;">💰 Income Tax Calculator</h1>
        <p style="color: var(--calc-text-muted); margin: 5px 0 0 0;" id="fy-subtitle">Compare Old vs. New Tax Regime for FY 2026-27</p>
    </div>
    <div style="text-align: right;">
        <label for="fy-selector" style="display: block; font-size: 0.7rem; color: var(--calc-text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Assessment Year</label>
        <select id="fy-selector" class="dynamic-input" style="padding: 5px 12px; font-size: 0.9rem; min-width: 140px; cursor: pointer;">
            <option value="2027-28">FY 2027-28</option>
            <option value="2026-27" selected>FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
        </select>
    </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 25px;">
    
    <div style="flex: 1 1 550px;">

        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <h3 style="margin-top: 0; color: var(--calc-text-main);"><i class="fas fa-wallet" style="margin-right: 10px; color: #4ade80;"></i>1. Annual Salary Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual Basic Salary</label>
                    <input type="number" id="basic-salary" class="dynamic-input" placeholder="₹" style="width: 100%;" inputmode="decimal">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual HRA Received</label>
                    <input type="number" id="hra-received" class="dynamic-input" placeholder="₹" style="width: 100%;" inputmode="decimal">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual Rent Paid</label>
                    <input type="number" id="rent-paid" class="dynamic-input" placeholder="₹" style="width: 100%;" inputmode="decimal">
                    <div id="hra-eligible-display" style="font-size: 0.7rem; color: #4ade80; margin-top: 4px; font-weight: bold;"></div>
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Living in Metro?</label>
                    <select id="is-metro" class="dynamic-input" style="width: 100%;">
                        <option value="false">Non-Metro</option>
                        <option value="true">Metro (Delhi, Mumbai, Kol, Chn)</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Other Taxable Allowances / Bonus</label>
                <input type="number" id="other-income" class="dynamic-input" placeholder="₹" style="width: 100%;" inputmode="decimal">
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <h3 style="margin-top: 0; color: var(--calc-text-main);"><i class="fas fa-gift" style="margin-right: 10px; color: #a855f7;"></i>2. Perks & Flexi-Benefits</h3>
            <div style="font-size: 0.75rem; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #fbbf24;">
                <i class="fas fa-exclamation-triangle"></i> <strong>Note:</strong> Only add perks here if they are already included in your salary above.
            </div>
            <div id="perks-rows-container"></div>
            <button type="button" onclick="addPerkRow()" style="background: none; border: 1px dashed #a855f7; color: #a855f7; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                <i class="fas fa-plus-circle"></i> Add Benefit/Perk
            </button>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <div id="home-loan-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-home" style="margin-right: 10px; color: #38bdf8;"></i>3. Home Loan Details</h3>
                <i id="home-loan-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>
            <div id="home-loan-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; background: rgba(56, 189, 248, 0.05); padding: 12px; border-radius: 8px; border: 1px dashed var(--calc-accent);">
                    <label style="font-size: 0.9rem; color: var(--calc-text-main); font-weight: 500;">Active Home Loan?</label>
                    <input type="checkbox" id="has-home-loan" onchange="toggleLoanWizard()" style="width: 18px; height: 18px; cursor: pointer;">
                </div>
                <div id="home-loan-wizard" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Possession Status</label>
                        <select id="loan-possession" class="dynamic-input" style="width: 100%; margin-top: 5px;" onchange="updateLoanUI()">
                            <option value="completed">Completed / Fully Constructed</option>
                            <option value="under-construction">Under Construction (CLP)</option>
                        </select>
                    </div>
                    <div id="under-construction-msg" style="display: none; color: #fbbf24; font-size: 0.8rem; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border-left: 3px solid #fbbf24; margin-bottom: 15px;">
                        <i class="fas fa-info-circle"></i> Deductions apply after possession.
                    </div>
                    <div id="completed-loan-fields">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div><label style="font-size: 0.8rem; color: var(--calc-text-muted);">Occupancy</label>
                                <select id="loan-occupancy" class="dynamic-input" style="width: 100%; margin-top: 5px;"><option value="self">Self-Occupied</option><option value="let-out">Let-out</option></select></div>
                            <div><label style="font-size: 0.8rem; color: var(--calc-text-muted);">Sanction Date</label>
                                <input type="date" id="loan-sanction-date" class="dynamic-input" style="width: 100%; margin-top: 5px;"></div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div><label style="font-size: 0.8rem; color: var(--calc-text-muted);">Interest Paid (FY)</label>
                                <input type="number" id="home-interest" class="dynamic-input" placeholder="₹" style="width: 100%; margin-top: 5px;"></div>
                            <div><label style="font-size: 0.8rem; color: var(--calc-text-muted);">Principal Paid (FY)</label>
                                <input type="number" id="home-principal" class="dynamic-input" placeholder="₹" style="width: 100%; margin-top: 5px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <div id="80c-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-coins" style="margin-right: 10px; color: #fbbf24;"></i>4. Section XXX (formerly 80C)</h3>
                <i id="80c-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>
            <div id="80c-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg" style="color: var(--calc-text-muted); font-size: 0.85rem; font-style: italic; text-align: center; margin: 20px 0;">No entries added yet.</p>
                </div>
                <button type="button" onclick="add80CRow()" style="background: none; border: 1px dashed #38bdf8; color: #38bdf8; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                    <i class="fas fa-plus-circle"></i> Add entry
                </button>
                <div style="margin-top: 15px; text-align: right; font-size: 0.8rem; color: var(--calc-text-muted);">
                    Total 80C: <span id="display-80c-total" style="color: #4ade80; font-weight: bold;">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <div id="80d-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-hand-holding-medical" style="margin-right: 10px; color: #f87171;"></i>5. Section YYY (formerly 80D)</h3>
                <i id="80d-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>
            <div id="80d-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Self, Spouse & Children</label>
                    <input type="number" id="80d-self" class="dynamic-input" placeholder="Max ₹25,000" style="width: 100%;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Parents Premium</label>
                    <input type="number" id="80d-parents" class="dynamic-input" placeholder="Max ₹25,000 / ₹50,000" style="width: 100%;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--calc-text-muted); font-size: 0.8rem; margin-top: 8px;">
                        <input type="checkbox" id="parents-senior"> Parents are Senior Citizens (60+)
                    </label>
                </div>
            </div>
        </div>

        <div id="extra-deductions-container"></div>
    </div> 

    <div style="flex: 1 1 300px;">
        <div class="post-card" style="position: sticky; top: 20px; border: 1px solid #38bdf8; padding: 25px; background: var(--calc-card); border-radius: 12px;">
            <h3 style="margin-top: 0; text-align: center; color: var(--calc-text-main);">Tax Liability</h3>
            <div id="old-regime-box" class="regime-box">
                <div style="font-size: 0.75rem; color: var(--calc-text-muted);">OLD REGIME</div>
                <div id="old-regime-tax" class="tax-font">₹ 0</div>
            </div>
            <div id="new-regime-box" class="regime-box">
                <div style="font-size: 0.75rem; color: var(--calc-text-muted);">NEW REGIME</div>
                <div id="new-regime-tax" class="tax-font">₹ 0</div>
            </div>
            <div id="recommendation-box" class="status-box">Enter details to see recommendation.</div>
            
            <button onclick="runCalculator()" class="btn-main">Calculate Tax</button>
            <button id="save-btn" onclick="handleSave()" class="btn-outline">Save to Profile</button>
            
            <div id="save-status" style="margin-top: 10px; font-size: 0.75rem; text-align: center;"></div>

            <div id="detailed-comparison-container" style="margin-top: 25px; display: none;">
                <h4 style="color: var(--calc-text-main); margin-bottom: 10px; font-size: 0.8rem; text-transform: uppercase;">Breakdown</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
                    <thead><tr style="border-bottom: 1px solid var(--calc-input-border); text-align: left;"><th>Item</th><th>New</th><th>Old</th></tr></thead>
                    <tbody id="comparison-table-body"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div id="mobile-tax-bar">
    <div style="text-align: center;"><div class="label">OLD</div><div id="float-old-tax" class="tax-val">₹ 0</div></div>
    <div style="text-align: center;"><div class="label">NEW</div><div id="float-new-tax" class="tax-val">₹ 0</div></div>
</div>

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        setupToggle('80c-header', '80c-content', '80c-icon');
        setupToggle('80d-header', '80d-content', '80d-icon');
        setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');

        TaxController.init().then(() => {
            if (document.getElementById('80c-rows-container').children.length <= 1) add80CRow();
        });
    });

    function setupToggle(h, c, i) {
        const header = document.getElementById(h), content = document.getElementById(c), icon = document.getElementById(i);
        if (header) header.onclick = () => {
            const isH = content.style.display === 'none';
            content.style.display = isH ? 'block' : 'none';
            icon.style.transform = isH ? 'rotate(180deg)' : 'rotate(0deg)';
        };
    }

    function runCalculator() {
        if (typeof TaxController !== 'undefined') TaxController.update();
        handlePopups();
    }

    function handlePopups() {
        const container = document.getElementById('extra-deductions-container');
        const interest = parseFloat(document.getElementById('home-interest').value) || 0;
        const sanction = document.getElementById('loan-sanction-date').value;
        let html = '';

        if (interest > 0) {
            html += `<div class="post-card popup-card">
                <h3>6. Section ZZZ (formerly 24B)</h3>
                <div class="pop-row"><span>Interest Claim</span><input readonly class="locked" value="₹ ${Math.min(interest, 200000)}"><i class="fas fa-lock"></i></div>
            </div>`;
        }

        if (sanction && interest > 200000) {
            const date = new Date(sanction);
            if (date >= new Date('2019-04-01') && date <= new Date('2022-03-31')) {
                html += `<div class="post-card popup-card" style="border-left-color: #38bdf8;">
                    <h3>7. Section AAA (formerly 80EEA)</h3>
                    <div class="pop-row"><span>Extra Claim</span><input readonly class="locked" value="₹ ${Math.min(interest - 200000, 150000)}"><i class="fas fa-lock"></i></div>
                </div>`;
            }
        }
        container.innerHTML = html;
    }

    function add80CRow() {
        const msg = document.getElementById('empty-80c-msg'); if(msg) msg.remove();
        const div = document.createElement('div'); div.className = 'dynamic-row';
        div.innerHTML = `<select class="dynamic-input" style="flex:1;"><option>EPF</option><option>PPF</option><option>ELSS</option></select>
                         <input type="number" class="dynamic-input" style="flex:1;" placeholder="₹">
                         <button onclick="this.parentElement.remove(); runCalculator()" class="row-del">×</button>`;
        document.getElementById('80c-rows-container').appendChild(div);
    }

    function addPerkRow() {
        const div = document.createElement('div'); div.className = 'dynamic-row';
        div.innerHTML = `<input type="text" class="dynamic-input" style="flex:1.5;" placeholder="Benefit Name">
                         <input type="number" class="dynamic-input" style="flex:1;" placeholder="₹">
                         <button onclick="this.parentElement.remove(); runCalculator()" class="row-del">×</button>`;
        document.getElementById('perks-rows-container').appendChild(div);
    }

    function toggleLoanWizard() {
        const checked = document.getElementById('has-home-loan').checked;
        document.getElementById('home-loan-wizard').style.display = checked ? 'block' : 'none';
    }

    function updateLoanUI() {
        const isUC = document.getElementById('loan-possession').value === 'under-construction';
        document.getElementById('under-construction-msg').style.display = isUC ? 'block' : 'none';
        document.getElementById('completed-loan-fields').style.display = isUC ? 'none' : 'block';
        runCalculator();
    }

    document.addEventListener('input', runCalculator);
    
    async function handleSave() {
        const btn = document.getElementById('save-btn');
        const year = document.getElementById('fy-selector').value;
        btn.innerHTML = 'Saving...';
        try {
            await saveTaxData(year); 
            btn.innerHTML = 'Saved!';
            setTimeout(() => btn.innerHTML = 'Save to Profile', 2000);
        } catch(e) { btn.innerHTML = 'Error!'; }
    }
</script>

<style>
    :root { --calc-bg: #ffffff; --calc-card: #f8fafc; --calc-input-bg: #ffffff; --calc-input-border: #e2e8f0; --calc-text-main: #1e293b; --calc-text-muted: #64748b; --calc-accent: #0ea5e9; }
    .dark-theme :root, .dark-theme { --calc-bg: #0f172a; --calc-card: #1e293b; --calc-input-bg: #020617; --calc-input-border: #334155; --calc-text-main: #f1f5f9; --calc-text-muted: #94a3b8; --calc-accent: #38bdf8; }
    .dynamic-input { background: var(--calc-input-bg); border: 2px solid var(--calc-input-border); color: var(--calc-text-main); border-radius: 10px; padding: 10px; width: 100%; }
    .regime-box { text-align: center; padding: 15px; background: var(--calc-input-bg); border-radius: 12px; border: 1px solid var(--calc-input-border); margin-top: 10px; }
    .tax-font { font-size: 1.5rem; font-weight: bold; font-family: 'JetBrains Mono', monospace; }
    .btn-main { width: 100%; margin-top: 20px; padding: 15px; background: #38bdf8; color: #0f172a; font-weight: bold; border: none; border-radius: 10px; cursor: pointer; }
    .btn-outline { width: 100%; margin-top: 10px; padding: 10px; background: transparent; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 10px; cursor: pointer; }
    .dynamic-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .row-del { background: #f87171; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 0 10px; }
    .popup-card { margin-bottom: 20px; padding: 20px; background: var(--calc-card); border-left: 5px solid #4ade80; border-radius: 12px; animation: fadeIn 0.3s ease; }
    .pop-row { display: grid; grid-template-columns: 1fr 1fr 30px; align-items: center; gap: 10px; margin-top: 10px; }
    .locked { background: rgba(0,0,0,0.05); border: 1px solid var(--calc-input-border); padding: 5px; border-radius: 5px; color: var(--calc-text-muted); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    #mobile-tax-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--calc-bg); border-top: 2px solid var(--calc-accent); padding: 10px; z-index: 1000; justify-content: space-around; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); }
    @media (max-width: 768px) { #mobile-tax-bar { display: flex; } }
</style>
