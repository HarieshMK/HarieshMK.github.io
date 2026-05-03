---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div id="calculator-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <!-- Header Section -->
    <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;">
        <div>
            <h1 style="margin: 0; color: #38bdf8; font-family: 'Lora', serif;">💰 Income Tax Calculator</h1>
            <p style="color: var(--calc-text-muted); margin: 5px 0 0 0;">Compare Old vs. New Tax Regime (Updated for 2026-27)</p>
        </div>
        <div style="text-align: right;">
            <label for="fy-selector" style="display: block; font-size: 0.7rem; color: var(--calc-text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Assessment Year</label>
            <select id="fy-selector" class="dynamic-input" style="padding: 5px 12px; font-size: 0.9rem; min-width: 140px; cursor: pointer;" onchange="runCalculator()">
                <option value="2027-28">FY 2027-28</option>
                <option value="2026-27" selected>FY 2026-27</option>
                <option value="2025-26">FY 2025-26</option>
                <option value="2024-25">FY 2024-25</option>
            </select>
        </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 25px;">
        <!-- Left Column: Inputs -->
        <div style="flex: 1 1 550px; min-height: 800px;">

            <!-- Salary Card -->
            <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
                <h3 style="margin-top: 0; color: var(--calc-text-main);">
                    <i class="fas fa-wallet" style="margin-right: 10px; color: #4ade80;"></i>Annual Salary Details
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual Basic Salary</label>
                        <input type="text" id="basic-salary" class="dynamic-input" placeholder="₹ 0" style="width: 100%;" oninput="runCalculator()">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual HRA Received</label>
                        <input type="text" id="hra-received" class="dynamic-input" placeholder="₹ 0" style="width: 100%;" oninput="runCalculator()">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Annual Rent Paid</label>
                        <input type="text" id="rent-paid" class="dynamic-input" placeholder="₹ 0" style="width: 100%;" oninput="runCalculator()">
                        <div id="hra-eligible-display" style="font-size: 0.7rem; color: #4ade80; margin-top: 4px; font-weight: bold;"></div>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Living in Metro?</label>
                        <select id="is-metro" class="dynamic-input" style="width: 100%;" onchange="runCalculator()">
                            <option value="false">Non-Metro (40% Basic)</option>
                            <option value="true">Metro (50% Basic)</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Other Taxable Allowances / Bonus</label>
                    <input type="text" id="other-income" class="dynamic-input" placeholder="₹ 0" style="width: 100%;" oninput="runCalculator()">
                </div>
            </div>

            <!-- Perks Card -->
            <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
                <h3 style="margin-top: 0; color: var(--calc-text-main);"><i class="fas fa-gift" style="margin-right: 10px; color: #a855f7;"></i>Exempt Perks (Old Regime)</h3>
                <div style="font-size: 0.75rem; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #fbbf24;">
                    <i class="fas fa-info-circle"></i> Add items like LTA, Food Coupons, or Uniform Allowance here.
                </div>
                <div id="perks-rows-container" style="min-height: 20px;"></div>
                <button type="button" onclick="addPerkRow()" style="background: none; border: 1px dashed #a855f7; color: #a855f7; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;"> 
                    <i class="fas fa-plus-circle"></i> Add Benefit/Perk
                </button>
            </div>

            <!-- 80C Card -->
            <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-coins" style="margin-right: 10px; color: #fbbf24;"></i>Section 80C Deductions</h3>
                </div>
                <div style="margin-top: 15px;">
                    <div id="80c-rows-container" style="min-height: 20px;"></div>
                    <button type="button" onclick="add80CRow()" style="background: none; border: 1px dashed #38bdf8; color: #38bdf8; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                        <i class="fas fa-plus-circle"></i> Add 80C Item (EPF, LIC, ELSS)
                    </button>
                    <div style="margin-top: 15px; text-align: right; font-size: 0.8rem; color: var(--calc-text-muted);">
                        Total 80C: <span id="display-80c-total" style="color: #4ade80; font-weight: bold;">₹ 0</span> / ₹ 1,50,000
                    </div>
                </div>
            </div>

            <!-- Home Loan Card -->
            <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
                <h3 style="margin-top: 0; color: var(--calc-text-main);"><i class="fas fa-home" style="margin-right: 10px; color: #38bdf8;"></i>Home Loan (Section 24b)</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Occupancy Status</label>
                        <select id="loan-occupancy" class="dynamic-input" style="width: 100%;" onchange="runCalculator()">
                            <option value="none">No Home Loan</option>
                            <option value="self">Self Occupied (Max 2L Loss)</option>
                            <option value="let-out">Let Out (No Interest Cap)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Interest Paid (Annual)</label>
                        <input type="text" id="home-interest" class="dynamic-input" placeholder="₹ 0" style="width: 100%;" oninput="runCalculator()">
                    </div>
                </div>
                
                <!-- Extra Loan Logic Container (MANDATORY FOR YOUR JS) -->
                <div id="extra-loan-logic-container" style="margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Loan Sanction Date (For 80EE/80EEA)</label>
                    <input type="date" id="loan-sanction-date" class="dynamic-input" style="width: 100%; margin-top: 5px;" onchange="runCalculator()">
                    
                    <div id="card-80eea" style="display: none; margin-top: 10px; padding: 15px; background: rgba(74, 222, 128, 0.1); border-radius: 8px;">
                        <span style="color: #4ade80; font-size: 0.85rem; font-weight: bold;">Eligible for 80EEA (Extra ₹1.5L)</span>
                        <input type="text" id="80eea-amount" class="dynamic-input" placeholder="Enter Interest" style="width: 100%; margin-top: 8px;" oninput="runCalculator()">
                    </div>

                    <div id="card-80ee" style="display: none; margin-top: 10px; padding: 15px; background: rgba(244, 114, 182, 0.1); border-radius: 8px;">
                        <span style="color: #f472b6; font-size: 0.85rem; font-weight: bold;">Eligible for 80EE (Extra ₹50k)</span>
                        <input type="text" id="80ee-amount" class="dynamic-input" placeholder="Enter Interest" style="width: 100%; margin-top: 8px;" oninput="runCalculator()">
                    </div>
                </div>
            </div>

            <!-- Health & NPS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="post-card" style="padding: 20px; background: var(--calc-card);">
                    <h4 style="margin-top:0; font-size: 0.9rem; color: #f87171;">Section 80D</h4>
                    <label style="font-size: 0.7rem; color: var(--calc-text-muted);">Health Insurance</label>
                    <input type="text" id="80d-self" class="dynamic-input" placeholder="Self/Family" style="width: 100%;" oninput="runCalculator()">
                </div>
                <div class="post-card" style="padding: 20px; background: var(--calc-card);">
                    <h4 style="margin-top:0; font-size: 0.9rem; color: #fbbf24;">80CCD (1B)</h4>
                    <label style="font-size: 0.7rem; color: var(--calc-text-muted);">Extra NPS</label>
                    <input type="text" id="nps-extra" class="dynamic-input" placeholder="Max 50,000" style="width: 100%;" oninput="runCalculator()">
                </div>
            </div>
        </div> 

        <!-- Right Column: Results (Sticky) -->
        <div style="flex: 1 1 300px;">
            <div class="post-card" style="position: sticky; top: 20px; border: 1px solid #38bdf8; padding: 25px; background: var(--calc-card);">
                <h3 style="margin-top: 0; text-align: center; color: var(--calc-text-main);">Tax Liability Comparison</h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
                    <div id="new-regime-box" style="text-align: center; padding: 20px; background: rgba(74, 222, 128, 0.05); border-radius: 12px; border: 2px solid #4ade80;">
                        <div style="font-size: 0.75rem; color: #4ade80; font-weight: bold; margin-bottom: 5px;">NEW REGIME (Default)</div>
                        <div id="new-regime-tax" style="font-size: 2rem; font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                    </div>

                    <div id="old-regime-box" style="text-align: center; padding: 20px; background: var(--calc-input-bg); border-radius: 12px; border: 1px solid var(--calc-input-border);">
                        <div style="font-size: 0.75rem; color: var(--calc-text-muted); margin-bottom: 5px;">OLD REGIME</div>
                        <div id="old-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                    </div>
                    
                    <div id="recommendation-box" style="margin-top: 10px; padding: 15px; border-radius: 8px; font-size: 0.9rem; text-align: center; font-weight: bold;">
                        Enter details to see recommendation
                    </div>
                </div>

                <div id="detailed-comparison-container" style="margin-top: 25px;">
                    <h4 style="color: var(--calc-text-main); margin-bottom: 10px; font-size: 0.8rem; text-transform: uppercase;">Taxable Income Breakdown</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: var(--calc-text-main);">
                        <tbody id="comparison-table-body">
                            <!-- Rows injected by JS -->
                        </tbody>
                    </table>
                </div>

                <button id="save-btn" onclick="handleSave()" class="btn" style="width: 100%; margin-top: 25px; padding: 12px; font-weight: bold; cursor: pointer; border: 1px solid #38bdf8; border-radius: 10px; background: transparent; color: #38bdf8;">
                    <i class="fas fa-cloud-upload-alt" style="margin-right: 8px;"></i>Save to Profile
                </button>
            </div>
        </div> 
    </div> 
