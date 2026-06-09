---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
    function formatIndianInput(el) {
        let val = el.value.replace(/[^0-9.]/g, '');
        if (!val) { el.value = ''; return; }
        
        let parts = val.split('.');
        let num = parts[0];
        
        if(num.length > 3) {
            let lastThree = num.substring(num.length - 3);
            let otherBits = num.substring(0, num.length - 3);
            num = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
        }
        
        el.value = parts.length > 1 ? num + '.' + parts[1].substring(0, 2) : num;
    }

    function parseCleanValue(id) {
        const el = document.getElementById(id);
        if(!el) return 0;
        return parseFloat(el.value.replace(/,/g, '')) || 0;
    }

    function formatIndianNumber(num) {
        let parsedNum = parseFloat(num);
        if (isNaN(parsedNum)) return '₹ 0';
        let x = Math.round(parsedNum).toString();
        let lastThree = x.substring(x.length - 3);
        let otherBits = x.substring(0, x.length - 3);
        if(otherBits != '') lastThree = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
        return '₹ ' + lastThree;
    }

    document.addEventListener("DOMContentLoaded", function() {
        const setupCalcInput = (id) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', function() {
                    formatIndianInput(this);
                    if(typeof calculateAll === 'function') calculateAll();
                });
            }
        };

        const setupCalcChange = (id) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('change', function() {
                    if(typeof calculateAll === 'function') calculateAll();
                });
            }
        };

        ['basic-salary', 'hra-received', 'rent-paid', 'other-income', '80d-self', '80d-parents', 'loan-principal', 'loan-interest', 'property-stamp-value', 'original-loan-amt'].forEach(setupCalcInput);
        ['fy-selector', 'is-metro', 'parents-senior', 'loan-sanction-date'].forEach(setupCalcChange);

        const bindToggle = (headerId, contentId, iconId) => {
            const header = document.getElementById(headerId);
            if(header) {
                header.addEventListener('click', function() {
                    if(window.TaxController && typeof window.TaxController.setupToggle === 'function') {
                        window.TaxController.setupToggle(headerId, contentId, iconId);
                    }
                });
            }
        };

        bindToggle('80c-header', '80c-content', '80c-icon');
        bindToggle('80d-header', '80d-content', '80d-icon');
        bindToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
        bindToggle('benefits-summary-header', 'benefits-summary-content', 'benefits-summary-icon');

        const addPerkBtn = document.getElementById('add-perk-btn');
        if(addPerkBtn) {
            addPerkBtn.addEventListener('click', function() { 
                if(window.TaxController && typeof window.TaxController.addPerkRow === 'function') {
                    window.TaxController.addPerkRow(); 
                }
            });
        }
            
        const add80cBtn = document.getElementById('add-80c-btn');
        if(add80cBtn) {
            add80cBtn.addEventListener('click', function() { 
                if(window.TaxController && typeof window.TaxController.add80CRow === 'function') {
                    window.TaxController.add80CRow(); 
                }
            });
        }

        const homeLoanCheck = document.getElementById('has-home-loan');
        if(homeLoanCheck) {
            homeLoanCheck.addEventListener('change', function() {
                if(window.TaxController && typeof window.TaxController.toggleLoanWizard === 'function') {
                    window.TaxController.toggleLoanWizard();
                }
            });
        }

        const possessionRadios = document.querySelectorAll('input[name="possession"]');
        possessionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if(window.TaxController && typeof window.TaxController.handleLoanStatusChange === 'function') {
                    window.TaxController.handleLoanStatusChange();
                }
            });
        });

        const occupancyRadios = document.querySelectorAll('input[name="occupancy"]');
        occupancyRadios.forEach(radio => {
            radio.addEventListener('change', function() { if(typeof calculateAll === 'function') calculateAll(); });
        });

        const viewBreakdownBtn = document.getElementById('view-breakdown-btn');
        if(viewBreakdownBtn) viewBreakdownBtn.addEventListener('click', function() { if(typeof scrollToResults === 'function') scrollToResults(); });

        const saveBtn = document.getElementById('save-btn');
        if(saveBtn) saveBtn.addEventListener('click', function() { if(typeof handleSave === 'function') handleSave(); });
    });
