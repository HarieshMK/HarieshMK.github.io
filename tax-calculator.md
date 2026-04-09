---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div style="margin-bottom: 30px;">
    <h1 style="margin: 0; color: #38bdf8; font-family: 'Lora', serif;">💰 Income Tax Calculator</h1>
    <p style="color: #64748b;">Compare Old vs. New Tax Regime for Financial Year 2026-27</p>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 25px;">
    
    <div style="flex: 1 1 550px;">

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <h3 style="margin-top: 0; color: #fff;"><i class="fas fa-wallet" style="margin-right: 10px; color: #4ade80;"></i>Annual Salary Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Annual Basic Salary</label>
                    <input type="number" id="basic-salary" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Annual HRA Received</label>
                    <input type="number" id="hra-received" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Annual Rent Paid</label>
                    <input type="number" id="rent-paid" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Living in Metro?</label>
                    <select id="is-metro" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                        <option value="false">Non-Metro</option>
                        <option value="true">Metro (Delhi, Mumbai, Kol, Chn)</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label style="font-size: 0.8rem; color: #64748b;">Other Taxable Allowances / Bonus</label>
                <input type="number" id="other-income" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <h3 style="margin-top: 0; color: #fff;"><i class="fas fa-gift" style="margin-right: 10px; color: #a855f7;"></i>Perks & Flexi-Benefits</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">Add employer benefits applied to your CTC.</p>
            <div id="perks-rows-container"></div>
            <button type="button" onclick="addPerkRow()" style="background: none; border: 1px dashed #a855f7; color: #a855f7; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                <i class="fas fa-plus-circle"></i> Add Benefit/Perk
            </button>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <div id="24b-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: #fff;"><i class="fas fa-home" style="margin-right: 10px; color: #38bdf8;"></i>Section 24b: Home Loan Interest</h3>
                <i id="24b-icon" class="fas fa-chevron-down" style="transition: transform 0.3s;"></i>
            </div>
            <div id="24b-content" style="display: none; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 0.8rem; color: #64748b;">Annual Interest Paid</label>
                    <input type="number" id="home-interest" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #38bdf8; font-size: 0.9rem;">
                    <input type="checkbox" id="is-under-construction"> My property is Under Construction (CLP)
                </label>
                <p id="clp-note" style="display: none; font-size: 0.75rem; color: #94a3b8; margin-top: 10px; padding: 10px; background: rgba(56, 189, 248, 0.1); border-radius: 5px;">
                    <i class="fas fa-info-circle"></i> Interest for under-construction property can only be claimed in 5 equal installments starting from the year possession is taken.
                </p>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <div id="80d-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: #fff;"><i class="fas fa-hand-holding-medical" style="margin-right: 10px; color: #f87171;"></i>Section 80D: Health Insurance</h3>
                <i id="80d-icon" class="fas fa-chevron-down" style="transition: transform 0.3s;"></i>
            </div>
            <div id="80d-content" style="display: none; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 0.8rem; color: #64748b;">Self, Spouse & Children</label>
                    <input type="number" id="80d-self" placeholder="Max ₹25,000" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Parents Premium</label>
                    <input type="number" id="80d-parents" placeholder="Max ₹25,000 / ₹50,000" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #94a3b8; font-size: 0.8rem; margin-top: 8px;">
                        <input type="checkbox" id="parents-senior"> Parents are Senior Citizens (60+)
                    </label>
                </div>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <div id="nps-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: #fff;"><i class="fas fa-piggy-bank" style="margin-right: 10px; color: #fbbf24;"></i>80CCD (1B): Extra NPS</h3>
                <i id="nps-icon" class="fas fa-chevron-down" style="transition: transform 0.3s;"></i>
            </div>
            <div id="nps-content" style="display: none; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
                <label style="font-size: 0.8rem; color: #64748b;">Voluntary NPS Contribution</label>
                <input type="number" id="nps-extra" placeholder="Max ₹50,000" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                <p style="font-size: 0.7rem; color: #64748b; margin-top: 8px;">* This is over and above the ₹1.5L limit of 80C.</p>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <div id="80c-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: #fff;"><i class="fas fa-coins" style="margin-right: 10px; color: #fbbf24;"></i>Section 80C Deductions</h3>
                <i id="80c-icon" class="fas fa-chevron-down" style="transition: transform 0.3s;"></i>
            </div>
            <div id="80c-content" style="display: none; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg" style="color: #64748b; font-size: 0.85rem; font-style: italic; text-align: center; margin: 20px 0;">No entries added yet.</p>
                </div>
                <button type="button" onclick="add80CRow()" style="background: none; border: 1px dashed #38bdf8; color: #38bdf8; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                    <i class="fas fa-plus-circle"></i> Add entry
                </button>
                <div style="margin-top: 15px; text-align: right; font-size: 0.8rem; color: #94a3b8;">
                    Total 80C: <span id="display-80c-total" style="color: #4ade80; font-weight: bold;">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>

    </div> 

    <div style="flex: 1 1 300px;">
        <div class="post-card" style="position: sticky; top: 20px; border: 1px solid #38bdf8; padding: 25px;">
            <h3 style="margin-top: 0; text-align: center;">Tax Liability</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
                <div style="text-align: center; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b;">
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">OLD REGIME</div>
                    <div id="old-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: #fff; font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                </div>
                <div style="text-align: center; padding: 20px; background: #0f172a; border-radius: 12px; border: 2px solid #4ade80;">
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">NEW REGIME</div>
                    <div id="new-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                    <div id="recommendation-box" style="margin-top: 20px; padding: 15px; border-radius: 8px; font-size: 0.9rem; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                        Enter your details to see the recommendation.
                    </div>
                </div>
            </div>
            <button onclick="runCalculator()" class="btn" style="width: 100%; margin-top: 25px; padding: 15px; font-weight: bold; cursor: pointer;"> Calculate Tax </button>
        </div>
    </div>