</div>
<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
        const cleanNum = (val) => {
        if (!val) return 0;
        // Removes currency symbols, commas, and spaces so "1,00,000" becomes "100000"
        const cleanValue = val.toString().replace(/[^0-9.-]+/g, "");
        return parseFloat(cleanValue) || 0;
    };
    // --- INITIALIZATION ---
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('input[type="number"]').forEach(input => {
                if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', 'decimal');
            });
        
            // Cleaned up Toggles (Removed 24b, Added home-loan)
            setupToggle('80c-header', '80c-content', '80c-icon');
            setupToggle('80d-header', '80d-content', '80d-icon');
            setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon'); // ADDED THIS
            setupToggle('nps-header', 'nps-content', 'nps-icon');
        
            TaxController.init().then(() => {
                const pContainer = document.getElementById('perks-rows-container');
                const cContainer = document.getElementById('80c-rows-container');
        
                if (pContainer && pContainer.children.length === 0) {
                    TaxController.addPerkRow("Professional Tax", 2500);
                }
                if (cContainer && (cContainer.children.length === 0 || cContainer.querySelector('#empty-80c-msg'))) {
                    add80CRow(); 
                }
            });
        });
        // Function to handle perk-specific UI feedback
        function handlePerkUIFeedback(inputElement, perkName) {
            const value = cleanNum(inputElement.value);
            const selectedYear = document.getElementById('fy-selector').value;
            const config = TAX_CONFIG[selectedYear] || TAX_CONFIG["2026-27"];
            
            // 1. MEAL COUPON WARNING LOGIC
            if (perkName === "Meal Coupons") {
                let warningDiv = inputElement.parentNode.querySelector('.perk-limit-warning');
                
                // Create warning div if it doesn't exist
                if (!warningDiv) {
                    warningDiv = document.createElement('div');
                    warningDiv.className = 'perk-limit-warning';
                    inputElement.parentNode.appendChild(warningDiv);
                }
        
                const limit = config.perkRules["Meal Coupons"].govtLimit;
                
                if (value > limit) {
                    warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Standard exempt limit is ₹${limit.toLocaleString('en-IN')}. Amounts above this may be treated as taxable perquisites unless specifically allowed by your employer's policy.`;
                    warningDiv.style.display = 'block';
                } else {
                    warningDiv.style.display = 'none';
                }
            }
        
            // 2. FUEL & MOBILE PLACEHOLDER/HINT LOGIC
            if (perkName === "Fuel Allowances" || perkName === "Mobile & Internet") {
                inputElement.classList.add('actuals-hint');
                inputElement.placeholder = "Enter amount as per bills";
            }
        }
        
        // Hook this into your existing input listener
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('dynamic-input')) {
                // Find the perk name if this input is inside a perk row
                const row = e.target.closest('.perk-row'); // Assuming your rows have this class
                if (row) {
                    const perkSelect = row.querySelector('select');
                    if (perkSelect) handlePerkUIFeedback(e.target, perkSelect.value);
                }
                
                if (typeof runCalculator === 'function') {
                    runCalculator();
                }
            }
        });
        
        // --- HOME LOAN ASSISTANT LOGIC ---
        function toggleLoanWizard() {
            const isChecked = document.getElementById('has-home-loan').checked;
            const wizard = document.getElementById('home-loan-wizard');
            wizard.style.display = isChecked ? 'block' : 'none';
            
            // Only call calc if it's not handled by the general 'input' listener
            updateLoanUI();
        }
        
        function updateLoanUI() {
            const status = document.getElementById('loan-possession').value;
            const isUC = (status === 'under-construction');
            
            document.getElementById('under-construction-msg').style.display = isUC ? 'block' : 'none';
            document.getElementById('completed-loan-fields').style.display = isUC ? 'none' : 'block';
            
            if (typeof runCalculator === 'function') runCalculator();
        }

    // --- YEAR SELECTOR LOGIC ---
    const fySelector = document.getElementById('fy-selector');
    if (fySelector) {
        fySelector.addEventListener('change', () => {
            const subTitle = document.querySelector('p[style*="var(--calc-text-muted)"]');
            if(subTitle) subTitle.innerText = `Compare Old vs. New Tax Regime for Financial Year ${fySelector.value}`;
            runCalculator();
        });
    }

    // --- AUTOMATIC CALCULATION TRIGGER ---
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('dynamic-input') || e.target.type === 'checkbox') {
            if (typeof runCalculator === 'function') {
                runCalculator();
            }
        }
    });
    
    // --- UI HELPERS ---
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

    // --- DYNAMIC ROW LOGIC (Updated for Auto-Calc) ---
    const options80C = typeof InvestmentRegistry !== 'undefined' ? 
                       Object.keys(InvestmentRegistry).filter(k => InvestmentRegistry[k].taxCategory === "80C") : [];

    // --- EXTERNAL BRIDGES ---
   async function handleSave() {
    const btn = document.getElementById('save-btn');
    const status = document.getElementById('save-status');
    
    // 1. GET THE YEAR FROM THE DROPDOWN HERE
    const selectedYear = document.getElementById('fy-selector').value; 

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        status.innerText = "Connecting to database...";

        // 2. PASS THE YEAR TO THE SAVE FUNCTION
        // (Make sure your saveTaxData function in tax-calculator.js is updated to accept this)
        await saveTaxData(selectedYear); 

        btn.innerHTML = `<i class="fas fa-check-circle"></i> Saved for ${selectedYear}!`;
        status.style.color = "#4ade80";
        status.innerText = `Data for ${selectedYear} synced successfully.`;
        
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Profile';
        }, 3000);
    } catch (error) {
            console.error(error);
            status.style.color = "#ef4444";
            status.innerText = "Error saving data.";
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
        }
    }