</script>


<div class="calc-header-wrapper">
    <h2 class="calc-main-title"><i class="fas fa-wallet"></i> Income Tax Calculator</h2>
    <div class="calc-fy-dropdown-container">
        <select id="fy-selector" class="calc-select">
            <option value="2026-27" selected>FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option> 
        </select>
    </div>
</div>

<div class="calculator-container unique-tax-calc">

    <div class="calc-inputs">
        
        <div class="post-card calculation-card">
            <div class="section-card-header">
                <h3>🏢 Annual Salary Details</h3>
            </div>
            <div class="section-card-content">
                <div class="calc-grid-layout">
                    <div class="calc-custom-row">
                        <label for="basic-salary">Basic Salary (Annual)</label>
                        <input type="text" id="basic-salary" value="12,00,000">
                    </div>

                    <div class="calc-custom-row">
                        <label for="hra-received">HRA Received (Annual)</label>
                        <input type="text" id="hra-received" value="5,00,000">
                    </div>

                    <div class="calc-custom-row">
                        <label for="rent-paid">Actual Rent Paid (Annual)</label>
                        <input type="text" id="rent-paid" value="3,60,000">
                    </div>

                    <div class="calc-custom-row">
                        <label for="is-metro">City of Residence</label>
                        <select id="is-metro" class="calc-select">
                            <option value="true" selected>Metro</option>
                            <option value="false">Non-Metro</option>
                        </select>
                    </div>
                </div>

                <div id="hra-warning" class="calc-warning-banner" style="display: none;"></div>

                <div class="dark-mode-notice-box">
                    <p><i class="fas fa-exclamation-triangle"></i> <strong>Note:</strong> You are claiming both HRA and Home Loan (Self-Occupied). Ensure you meet legal criteria.</p>
                </div>

                <div class="calc-custom-row single-row-span">
                    <label for="other-income">Other Income / Allowances / Bonus</label>
                    <input type="text" id="other-income" placeholder="₹ Enter Total Amount">
                </div>
            </div>
        </div>

        <div class="post-card calculation-card">
            <div class="section-card-header">
                <h3><i class="fas fa-gift"></i> Perks & Flexi-Benefits</h3>
            </div>
            <div class="section-card-content">
                <div class="dark-mode-notice-box notice-margin-bottom">
                    <p><i class="fas fa-info-circle"></i> <strong>Important Note:</strong> Only add perks here if they are already included in your <strong>Other Income</strong> above.</p>
                </div>
                <div id="perks-rows-container"></div>
                <button type="button" id="add-perk-btn" class="btn-secondary-outline full-width-btn">
                    <i class="fas fa-plus-circle"></i> Add Benefit/Perk
                </button>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="80c-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-coins"></i> Section 80C Deductions</span>
                <i id="80c-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
            </div>
            <div id="80c-content" class="collapsible-content-wrapper display-block-init">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg">No entries added yet.</p>
                </div>
                <button type="button" id="add-80c-btn" class="btn-secondary-outline full-width-btn">
                    <i class="fas fa-plus-circle"></i> Add Entry
                </button>
                <div class="calc-total-summary-text">
                    Total 80C: <span id="display-80c-total">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="80d-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-hand-holding-medical"></i> Section 80D: Health Insurance</span>
                <i id="80d-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>
            <div id="80d-content" class="collapsible-content-wrapper display-none-init">
                <div class="calc-grid-layout">
                    <div class="calc-custom-row">
                        <label for="80d-self">Self, Spouse & Children</label>
                        <input type="text" id="80d-self" placeholder="Max ₹25,000">
                    </div>
                    <div class="calc-custom-row">
                        <label for="80d-parents">Parents Premium</label>
                        <input type="text" id="80d-parents" placeholder="Max ₹25,000">
                    </div>
                </div>
                <label class="calc-checkbox-label-wrapper">
                    <input type="checkbox" id="parents-senior"> Parents are Senior Citizens (60+)
                </label>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="home-loan-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-home"></i> Home Loan Assistant</span>
                <i id="home-loan-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>

            <div id="home-loan-content" class="collapsible-content-wrapper display-none-init">
                <div class="home-loan-active-banner">
                    <div class="flex-space-between-center">
                        <label class="home-loan-toggle-label" for="has-home-loan">Do you have an active Home Loan?</label>
                        <input type="checkbox" id="has-home-loan">
                    </div>
                </div>

                <div id="home-loan-wizard" style="display: none;">
                    <div class="wizard-row-border">
                        <label class="wizard-checkbox-label">
                            <input type="checkbox" id="is-first-buyer"> 
                            Is this your first home? (Required for 80EE/80EEA)
                        </label>
                    </div>

                    <div class="wizard-grid-dual-column">
                        <div>
                            <label class="wizard-section-subtitle">Possession Status</label>
                            <div class="wizard-radio-group">
                                <label><input type="radio" name="possession" value="completed" checked> Fully Constructed</label>
                                <label><input type="radio" name="possession" value="under-construction"> Under Construction</label>
                            </div>
                        </div>
                        <div>
                            <label class="wizard-section-subtitle">Occupancy Status</label>
                            <div class="wizard-radio-group">
                                <label><input type="radio" name="occupancy" value="self" checked> Self-Occupied</label>
                                <label><input type="radio" name="occupancy" value="rented"> Rented-out</label>
                            </div>
                        </div>
                    </div>

                    <div id="under-construction-msg" class="calc-warning-banner construction-alert-theme" style="display: none;">
                        <i class="fas fa-info-circle"></i> Interest claimable in 5 installments post-construction.
                    </div>

                    <div id="completed-loan-fields">
                        <div class="calc-grid-layout field-margin-bottom">
                            <div class="calc-custom-row">
                                <label for="loan-principal">Total Principal Paid</label>
                                <input type="text" id="loan-principal">
                            </div>
                            <div class="calc-custom-row">
                                <label for="loan-interest">Total Interest Paid</label>
                                <input type="text" id="loan-interest">
                            </div>
                        </div>

                        <div class="wizard-inner-nested-box">
                            <div class="calc-grid-layout">
                                <div class="calc-custom-row">
                                    <label for="loan-sanction-date">Sanction Date</label>
                                    <input type="date" id="loan-sanction-date" class="calc-select select-date-override">
                                </div>
                                <div class="calc-custom-row">
                                    <label for="property-stamp-value">Stamp Duty Value</label>
                                    <input type="text" id="property-stamp-value" placeholder="₹">
                                </div>
                            </div>
                            
                            <div id="branch-80ee-fields" class="calc-custom-row single-row-span target-margin-top" style="display:none;">
                                <label for="original-loan-amt" class="danger-label-text">Sanctioned Loan Amount</label>
                                <input type="text" id="original-loan-amt">
                            </div>
                            <div id="branch-80eea-fields" class="target-margin-top text-center" style="display:none;">
                                <p class="affordable-success-msg"><i class="fas fa-check-circle"></i> Eligible for 80EEA Affordable Housing Deduction.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="conditional-deductions" style="display: none; margin-top: 25px;">
            <div class="post-card collapsible-section-box summary-card-shadow-box">
                
                <div id="benefits-summary-header" class="calc-collapse-trigger summary-header-bg">
                    <span class="heading-title-text summary-heading-flex">
                        <i class="fas fa-chart-line summary-icon-color"></i>
                        Home Loan Tax Benefits Summary
                    </span>
                    <i id="benefits-summary-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
                </div>

                <div id="benefits-summary-content" class="collapsible-content-wrapper summary-content-container">
                    
                    <div id="card-24b" class="benefit-flex-row benefit-card-blue">
                        <div class="benefit-text-stack">
                            <div class="benefit-badge-group">
                                <h4 class="benefit-section-title">Section 24(b)</h4>
                                <span class="badge-label badge-blue">Home Loan Interest</span>
                            </div>
                            <p class="benefit-description">Deduction for Interest on Home Loan</p>
                        </div>
                        <div id="display-24b-value" class="benefit-value-text value-blue">₹ 0</div>
                    </div>

                    <div id="card-80eea" class="benefit-flex-row benefit-card-green" style="display: none;">
                        <div class="benefit-text-stack">
                            <div class="benefit-badge-group">
                                <h4 class="benefit-section-title">Section 80EEA</h4>
                                <span class="badge-label badge-green">Affordable Housing</span>
                            </div>
                            <p class="benefit-description">Additional Interest Deduction</p>
                        </div>
                        <div id="display-80eea-value" class="benefit-value-text value-green">₹ 0</div>
                    </div>

                    <div id="card-80ee" class="benefit-flex-row benefit-card-red" style="display: none;">
                        <div class="benefit-text-stack">
                            <div class="benefit-badge-group">
                                <h4 class="benefit-section-title">Section 80EE</h4>
                                <span class="badge-label badge-red">First Time Buyer</span>
                            </div>
                            <p class="benefit-description">Early Scheme Interest Benefit for Legacy Loans</p>
                        </div>
                        <div id="display-80ee-value" class="benefit-value-text value-red">₹ 0</div>
                    </div>

                </div>
            </div>
        </div>
    </div>
        
    <div class="calc-results sticky-score-panel">
        <h3 class="results-main-title">Tax Liability</h3>
        <div class="results-grid-container">
            <div class="regime-score-card">
                <div class="regime-label">Old Regime</div>
                <div id="old-regime-tax" class="regime-value text-primary-color">₹ 0</div>
            </div>
            <div class="regime-score-card">
                <div class="regime-label">New Regime</div>
                <div id="new-regime-tax" class="regime-value brand-primary-color">₹ 0</div>
            </div>
        </div>

        <button id="view-breakdown-btn" class="btn-primary-action">View Detailed Breakdown</button>
        <button id="save-btn" class="btn-secondary-action">Save to Profile</button>
    </div>

