---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div class="calc-header-wrapper" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--border-base);">
    <h2 style="margin: 0; font-family: 'Lora', serif; font-size: 1.6rem;"><i class="fas fa-wallet" style="margin-right: 12px; color: var(--brand-primary);"></i>Income Tax Calculator</h2>
    <div style="min-width: 240px;">
        <select id="fy-selector" class="calc-select" style="color: var(--brand-primary); width: 100%; padding: 10px 14px; font-weight: 700; border-radius: 8px; border: 2px solid var(--border-base); background: var(--bg-offset);">
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
                    <p style="margin: 0;"><i class="fas fa-exclamation-triangle" style="color: #eab308; margin-right: 8px;"></i> <strong>Note:</strong> You are claiming both HRA and Home Loan (Self-Occupied). Ensure you meet legal criteria.</p>
                </div>

                <div class="calc-custom-row single-row-span">
                    <label for="other-income">Other Income / Allowances / Bonus</label>
                    <input type="text" id="other-income" placeholder="₹ Enter Total Amount">
                </div>
            </div>
        </div>

        <div class="post-card calculation-card">
            <div class="section-card-header">
                <h3><i class="fas fa-gift" style="margin-right: 10px; color: var(--brand-primary);"></i> Perks & Flexi-Benefits</h3>
            </div>
            <div class="section-card-content">
                <div class="dark-mode-notice-box" style="margin-bottom: 20px;">
                    <p style="margin: 0;"><i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i> <strong>Important Note:</strong> Only add perks here if they are already included in your <strong>Other Income</strong> above.</p>
                </div>
                <div id="perks-rows-container"></div>
                <button type="button" id="add-perk-btn" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;">
                    <i class="fas fa-plus-circle"></i> Add Benefit/Perk
                </button>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="80c-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-coins" style="margin-right: 10px; color: var(--brand-primary);"></i>Section 80C Deductions</span>
                <i id="80c-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
            </div>
            <div id="80c-content" class="collapsible-content-wrapper" style="display: block;">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg" style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; margin: 20px 0;">No entries added yet.</p>
                </div>
                <button type="button" id="add-80c-btn" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;">
                    <i class="fas fa-plus-circle"></i> Add Entry
                </button>
                <div style="margin-top: 15px; text-align: right; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
                    Total 80C: <span id="display-80c-total" style="color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="80d-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-hand-holding-medical" style="margin-right: 10px; color: var(--color-danger);"></i>Section 80D: Health Insurance</span>
                <i id="80d-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>
            <div id="80d-content" class="collapsible-content-wrapper" style="display: none;">
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
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 15px; font-weight: 600;">
                    <input type="checkbox" id="parents-senior" style="width: 16px; height: 16px; cursor: pointer;"> Parents are Senior Citizens (60+)
                </label>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="home-loan-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-home" style="margin-right: 10px; color: var(--brand-primary);"></i>Home Loan Assistant</span>
                <i id="home-loan-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>

            <div id="home-loan-content" class="collapsible-content-wrapper" style="display: none;">
                <div style="background: rgba(14, 165, 233, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed var(--brand-primary); margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="font-size: 0.9rem; color: var(--text-primary); font-weight: 700; cursor: pointer;" for="has-home-loan">Do you have an active Home Loan?</label>
                        <input type="checkbox" id="has-home-loan" style="width: 18px; height: 18px; cursor: pointer;">
                    </div>
                </div>

                <div id="home-loan-wizard" style="display: none;">
                    <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-base);">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
                            <input type="checkbox" id="is-first-buyer" style="width: 16px; height: 16px;"> 
                            Is this your first home? (Required for 80EE/80EEA)
                        </label>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 700;">Possession Status</label>
                            <div style="display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-primary);">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="possession" value="completed" checked style="cursor: pointer;"> Fully Constructed</label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="possession" value="under-construction" style="cursor: pointer;"> Under Construction</label>
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 700;">Occupancy Status</label>
                            <div style="display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-primary);">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="occupancy" value="self" checked style="cursor: pointer;"> Self-Occupied</label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="occupancy" value="rented" style="cursor: pointer;"> Rented-out</label>
                            </div>
                        </div>
                    </div>

                    <div id="under-construction-msg" class="calc-warning-banner" style="display: none; color: #b45309; background: #fffbeb; border-color: #f59e0b; margin-bottom: 15px;">
                        <i class="fas fa-info-circle"></i> Interest claimable in 5 installments post-construction.
                    </div>

                    <div id="completed-loan-fields">
                        <div class="calc-grid-layout" style="margin-bottom: 20px;">
                            <div class="calc-custom-row">
                                <label for="loan-principal">Total Principal Paid</label>
                                <input type="text" id="loan-principal">
                            </div>
                            <div class="calc-custom-row">
                                <label for="loan-interest">Total Interest Paid</label>
                                <input type="text" id="loan-interest">
                            </div>
                        </div>

                        <div style="background: var(--bg-offset); padding: 20px; border-radius: 12px; border: 1px solid var(--border-base);">
                            <div class="calc-grid-layout">
                                <div class="calc-custom-row">
                                    <label for="loan-sanction-date">Sanction Date</label>
                                    <input type="date" id="loan-sanction-date" class="calc-select" style="font-size:0.85rem; width: 100%;">
                                </div>
                                <div class="calc-custom-row">
                                    <label for="property-stamp-value">Stamp Duty Value</label>
                                    <input type="text" id="property-stamp-value" placeholder="₹">
                                </div>
                            </div>
                            
                            <div id="branch-80ee-fields" class="calc-custom-row single-row-span" style="display:none; margin-top:15px;">
                                <label for="original-loan-amt" style="color: var(--color-danger);">Sanctioned Loan Amount</label>
                                <input type="text" id="original-loan-amt">
                            </div>
                            <div id="branch-80eea-fields" style="display:none; margin-top:15px; text-align: center;">
                                <p style="font-size: 0.85rem; color: var(--color-success); margin: 0; font-weight: 600;"><i class="fas fa-check-circle"></i> Eligible for 80EEA Affordable Housing Deduction.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="conditional-deductions" style="display: none; margin-top: 20px;">
            <div class="post-card collapsible-section-box" style="border: 2px solid var(--brand-primary);">
                <div id="benefits-summary-header" class="calc-collapse-trigger">
                    <span class="heading-title-text"><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--color-success);"></i>Home Loan Tax Benefits</span>
                    <i id="benefits-summary-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
                </div>

                <div id="benefits-summary-content" class="collapsible-content-wrapper" style="display: block;">
                    <div id="card-24b" class="benefit-flex-row" style="border-left: 4px solid var(--brand-primary);">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 24(b)</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">Interest on Home Loan</p>
                        </div>
                        <span id="display-24b-value" class="benefit-value-text">₹ 0</span>
                    </div>

                    <div id="card-80eea" class="benefit-flex-row" style="display: none; border-left: 4px solid var(--color-success);">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 80EEA</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">Affordable Housing Interest</p>
                        </div>
                        <span id="display-80eea-value" class="benefit-value-text">₹ 0</span>
                    </div>

                    <div id="card-80ee" class="benefit-flex-row" style="display: none; border-left: 4px solid var(--color-danger);">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 80EE</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">First Time Home Buyer</p>
                        </div>
                        <span id="display-80ee-value" class="benefit-value-text">₹ 0</span>
                    </div>
                </div>
            </div>
        </div> 
    </div>
        
    <div class="calc-results sticky-score-panel">
        <h3 style="margin-top: 0; text-align: center;">Tax Liability</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
            <div style="text-align: center; padding: 20px; background: var(--bg-container); border-radius: 12px; border: 1px solid var(--border-base);">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px; font-weight: 700; text-transform: uppercase;">Old Regime</div>
                <div id="old-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
            </div>
            <div style="text-align: center; padding: 20px; background: var(--bg-container); border-radius: 12px; border: 1px solid var(--border-base);">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px; font-weight: 700; text-transform: uppercase;">New Regime</div>
                <div id="new-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: var(--brand-primary); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
            </div>
        </div>

        <button id="view-breakdown-btn" style="width: 100%; margin-top: 25px; padding: 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 10px; background: var(--brand-primary); color: var(--text-on-brand); font-size: 0.95rem;">View Detailed Breakdown</button>
        <button id="save-btn" style="width: 100%; margin-top: 12px; padding: 12px; font-weight: bold; cursor: pointer; border: 2px solid var(--brand-primary); border-radius: 10px; background: transparent; color: var(--brand-primary); font-size: 0.9rem;">Save to Profile</button>
    </div>