</div>
<div id="mobile-tax-bar">
    <div style="text-align: center;">
        <div style="font-size: 0.6rem; color: #94a3b8;">OLD</div>
        <div id="float-old-tax" class="tax-val">₹ 0</div>
    </div>
    <div style="text-align: center;">
        <div style="font-size: 0.6rem; color: #94a3b8;">NEW</div>
        <div id="float-new-tax" class="tax-val">₹ 0</div>
    </div>
</div>

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
    // Global numeric keypad for all number inputs
    document.addEventListener("DOMContentLoaded", function() {
        const numInputs = document.querySelectorAll('input[type="number"]');
        numInputs.forEach(input => {
            if (!input.hasAttribute('inputmode')) {
                input.setAttribute('inputmode', 'decimal');
            }
        });
    });
    // Toggle Logic
    const clpCheck = document.getElementById('is-under-construction');
    const clpNote = document.getElementById('clp-note');
    const rowsContainer = document.getElementById('80c-rows-container');
    const emptyMsg = document.getElementById('empty-80c-msg');

    function setupToggle(headerId, contentId, iconId) {
        const header = document.getElementById(headerId);
        const content = document.getElementById(contentId);
        const icon = document.getElementById(iconId);
        if (header && content && icon) {
            header.addEventListener('click', () => {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    }

    setupToggle('80c-header', '80c-content', '80c-icon');
    setupToggle('80d-header', '80d-content', '80d-icon');
    setupToggle('24b-header', '24b-content', '24b-icon');
    setupToggle('nps-header', 'nps-content', 'nps-icon');

    clpCheck.addEventListener('change', (e) => clpNote.style.display = e.target.checked ? 'block' : 'none');

    const options80C = typeof InvestmentRegistry !== 'undefined' ? 
                       Object.keys(InvestmentRegistry).filter(k => InvestmentRegistry[k].taxCategory === "80C") : [];

    function add80CRow() {
        if(emptyMsg) emptyMsg.style.display = 'none';
        const rowId = Date.now();
        const row = document.createElement('div');
        row.id = `row-${rowId}`;
        row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
        let selectOptions = options80C.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        row.innerHTML = `
            <select class="row-select-80c" style="flex: 2; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                <option value="" disabled selected>Select Investment</option>
                ${selectOptions}
            </select>
            <input type="number" class="row-amount-80c" placeholder="Amount" oninput="update80CTotal()"
                   style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff; text-align: right;">
            <button onclick="document.getElementById('row-${rowId}').remove(); update80CTotal();" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        rowsContainer.appendChild(row);
    }

    function update80CTotal() {
        let total = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => total += parseFloat(input.value) || 0);
        const displayTotal = document.getElementById('display-80c-total');
        if(displayTotal) displayTotal.innerText = `₹ ${total.toLocaleString('en-IN')}`;
    }

    function runCalculator() {
        if (typeof TaxController !== 'undefined') {
            const results = TaxController.calculateAll(); 
            // Sync the floating bar with the new results
            if(results) {
                syncFloatingBar(results.oldTax, results.newTax);
            }
        } else {
            alert("Error: tax-calculator.js not loaded.");
        }
    }
    function addPerkRow() {
    const container = document.getElementById('perks-rows-container');
    const rowId = Date.now();
    const perkOptions = typeof TAX_CONFIG !== 'undefined' ? Object.keys(TAX_CONFIG.perkRules) : [];
    
    const row = document.createElement('div');
    row.id = `perk-${rowId}`;
    row.style = "display: flex; gap: 10px; margin-bottom: 10px; align-items: center;";
    
    let optionsHTML = perkOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    
    row.innerHTML = `
        <select class="perk-type" style="flex: 2; padding: 10px; border-radius: 6px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
            <option value="" disabled selected>Select Perk</option>
            ${optionsHTML}
        </select>
        <input type="number" class="perk-amount" placeholder="Annual Amount" 
               style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
        <button onclick="document.getElementById('perk-${rowId}').remove()" style="background:none; border:none; color:#ef4444; cursor:pointer;">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(row);
}
    // Function to sync floating bar colors and values
function syncFloatingBar(oldTax, newTax) {
    const floatOld = document.getElementById('float-old-tax');
    const floatNew = document.getElementById('float-new-tax');
    
    floatOld.innerText = `₹ ${oldTax.toLocaleString('en-IN')}`;
    floatNew.innerText = `₹ ${newTax.toLocaleString('en-IN')}`;

    if (oldTax < newTax) {
        floatOld.className = 'tax-val tax-lower';
        floatNew.className = 'tax-val tax-higher';
    } else {
        floatOld.className = 'tax-val tax-higher';
        floatNew.className = 'tax-val tax-lower';
    }
}

// Intersection Observer to hide bar when real results are in view
const observer = new IntersectionObserver((entries) => {
    const bar = document.getElementById('mobile-tax-bar');
    entries.forEach(entry => {
        // If the recommendation box is NOT visible, show the floating bar
        if (entry.isIntersecting) {
            bar.classList.remove('is-visible');
        } else {
            bar.classList.add('is-visible');
        }
    });
}, { threshold: 0.1 });

observer.observe(document.getElementById('recommendation-box'));
    window.addEventListener('load', () => {
    addPerkRow();
    add80CRow();
});
</script>

<style>
    /* Floating Bar - Hidden by default, shown only on mobile */
#mobile-tax-bar {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #0f172a;
    border-top: 2px solid #38bdf8;
    padding: 12px;
    z-index: 1000;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -4px 10px rgba(0,0,0,0.5);
}

@media (max-width: 768px) {
    #mobile-tax-bar.is-visible { display: flex; }
}

.tax-val { font-weight: bold; font-family: 'JetBrains Mono', monospace; }
.tax-lower { color: #4ade80; }
.tax-higher { color: #ef4444; }
</style>