</div>

<div id="tax-breakdown-section" class="post-card breakdown-section-wrapper">
    <h3 class="breakdown-table-title"><i class="fas fa-list-ul"></i> Detailed Comparison Summary</h3>
    <div class="table-wrapper">
        <table class="full-width-table">
            <thead>
                <tr>
                    <th>Tax Component</th>
                    <th class="text-right">Old Regime</th>
                    <th class="text-right">New Regime</th>
                </tr>
            </thead>
            <tbody id="main-comparison-table">
                <tr>
                    <td>Gross Salary</td>
                    <td id="summary-gross-salary" class="text-right tabular-nums">₹ 0</td>
                    <td id="summary-gross-salary-new" class="text-right tabular-nums">₹ 0</td>
                </tr>
                <tr>
                    <td>Standard Deduction</td>
                    <td id="summary-standard-deduction" class="text-right color-success tabular-nums">₹ 0</td>
                    <td id="summary-standard-deduction-new" class="text-right color-success tabular-nums">₹ 0</td>
                </tr>
                <tr>
                    <td>Section 80C Deductions</td>
                    <td id="summary-80c-deduction" class="text-right color-success tabular-nums">₹ 0</td>
                    <td class="text-right text-muted italic-text">Not Eligible</td>
                </tr>
                <tr>
                    <td>HRA Exemption</td>
                    <td id="summary-hra-deduction" class="text-right color-success tabular-nums">₹ 0</td>
                    <td class="text-right text-muted italic-text">Not Eligible</td>
                </tr>
                <tr>
                    <td>Section 80D (Health Insurance)</td>
                    <td id="summary-80d-deduction" class="text-right color-success tabular-nums">₹ 0</td>
                    <td class="text-right text-muted italic-text">Not Eligible</td>
                </tr>
                <tr>
                    <td>Home Loan Interest (Sec 24b)</td>
                    <td id="summary-24b-deduction" class="text-right color-success tabular-nums">₹ 0</td>
                    <td class="text-right text-muted italic-text">Not Eligible</td>
                </tr>
                <tr class="table-row-highlight-blue">
                    <td>Taxable Net Income</td>
                    <td id="summary-taxable-old" class="text-right tabular-nums">₹ 0</td>
                    <td id="summary-taxable-new" class="text-right tabular-nums">₹ 0</td>
                </tr>
                <tr class="table-row-highlight-green">
                    <td>Net Tax Payable (incl. Cess)</td>
                    <td id="summary-total-tax-old" class="text-right tabular-nums">₹ 0</td>
                    <td id="summary-total-tax-new" class="text-right tabular-nums">₹ 0</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div id="mobile-tax-bar" class="mobile-tracker-bar">
    <div class="text-center">
        <div class="mobile-bar-label">OLD</div>
        <div id="float-old-tax" class="tabular-nums font-bold">₹ 0</div>
    </div>
    <div class="text-center">
        <div class="mobile-bar-label">NEW</div>
        <div id="float-new-tax" class="tabular-nums font-bold brand-primary-color">₹ 0</div>
    </div>