</div>

<div id="tax-breakdown-section" class="post-card" style="padding: 25px; border-top: 4px solid var(--brand-primary); margin-top: 30px; width: 100%; box-sizing: border-box;">
    <h3 style="margin-top: 0; text-align: center;"><i class="fas fa-list-ul" style="margin-right: 10px; color: var(--brand-primary);"></i> Detailed Comparison Summary</h3>
    <div class="table-wrapper">
        <table style="min-width: 100%;">
            <thead>
                <tr>
                    <th style="padding: 14px 12px;">Tax Component</th>
                    <th style="padding: 14px 12px; text-align: right;">Old Regime</th>
                    <th style="padding: 14px 12px; text-align: right;">New Regime</th>
                </tr>
            </thead>
            <tbody id="main-comparison-table" style="font-size: 0.95rem;">
                <tr>
                    <td style="padding: 14px 12px;">Gross Salary</td>
                    <td id="summary-gross-salary" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-gross-salary-new" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Standard Deduction</td>
                    <td id="summary-standard-deduction" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-standard-deduction-new" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Section 80C Deductions</td>
                    <td id="summary-80c-deduction" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 14px 12px; text-align: right; color: var(--text-muted); font-style: italic;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">HRA Exemption</td>
                    <td id="summary-hra-deduction" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 14px 12px; text-align: right; color: var(--text-muted); font-style: italic;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Section 80D (Health Insurance)</td>
                    <td id="summary-80d-deduction" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 14px 12px; text-align: right; color: var(--text-muted); font-style: italic;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Home Loan Interest (Sec 24b)</td>
                    <td id="summary-24b-deduction" style="padding: 14px 12px; text-align: right; color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 14px 12px; text-align: right; color: var(--text-muted); font-style: italic;">Not Eligible</td>
                </tr>
                <tr style="background: rgba(14, 165, 233, 0.04); font-weight: bold;">
                    <td style="padding: 14px 12px;">Taxable Net Income</td>
                    <td id="summary-taxable-old" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-taxable-new" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr style="font-weight: bold; background: rgba(16, 185, 129, 0.04);">
                    <td style="padding: 14px 12px;">Net Tax Payable (incl. Cess)</td>
                    <td id="summary-total-tax-old" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-total-tax-new" style="padding: 14px 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div id="mobile-tax-bar" class="mobile-tracker-bar">
    <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: var(--text-muted); font-weight:700;">OLD</div>
        <div id="float-old-tax" style="font-weight: bold; font-family: 'JetBrains Mono', monospace;">₹ 0</div>
    </div>
    <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: var(--text-muted); font-weight:700;">NEW</div>
        <div id="float-new-tax" style="font-weight: bold; font-family: 'JetBrains Mono', monospace; color: var(--brand-primary);">₹ 0</div>
    </div>
