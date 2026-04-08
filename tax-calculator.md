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
            </div>
            <div style="margin-top: 15px;">
                <label style="font-size: 0.8rem; color: #64748b;">Other Taxable Allowances / Bonus</label>
                <input type="number" id="other-income" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <h3 style="margin-top: 0; color: #fff;"><i class="fas fa-home" style="margin-right: 10px; color: #38bdf8;"></i>Housing & Exemptions</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Monthly Rent Paid</label>
                    <input type="number" id="rent-paid" placeholder="₹" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: #64748b;">Residence City</label>
                    <select id="is-metro" style="width: 100%; padding: 12px; margin-top: 5px; border-radius: 8px; border: 1px solid #1e293b; background: #0f172a; color: #fff;">
                        <option value="true">Metro (Chennai, Mumbai, Delhi, Kol)</option>
                        <option value="false">Non-Metro</option>
                    </select>
                </div>
            </div>

            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #38bdf8;">
                <input type="checkbox" id="has-home-loan"> I have a Home Loan (Section 24b)
            </label>

            <div id="home-loan-section" style="display: none; margin-top: 15px; padding: 15px; border-radius: 10px; border: 1px dashed #38bdf8; background: rgba(56, 189, 248, 0.05);">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-bottom: 10px;">
                    <input type="checkbox" id="is-under-construction"> Under Construction (CLP)
                </label>
                <div id="interest-input-group">
                    <label style="font-size: 0.8rem; color: #64748b;">Annual Interest Paid</label>
                    <input type="number" id="home-interest" placeholder="₹" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    <p id="clp-note" style="display: none; font-size: 0.7rem; color: #94a3b8; margin-top: 8px;">
                        * Under Old Regime, construction interest is claimable in 5 installments after possession.
                    </p>
                </div>
            </div>
        </div>

        <div class="post-card" style="margin-bottom: 20px; padding: 25px;">
            <div id="80c-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h3 style="margin: 0; color: #fff;"><i class="fas fa-piggy-bank" style="margin-right: 10px; color: #fbbf24;"></i>Section 80C Deductions</h3>
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

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
    // --- 1. UI ELEMENT REFS ---
    const homeLoanCheck = document.getElementById('has-home-loan');
    const clpCheck = document.getElementById('is-under-construction');
    const clpNote = document.getElementById('clp-note');
    const homeLoanSection = document.getElementById('home-loan-section');

    const header80C = document.getElementById('80c-header');
    const content80C = document.getElementById('80c-content');
    const icon80C = document.getElementById('80c-icon');
    const rowsContainer = document.getElementById('80c-rows-container');
    const emptyMsg = document.getElementById('empty-80c-msg');

    // --- 2. TOGGLE LOGIC ---
    homeLoanCheck.addEventListener('change', (e) => homeLoanSection.style.display = e.target.checked ? 'block' : 'none');
    clpCheck.addEventListener('change', (e) => clpNote.style.display = e.target.checked ? 'block' : 'none');
    
    header80C.addEventListener('click', () => {
        const isHidden = content80C.style.display === 'none';
        content80C.style.display = isHidden ? 'block' : 'none';
        icon80C.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // --- 3. DYNAMIC 80C ROWS ---
    // Added a check to make sure InvestmentRegistry exists before filtering
    const options80C = typeof InvestmentRegistry !== 'undefined' ? 
                       Object.keys(InvestmentRegistry).filter(k => InvestmentRegistry[k].taxCategory === "80C") : [];

    function add80CRow() {
        if(emptyMsg) emptyMsg.style.display = 'none';
        const rowId = Date.now();
        const row = document.createElement('div');
        row.id = `row-${rowId}`;
        row.className = "dynamic-80c-row";
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

    // --- 4. BRIDGE TO THE JS CONTROLLER ---
    function runCalculator() {
        console.log("Button clicked, calling controller...");
        if (typeof TaxController !== 'undefined') {
            TaxController.calculateAll(); 
        } else {
            console.error("TaxController is missing!");
            alert("Error: tax-calculator.js not loaded.");
        }
    }
</script>