</div>


<style>
    /* Structural definitions for components and layout alignments */
    .unique-tax-calc .collapsible-section-box { padding: 0; overflow: hidden; }
    .unique-tax-calc .calc-collapse-trigger { padding: 20px 25px; background: transparent; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: none; }
    .unique-tax-calc .collapsible-content-wrapper { padding: 5px 25px 25px 25px; border-top: 1px solid var(--border-base); }
    .unique-tax-calc .heading-title-text { font-family: 'Lora', serif; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .unique-tax-calc .toggle-chevron-arrow { transition: transform 0.3s ease; color: var(--text-muted); }
    .unique-tax-calc .calc-grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .unique-tax-calc .calc-custom-row { display: flex; flex-direction: column; gap: 8px; }
    .unique-tax-calc .calc-custom-row label { font-weight: 700; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .unique-tax-calc .dark-mode-notice-box { background: #1e293b; border: 1px solid #334155; border-left: 4px solid var(--brand-primary); padding: 15px 20px; border-radius: 8px; margin-top: 15px; margin-bottom: 25px; }
    .unique-tax-calc .dark-mode-notice-box p, .unique-tax-calc .dark-mode-notice-box strong { color: #f8fafc; font-size: 0.9rem; line-height: 1.5; }

    /* Dynamic runtime element containers injected by JS controllers */
    #perks-rows-container > div, #80c-rows-container > div { display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 15px; align-items: center; margin-bottom: 12px; }
    .notice-margin-bottom { margin-bottom: 20px; }
    .full-width-btn { width: 100%; padding: 12px; margin-top: 10px; }
    .display-block-init { display: block; }
    .display-none-init { display: none; }
    .calc-total-summary-text { margin-top: 15px; text-align: right; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
    .calc-checkbox-label-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 15px; font-weight: 600; }
    .calc-checkbox-label-wrapper input { width: 16px; height: 16px; cursor: pointer; }
    
    /* Home Loan Wizard Styling Structure elements */
    .home-loan-active-banner { background: rgba(14, 165, 233, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed var(--brand-primary); margin-bottom: 20px; }
    .flex-space-between-center { display: flex; align-items: center; justify-content: space-between; }
    .home-loan-toggle-label { font-size: 0.9rem; color: var(--text-primary); font-weight: 700; cursor: pointer; }
    #has-home-loan { width: 18px; height: 18px; cursor: pointer; }
    .wizard-row-border { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-base); }
    .wizard-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; }
    .wizard-checkbox-label input { width: 16px; height: 16px; }
    .wizard-grid-dual-column { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .wizard-section-subtitle { font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 700; }
    .wizard-radio-group { display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-primary); }
    .wizard-radio-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .construction-alert-theme { color: #b45309; background: #fffbeb; border-color: #f59e0b; margin-bottom: 15px; }
    .field-margin-bottom { margin-bottom: 20px; }
    .wizard-inner-nested-box { background: var(--bg-offset); padding: 20px; border-radius: 12px; border: 1px solid var(--border-base); }
    .select-date-override { font-size: 0.85rem; width: 100%; }
    .target-margin-top { margin-top: 15px; }
    .affordable-success-msg { font-size: 0.85rem; color: var(--color-success); margin: 0; font-weight: 600; }

    /* Core premium inputs properties */
    .unique-tax-calc input[type="text"],
    .unique-tax-calc input[type="number"],
    .unique-tax-calc select,
    .unique-tax-calc .dynamic-input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 20px;
        border-radius: 14px;
        font-size: 1.1rem;
        height: 50px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        transition: all 0.25s ease-in-out;
        text-align: left;
    }

    /* Hierarchy field scale tuning over dynamic target rows */
    #perks-rows-container select, #perks-rows-container input,
    #80c-rows-container select, #80c-rows-container input,
    #loan-sanction-date {
        height: 42px;
        padding: 8px 14px;
        font-size: 0.95rem;
        border-radius: 10px;
    }

    /* Responsive benefit matrix rows layout structure */
    .benefit-flex-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--bg-offset);
        border-radius: 10px;
        box-sizing: border-box;
        width: 100%;
        min-height: 80px;
        gap: 15px;
    }
    .benefit-card-blue { border-left: 4px solid var(--brand-primary); }
    .benefit-card-green { border-left: 4px solid var(--color-success); }
    .benefit-card-red { border-left: 4px solid var(--color-danger); }
    .benefit-text-stack { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; text-align: left; flex: 1; min-width: 0; }
    .benefit-badge-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .benefit-section-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
    .badge-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    .badge-blue { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
    .badge-green { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
    .badge-red { background: rgba(239, 68, 68, 0.15); color: var(--color-danger); }
    .benefit-description { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .benefit-value-text { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; text-align: right; margin-left: auto; white-space: nowrap; flex-shrink: 0; }
    .value-blue { color: #38bdf8; }
    .value-green { color: var(--color-success); }
    .value-red { color: var(--color-danger); }

    /* Theme Engine Contrast Layer Definitions */
    .dark-theme .unique-tax-calc input, .dark-theme .unique-tax-calc select {
        background-color: #0b1329;
        border: 1.5px solid #1e293b;
        color: #38bdf8;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    }
    html:not(.dark-theme) .unique-tax-calc input, html:not(.dark-theme) .unique-tax-calc select {
        background-color: #ffffff;
        border: 1.5px solid #e2e8f0;
        color: #0284c7;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    .unique-tax-calc input:focus, .unique-tax-calc select:focus {
        outline: none;
        border-color: #0ea5e9;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }

    /* Mobile media break adjustments */
    @media (max-width: 768px) {
        .benefit-flex-row { flex-direction: column; align-items: flex-start; gap: 12px; padding: 15px; }
        .benefit-value-text { margin-left: 0; width: 100%; text-align: left; border-top: 1px dashed var(--border-base); padding-top: 8px; }
        #perks-rows-container > div, #80c-rows-container > div { grid-template-columns: 1fr; gap: 8px; padding: 12px; background: var(--bg-offset); border-radius: 12px; }
    }
</style>