</script>

<style>
    :root {
        --calc-bg: #ffffff;
        --calc-card: #f8fafc;
        --calc-input-bg: #ffffff;
        --calc-input-border: #e2e8f0;
        --calc-text-main: #1e293b;
        --calc-text-muted: #64748b;
        --calc-accent: #0ea5e9;
    }

    .dark-theme :root, .dark-theme {
        --calc-bg: #0f172a;
        --calc-card: #1e293b;
        --calc-input-bg: #020617;
        --calc-input-border: #334155;
        --calc-text-main: #f1f5f9;
        --calc-text-muted: #94a3b8;
        --calc-accent: #38bdf8;
    }

    .btn:hover {
        background: #38bdf8 !important;
        color: #0f172a !important;
        transform: translateY(-2px);
        transition: all 0.2s ease;
    }
    #hra-eligible-display {
        transition: all 0.3s ease;
    }
    .hidden { display: none !important; }

    .dynamic-input {
        background-color: var(--calc-input-bg) !important;
        border: 2px solid var(--calc-input-border) !important;
        color: var(--calc-text-main) !important;
        border-radius: 10px;
        padding: 10px;
        transition: all 0.2s ease;
    }
    /* Styling for auto-calculated rows like EPF */
    .row-80c-statutory select, 
    .row-80c-statutory input {
        background-color: var(--calc-card) !important;
        border-style: dashed !important;
        pointer-events: none; /* Prevents clicking */
        opacity: 0.7;
        cursor: not-allowed;
    }
    #hra-loan-conflict-warning {
    animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .perk-limit-warning {
        font-size: 0.7rem;
        color: #fbbf24;
        margin-top: 4px;
        background: rgba(251, 191, 36, 0.1);
        padding: 6px;
        border-radius: 4px;
        border-left: 2px solid #fbbf24;
        display: none; /* Hidden by default */
    }
    /* Add this to your <style> section */
    .perk-amount::placeholder {
        font-size: 0.75rem;
        color: var(--calc-text-muted);
        opacity: 0.7;
    }
    /* Style for inputs to show they are 'against bills' */
    .actuals-hint::placeholder {
        font-style: italic;
        opacity: 0.6;
    }

    #mobile-tax-bar {
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--calc-bg);
        border-top: 2px solid var(--calc-accent);
        padding: 12px;
        z-index: 1000;
        justify-content: space-around;
        box-shadow: 0 -4px 10px rgba(0,0,0,0.3);
    }

    #save-btn:hover:not(:disabled) {
        background: rgba(56, 189, 248, 0.1) !important;
    }

    @media (max-width: 768px) {
        #mobile-tax-bar.is-visible { display: flex; }
    }

    .tax-val { font-weight: bold; font-family: 'JetBrains Mono', monospace; }
    .tax-lower { color: #4ade80; }
    .tax-higher { color: #ef4444; }
</style>