</div>

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

<script>
    // Pure Indian Number Formatter Functionality
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
        let x = Math.round(num).toString();
        let lastThree = x.substring(x.length - 3);
        let otherBits = x.substring(0, x.length - 3);
        if(otherBits != '') lastThree = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
        return '₹ ' + lastThree;
    }

    // Modern Event Attachment to clear Jekyll pipeline compilation blocks safely
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

        // Bind standard layout components
        ['basic-salary', 'hra-received', 'rent-paid', 'other-income', '80d-self', '80d-parents', 'loan-principal', 'loan-interest', 'property-stamp-value', 'original-loan-amt'].forEach(setupCalcInput);
        ['fy-selector', 'is-metro', 'parents-senior', 'loan-sanction-date'].forEach(setupCalcChange);

        // Accordion triggers binding safely post-load
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

        // Dynamic element trigger setup
        const addPerkBtn = document.getElementById('add-perk-btn');
        if(addPerkBtn) addPerkBtn.addEventListener('click', function() { if(typeof addPerkRow === 'function') addPerkRow(); });

        const add80cBtn = document.getElementById('add-80c-btn');
        if(add80cBtn) add80cBtn.addEventListener('click', function() { if(typeof add80CRow === 'function') add80CRow(); });

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

<style>
    /* 1. Resetting Collapsible Header Layout to match normal container card flows */
    .unique-tax-calc .collapsible-section-box {
        padding: 0 !important;
        overflow: hidden;
    }

    .unique-tax-calc .calc-collapse-trigger {
        padding: 20px 25px !important;
        background: transparent !important;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        border: none !important;
    }

    .unique-tax-calc .collapsible-content-wrapper {
        padding: 5px 25px 25px 25px !important;
        border-top: 1px solid var(--border-base);
    }

    .unique-tax-calc .heading-title-text {
        font-family: 'Lora', serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .unique-tax-calc .toggle-chevron-arrow {
        transition: transform 0.3s ease;
        color: var(--text-muted);
    }

    /* 2. Style Inputs & Select Rows for Perks/80C dynamically created child components */
    .unique-tax-calc .calc-grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }

    .unique-tax-calc .calc-custom-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .unique-tax-calc .calc-custom-row label {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .unique-tax-calc input[type="text"],
    .unique-tax-calc input[type="number"],
    .unique-tax-calc .calc-select,
    #perks-rows-container input,
    #perks-rows-container select,
    #80c-rows-container input,
    #80c-rows-container select {
        width: 100% !important;
        box-sizing: border-box;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        font-size: 1rem !important;
        height: 48px !important;
        background: var(--bg-offset) !important;
        border: 2px solid var(--border-base) !important;
        color: var(--text-primary) !important;
        font-family: 'JetBrains Mono', monospace !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .unique-tax-calc input:focus, 
    .unique-tax-calc select:focus {
        outline: none !important;
        border-color: var(--brand-primary) !important;
        background: var(--bg-container) !important;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important;
    }

    #perks-rows-container > div,
    #80c-rows-container > div {
        display: grid !important;
        grid-template-columns: 1fr 1fr auto !important;
        gap: 15px !important;
        align-items: center !important;
        margin-bottom: 12px !important;
    }

    /* 3. Dark Mode Notice/Banner Container Refinements */
    .unique-tax-calc .dark-mode-notice-box {
        background: #1e293b !important;
        border: 1px solid #334155 !important;
        border-left: 4px solid var(--brand-primary) !important;
        padding: 15px 20px !important;
        border-radius: 8px !important;
        margin-top: 15px;
        margin-bottom: 25px;
    }

    .unique-tax-calc .dark-mode-notice-box p,
    .unique-tax-calc .dark-mode-notice-box strong {
        color: #f8fafc !important;
        font-size: 0.9rem !important;
        line-height: 1.5;
    }

    /* 4. Section 80EEA Alignment Fixes to mirror layout matching Section 24b */
    .unique-tax-calc .benefit-flex-row {
        margin-bottom: 15px;
        padding: 15px 20px;
        background: var(--bg-offset);
        border-radius: 10px;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
    }

    .unique-tax-calc .benefit-value-text {
        font-weight: bold;
        font-size: 1.1rem;
        font-family: 'JetBrains Mono', monospace;
        color: var(--text-primary);
        text-align: right;
    }

    .unique-tax-calc .single-row-span {
        grid-column: 1 / -1;
        margin-top: 10px;
    }

    .unique-tax-calc .calculation-card {
        padding: 25px !important;
        margin-bottom: 25px !important;
    }

    .hidden { display: none !important; }
</style>
