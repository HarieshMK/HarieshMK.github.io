---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>
<script src="/assets/js/tax-calculator-ui.js"></script>

<div class="calc-header-wrapper" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--border-base);">
    <h2 class="calc-main-title" style="margin: 0; font-family: 'Lora', serif; font-size: 1.6rem;"><i class="fas fa-wallet" style="margin-right: 12px; color: var(--brand-primary);"></i>Income Tax Calculator</h2>
    <div class="calc-custom-row" style="margin-bottom: 0;">
    <div class="custom-select-wrapper" data-target="#fy-selector">
        <div class="custom-select-trigger">
            <span>FY 2026-27</span>
            <i class="fas fa-chevron-down"></i>
        </div>
        <div class="custom-options-panel">
            <div class="custom-option selected" data-value="2026-27">FY 2026-27</div>
            <div class="custom-option" data-value="2025-26">FY 2025-26</div>
        </div>
    </div>
    <select id="fy-selector" style="display: none !important;">
        <option value="2026-27" selected>FY 2026-27</option>
        <option value="2025-26">FY 2025-26</option> 
    </select>
</div>
    <select id="fy-selector" style="display: none !important;">
        <option value="2026-27" selected>FY 2026-27</option>
        <option value="2025-26">FY 2025-26</option> 
    </select>
</div>
<div class="calculator-container unique-tax-calc">
    <div class="mobile-desktop-notice">
    <span>💡 For the best experience and detailed breakdown, we recommend using this calculator on a Desktop/PC.</span>
</div>
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
                    <label>City of Residence</label>
                    <div class="radio-group" style="display: flex; gap: 20px; align-items: center; margin-top: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="is-metro" value="true" checked> Metro
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="is-metro" value="false"> Non-Metro
                        </label>
                    </div>
                </div>                </div>
                <div id="hra-warning" class="calc-warning-banner" style="display: none;"></div>
                <div id="hra-loan-legal-warning" class="dark-mode-notice-box" style="display: none; margin-top: 15px;">
                    <p><i class="fas fa-exclamation-triangle" style="color: #eab308; margin-right: 8px;"></i> <strong>Note:</strong> You are claiming both HRA and Home Loan (Self-Occupied). Ensure you meet legal criteria.</p>
                </div>
                <div class="calc-custom-row" style="margin-top: 15px;">
                    <label for="other-income">Other Income / Allowances / Bonus</label>
                    <input type="text" id="other-income" placeholder="₹ Enter Total Amount">
                </div>
            </div>
        </div>
        <div class="post-card calculation-card">
            <div class="section-card-header">
                <h3><i class="fas fa-gift" style="margin-right: 8px; color: #ec4899;"></i> Perks & Flexi-Benefits</h3>
            </div>
            <div class="section-card-content">
                <div class="dark-mode-notice-box" style="margin-bottom: 20px;">
                    <p><i class="fas fa-info-circle" style="color: #38bdf8; margin-right: 8px;"></i> <strong>Important Note:</strong> Only add perks here if they are already included in your <strong>Other Income</strong> above.</p>
                </div>
                <div id="perks-rows-container"></div>
                <button type="button" id="add-perk-btn" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;"><i class="fas fa-plus-circle"></i> Add Benefit/Perk</button>
            </div>
        </div>
        <div class="post-card calculation-card collapsible-section-box">
            <div id="80c-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-coins" style="margin-right: 8px; color: #eab308;"></i>Section 80C Deductions</span>
                <i id="80c-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
            </div>
            <div id="80c-content" class="collapsible-content-wrapper" style="display: block;">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg" style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; margin: 20px 0;">No entries added yet.</p>
                </div>
                <button type="button" id="add-80c-btn" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;"><i class="fas fa-plus-circle"></i> Add Entry</button>
                <div class="calc-total-summary-text" style="margin-top: 15px; text-align: right; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
                    Total 80C: <span id="display-80c-total" style="color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>
        <div class="post-card calculation-card collapsible-section-box">
            <div id="80d-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-hand-holding-medical" style="margin-right: 8px; color: #10b981;"></i>Section 80D: Health Insurance</span>
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
               <div class="calc-checkbox-label-wrapper">
    <input type="checkbox" id="parents-senior">
    <label for="parents-senior">Parents are Senior Citizens (60+)</label>
    </div>
            </div>
        </div>
        <div class="post-card calculation-card collapsible-section-box">
            <div id="home-loan-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-home" style="margin-right: 8px; color: #6366f1;"></i>Home Loan Assistant</span>
                <i id="home-loan-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>
            <div id="home-loan-content" class="collapsible-content-wrapper" style="display: none;">
                <div class="home-loan-active-banner" style="background: rgba(14, 165, 233, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed var(--brand-primary); margin-bottom: 20px;">
                <div class="calc-checkbox-label-wrapper">
    <input type="checkbox" id="has-home-loan">
    <label for="has-home-loan">Do you have an active Home Loan?</label>
    </div>
                </div>
                <div id="home-loan-wizard" style="display: none;">
                    <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-base);">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
                            <input type="checkbox" id="is-first-buyer" style="width: 16px; height: 16px;"> Is this your first home? (Required for 80EE/80EEA)
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
                            <div id="first-home-details-container" style="display: none;">
                                <div class="calc-grid-layout" style="margin-bottom: 20px;">
                                    <div class="calc-custom-row">
                                        <label for="loan-sanction-date">Sanction Date</label>
                                        <input type="date" id="loan-sanction-date" class="calc-select" style="font-size: 0.85rem;">
                                    </div>
                                    <div class="calc-custom-row">
                                        <label for="property-stamp-value">Stamp Duty Value</label>
                                        <input type="text" id="property-stamp-value" placeholder="₹">
                                    </div>
                                </div>
                                <div id="branch-80ee-fields" class="calc-custom-row" style="display:none; margin-top: 15px;">
                                    <label for="original-loan-amt">Sanctioned Loan Amount</label>
                                    <input type="text" id="original-loan-amt">
                                </div>
                                </div>
                            <div id="branch-80eea-fields" style="display:none; margin-top: 15px; text-align: center;">
                                <p style="font-size: 0.85rem; color: var(--color-success); margin: 0; font-weight: 600;"><i class="fas fa-check-circle"></i> Eligible for 80EEA Affordable Housing Deduction.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="conditional-deductions" style="display: none; margin-top: 25px;">
            <div class="post-card collapsible-section-box" style="border: 1px solid var(--border-base); border-radius: 12px; background: var(--bg-container); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div id="benefits-summary-header" class="calc-collapse-trigger" style="padding: 18px 25px; background: rgba(14,165,233,0.03); border-bottom: 1px solid var(--border-base);">
                    <span class="heading-title-text" style="display: flex; align-items: center; gap: 10px; font-weight: 700;"><i class="fas fa-chart-line" style="color: var(--color-success); font-size: 1.1rem;"></i>Home Loan Tax Benefits Summary</span>
                    <i id="benefits-summary-icon" class="fas fa-chevron-up toggle-chevron-arrow"></i>
                </div>
                <div id="benefits-summary-content" class="collapsible-content-wrapper" style="display: flex; flex-direction: column; gap: 14px; padding: 25px;">
                    <div id="card-24b" class="benefit-flex-row" style="border-left: 4px solid var(--brand-primary);">
                        <div class="benefit-text-stack">
                            <div class="benefit-badge-group">
                                <h4 class="benefit-section-title">Section 24(b)</h4>
                                <span class="badge-label badge-blue">Home Loan Interest</span>
                            </div>
                            <p class="benefit-description">Deduction for Interest on Home Loan</p>
                        </div>
                        <div id="display-24b-value" class="benefit-value-text value-blue">₹ 0</div>
                    </div>
                    <div id="card-80eea" class="benefit-flex-row" style="display: none; border-left: 4px solid var(--color-success);">
                        <div class="benefit-text-stack">
                            <div class="benefit-badge-group">
                                <h4 class="benefit-section-title">Section 80EEA</h4>
                                <span class="badge-label badge-green">Affordable Housing</span>
                            </div>
                            <p class="benefit-description">Additional Interest Deduction</p>
                        </div>
                        <div id="display-80eea-value" class="benefit-value-text value-green">₹ 0</div>
                    </div>
                    <div id="card-80ee" class="benefit-flex-row" style="display: none; border-left: 4px solid var(--color-danger);">
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
    <div class="calc-results sticky-score-panel sidebar-stacked-layout">
        <div class="sidebar-panel-header-accent">
            <h3 class="sidebar-panel-heading">
                <i class="fas fa-receipt" style="margin-right: 10px; color: #38bdf8; font-size: 1.1rem;"></i>Tax Liability
            </h3>
        </div>   
        <div class="sidebar-stacked-rows-container">
            <div id="old-regime-card" class="regime-row-card">
                <div class="regime-meta-info">
                    <span class="regime-row-title">Old Regime</span>
                </div>
                <div id="old-regime-tax" class="regime-row-value old-regime-tax-display">₹ 0</div>
            </div>
            <div id="new-regime-card" class="regime-row-card">
                <div class="regime-meta-info">
                    <span class="regime-row-title">New Regime</span>
                </div>
                <div id="new-regime-tax" class="regime-row-value new-regime-tax-display">₹ 0</div>
            </div>
        </div>
        <div id="regime-recommendation-banner" class="dark-mode-notice-box" style="margin-top: 15px; text-align: center; font-weight: 600; display: none;"></div>
        <button id="view-breakdown-btn" class="btn-primary-action" style="width: 100%; margin-top: 22px; padding: 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 12px; font-size: 0.95rem; transition: all 0.2s ease;">View Detailed Breakdown</button>
        <button id="save-btn" class="btn-secondary-action" style="width: 100%; margin-top: 12px; padding: 12px; font-weight: bold; cursor: pointer; border: 2px solid var(--brand-primary); border-radius: 12px; background: transparent; color: var(--brand-primary); font-size: 0.95rem; transition: all 0.2s ease;">Save to Profile</button>
    </div>
</div>
<div id="tax-breakdown-section" class="post-card breakdown-section-wrapper" style="padding: 25px; border-top: 4px solid var(--brand-primary); margin-top: 30px;">
    <h3 style="margin-top: 0; text-align: center;"><i class="fas fa-list-ul" style="margin-right: 10px; color: var(--brand-primary);"></i>Detailed Comparison Summary</h3>
    <div class="table-wrapper">
        <table style="width: 100%;">
            <thead>
                <tr>
                    <th style="padding: 14px 12px;">Tax Component</th>
                    <th class="text-right" style="padding: 14px 12px;">Old Regime</th>
                    <th class="text-right" style="padding: 14px 12px;">New Regime</th>
                </tr>
            </thead>
            <tbody id="main-comparison-table">
                <tr>
                    <td style="padding: 14px 12px;">Gross Salary</td>
                    <td id="summary-gross-salary" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td id="summary-gross-salary-new" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Standard Deduction</td>
                    <td id="summary-standard-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td id="summary-standard-deduction-new" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Section 80C Deductions</td>
                    <td id="summary-80c-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">HRA Exemption</td>
                    <td id="summary-hra-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Section 80D (Health Insurance)</td>
                    <td id="summary-80d-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr>
                    <td style="padding: 14px 12px;">Home Loan Interest (Sec 24b)</td>
                    <td id="summary-24b-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr id="summary-row-80eea" style="display: none;">
                    <td style="padding: 14px 12px;">Section 80EEA Deduction</td>
                    <td id="summary-80eea-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr id="summary-row-80ee" style="display: none;">
                    <td style="padding: 14px 12px;">Section 80EE Deduction</td>
                    <td id="summary-80ee-deduction" class="text-right color-success tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td class="text-right text-muted tabular-nums" style="font-style: italic; padding: 14px 12px;">Not Eligible</td>
                </tr>
                <tr style="background: rgba(14, 165, 233, 0.04); font-weight: bold;">
                    <td style="padding: 14px 12px;">Taxable Net Income</td>
                    <td id="summary-taxable-old" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td id="summary-taxable-new" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                </tr>
                <tr style="font-weight: bold; background: rgba(16, 185, 129, 0.04);">
                    <td style="padding: 14px 12px;">Net Tax Payable (incl. Cess)</td>
                    <td id="summary-total-tax-old" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                    <td id="summary-total-tax-new" class="text-right tabular-nums" style="padding: 14px 12px;">₹ 0</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div id="mobile-tax-bar" class="mobile-tracker-bar">
    <div style="text-align: center;">
        <div class="mobile-label">Old Regime</div>
        <div id="float-old-tax" class="old-regime-tax-display mobile-value">₹ 0</div>
    </div>
    <!-- A thin vertical line separator adds a premium touch -->
    <div style="width: 1px; height: 30px; background: var(--border-base);"></div>
    <div style="text-align: center;">
        <div class="mobile-label">New Regime</div>
        <div id="float-new-tax" class="new-regime-tax-display mobile-value" style="color: #38bdf8;">₹ 0</div>
    </div>
</div>

<style>
/* ==========================================================================
   1. LAYOUT & GRID STRUCTURE
   ========================================================================== */
.calculator-container.unique-tax-calc {
    display: flex !important;
    align-items: flex-start !important;
    gap: 30px !important;
    position: relative !important;
    flex-wrap: wrap !important;
    transition: all 0.3s ease-in-out;
    padding: 10px !important;
    padding-bottom: 100px !important;
}

.calc-inputs {
    flex: 1 !important;
    width: 100% !important;
}

@media (min-width: 769px) {
    .calc-inputs {
        min-width: 600px !important;
    }
}

.unique-tax-calc .calc-grid-layout, 
.unique-tax-calc .calc-form-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
    width: 100% !important;
}

.calc-custom-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
}

/* Desktop: Label on Left, Input on Right */
@media (min-width: 769px) {
    .calc-custom-row {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 20px !important;
    }

    .calc-custom-row label {
        margin-bottom: 0 !important;
        flex: 0 0 40% !important;
    }

    .calc-custom-row input, 
    .calc-custom-row .radio-group,
    .calc-custom-row .custom-select-wrapper {
        flex: 1 !important;
        margin-top: 0 !important;
    }
}

.unique-tax-calc .single-row-span {
    flex-direction: column !important;
    width: 100% !important;
}

.unique-tax-calc .single-row-span label {
    flex: 0 0 100% !important;
    margin-bottom: 8px !important;
}

    /* ==========================================================================
       2. INPUTS, SELECTS & LABELS
       ========================================================================== */
    .unique-tax-calc label {
        display: block !important;
        margin-bottom: 8px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: var(--text-primary);
    }

    .unique-tax-calc select, 
    .unique-tax-calc .calc-select { 
    width: 100% !important; 
    height: 50px !important; 
    box-sizing: border-box !important;
    padding: 0 15px !important; 
    border-radius: 14px !important;
    font-family: 'JetBrains Mono', monospace !important; 
    font-size: 1.1rem !important; 
    font-weight: 700 !important;
    background-color: var(--bg-container) !important; 
    border: 1.5px solid var(--border-base) !important;
    color: var(--text-primary) !important;
    appearance: none !important; 
    cursor: pointer;
    background-image: linear-gradient(45deg, transparent 50%, var(--text-primary) 50%), linear-gradient(135deg, var(--text-primary) 50%, transparent 50%);
    background-position: calc(100% - 20px) 50%, calc(100% - 15px) 50%;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    }
    .unique-tax-calc input[type="text"] { 
    width: 100% !important; 
    height: 50px !important; 
    box-sizing: border-box !important;
    padding: 0 15px !important; 
    border-radius: 14px !important;
    font-family: 'JetBrains Mono', monospace !important; 
    font-size: 1rem !important; 
    font-weight: 700 !important;
    background-color: var(--bg-container) !important; 
    border: 1.5px solid var(--border-base) !important;
    color: var(--text-primary) !important;
}

    .radio-group {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }
    /* Refined Radio Buttons */
    input[type="radio"] {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-base);
        border-radius: 50%;
        cursor: pointer;
        background-color: var(--bg-container);
        transition: all 0.2s ease;
        display: inline-block;
        vertical-align: middle;
        margin: 0 !important;
    }

    input[type="radio"]:checked {
        border: 6px solid var(--brand-primary);
        background-color: var(--bg-container);
    }

    input[type="radio"]:hover {
        border-color: var(--brand-primary);
    }

    .radio-group label {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        cursor: pointer;
    }
    .calc-checkbox-label-wrapper {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    margin-top: 15px !important;
    cursor: pointer;
}

.calc-checkbox-label-wrapper input[type="checkbox"] {
    width: 20px !important;
    height: 20px !important;
    accent-color: #38bdf8 !important;
    cursor: pointer;
    margin: 0 !important;
    flex-shrink: 0 !important;
}
    .calc-checkbox-label-wrapper label {
    display: block !important;
    margin: 0 !important; /* Removes the margin-bottom from your general label rule */
    font-size: 0.9rem !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    cursor: pointer;
}
    .unique-tax-calc input:hover, .unique-tax-calc .calc-select:focus { border-color: var(--brand-primary) !important; outline: none; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .unique-tax-calc .dynamic-row-item { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; animation: fadeIn 0.2s ease-out; }

    /* ==========================================================================
       3. COMPONENTS (Collapsibles, Perks, Sidebars)
       ========================================================================== */
    .summary-footer-hidden { display: none !important; }
    .unique-tax-calc .collapsible-section-box { 
        background: var(--bg-container) !important; /* Force your calc background */
        border: 1.5px solid var(--border-base) !important; /* Force your calc border */
        border-radius: 16px !important;
        box-shadow: none !important; /* Often blog cards have shadows that mess up calc design */
        
        /* Keep these */
        padding: 0 !important; 
        margin-bottom: 20px !important;
        position: relative !important;
        overflow: visible !important;
    }
    .unique-tax-calc .calc-collapse-trigger { 
        padding: 20px 25px; 
        background: transparent; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        cursor: pointer; 
        border: none;
        border-bottom: 1.5px solid var(--border-base); 
    }
    .unique-tax-calc .collapsible-content-wrapper { padding: 20px 25px 25px 25px;}
    .unique-tax-calc .heading-title-text { 
        font-family: 'Lora', serif; 
        font-size: 1.3rem !important;
        font-weight: 700 !important; 
        color: var(--text-primary);
        letter-spacing: 0.3px;
    }
    .unique-tax-calc .toggle-chevron-arrow { transition: transform 0.3s ease; color: var(--text-muted); }

    /* Perks Grid System */
    #perks-rows-container { width: 100% !important; display: block !important; }
    .perk-row { display: grid !important; grid-template-columns: 1fr 1fr 40px !important; gap: 12px !important; align-items: center !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 12px; }
    #perks-rows-container button { grid-column: 3 / 4 !important; justify-self: center; color: #ef4444; background: none; border: none; cursor: pointer; padding: 0; }
    .perk-row-wrapper { display: flex; flex-direction: column; margin-bottom: 15px; width: 100%; }
    .perk-warning, .perk-limit-warning { color: var(--color-danger) !important; font-size: 0.75rem; margin-top: 4px; display: none; }
    /* 80C Rows & Custom Selects */
    #80c-rows-container > div { display: grid !important; grid-template-columns: 1.5fr 1fr auto !important; gap: 15px; align-items: center; margin-bottom: 12px; }
    .input-error { border: 1.5px solid var(--color-danger) !important; background-color: rgba(239, 68, 68, 0.1) !important; }
    .custom-select-wrapper { position: relative; width: 100%; cursor: pointer; z-index: 99; }
    .custom-select-trigger { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-radius: 14px; font-size: 1.2rem; height: 50px; font-family: 'JetBrains Mono', monospace; font-weight: 700; background-color: var(--bg-container); border: 1.5px solid var(--border-base); color: var(--text-primary); }
    .custom-options-panel { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-container); border: 1.5px solid var(--border-base); border-radius: 12px; margin-top: 5px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); z-index: 100; max-height: 200px; overflow-y: auto; }
    .custom-select-wrapper.open .custom-options-panel { display: block; }

    /* Sidebar Panels & Regimes */
    .unique-tax-calc .sidebar-stacked-layout {
    display: block !important;
    background: var(--bg-container) !important;
    padding: 24px !important;
    border-radius: 16px !important;
    border: 1.5px solid var(--border-base) !important;
    width: 350px !important;
    position: sticky !important;
    top: 20px !important;
    align-self: flex-start !important;
    flex-shrink: 0 !important;
    color: var(--text-primary) !important;
    font-size: 1rem !important;
}
    .unique-tax-calc .regime-row-card { display: flex; flex-direction: column; align-items: center; padding: 24px 20px; border-radius: 12px; border: 1.5px solid var(--border-base) !important; background-color: var(--bg-container) !important; transition: all 0.3s ease; }
    .unique-tax-calc .regime-row-value { font-family: 'JetBrains Mono', monospace !important; font-size: 2rem; font-weight: 700; color: var(--text-primary); }

    /* ==========================================================================
       4. RESPONSIVE HOOKS
       ========================================================================== */
    .benefit-flex-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-offset); border-radius: 10px; width: 100%; min-height: 80px; gap: 15px; }
   /* ==========================================================================
       4. RESPONSIVE HOOKS (EXPANDED)
       ========================================================================== */
   /* Default: Hide mobile tracker */
    .mobile-tracker-bar {
        display: none !important;
    }
    .mobile-desktop-notice {
    display: none !important;
}
@media (max-width: 768px) {
    .mobile-desktop-notice {
        display: block !important;
        background: color-mix(in srgb, var(--brand-primary) 10%, transparent) !important;
        border: 1px solid var(--brand-primary) !important;
        color: var(--brand-primary) !important;
        padding: 12px 15px !important;
        margin-bottom: 20px !important;
        border-radius: 12px !important;
        font-size: 0.85rem !important;
        text-align: center !important;
        font-weight: 500 !important;
    }
    /* 1. Header & FY Selector Logic */
    .calc-header-wrapper {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 15px !important;
    }
    .calc-fy-dropdown-container .calc-select {
        width: 140px !important;
        height: 40px !important;
        font-size: 0.9rem !important;
    }
    .radio-group {
        display: flex !important;
        flex-direction: row !important;
        padding: 15px;
        flex-wrap: wrap !important;
        gap: 20px !important;
        width: 100% !important;
        align-items: center !important;
        box-sizing: border-box !important;
        margin-bottom: 25px !important;
    }
    /* 3. Ensure inputs inside the form don't expand past 100% */
    .unique-tax-calc input, 
    .unique-tax-calc select {
        max-width: 100% !important;
        box-sizing: border-box !important;
    }
    .radio-group + div, 
    .radio-group + label {
        margin-top: 20px !important;
    }
    .unique-tax-calc label[for="other-income-input"], 
    .unique-tax-calc .other-income-label-wrapper { 
        margin-top: 15px !important;
        display: block !important;
    }
    .calc-inputs, 
    .collapsible-content-wrapper,
    .perk-row-wrapper {
        width: 100% !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
    }

    /* 3. Mobile Tracker Bar */
    .mobile-tracker-bar {
        display: flex !important;
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        justify-content: space-evenly !important; 
        align-items: center !important;
        background: var(--bg-container) !important;
        backdrop-filter: blur(10px);
        padding: 12px 20px !important;
        z-index: 9999 !important;
        border-top: 1px solid var(--border-base) !important;
        box-sizing: border-box !important;
    }

    /* 4. Row Layouts: Stacking (Perks & 80C) */
    .perk-row, #80c-rows-container > div {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        gap: 8px !important;
        padding: 12px !important;
        background: var(--bg-offset) !important;
    }
    .perk-row {
        display: flex !important;
        grid-template-columns: none !important; 
    }
    .perk-row select, .perk-row input, 
    #80c-rows-container > div select, #80c-rows-container > div input,
    .custom-select-wrapper {
        width: 100% !important;
    }

    .perk-row button, #80c-rows-container > div > div:last-child {
        justify-self: end !important;
        margin-top: 5px;
    }

    /* 5. Sidebar & Regimes */
    .unique-tax-calc .sidebar-stacked-layout { 
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important; /* Added: prevents it from being wider than the screen */
    padding: 12px !important;
    margin-top: 20px !important;
    box-sizing: border-box !important;
}
    .unique-tax-calc .regime-row-card { padding: 15px 10px !important; }
    .unique-tax-calc .regime-row-value { font-size: 1.5rem !important; }

    /* 6. Text & Utility */
    .mobile-label { font-size: 0.60rem !important; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 2px; text-transform: uppercase; }
    .mobile-value { font-size: 1.1rem !important; font-weight: 700 !important; }
    .benefit-flex-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; text-align: left !important; }
    .benefit-value-text { margin-left: 0 !important; width: 100% !important; text-align: left !important; }
}
    /* FY Selector Specific Alignment */
.calc-header-wrapper .custom-select-wrapper {
    width: 180px !important; /* Matches typical dropdown width */
    min-width: 150px;
}

@media (max-width: 768px) {
    .calc-header-wrapper .custom-select-wrapper {
        width: 100% !important; /* Full width on mobile */
        margin-top: 10px;
    }
}
    /* Styling the premium dropdown panel */
.custom-options-panel {
    display: none; 
    position: absolute; 
    top: 110%; 
    left: 0; 
    right: 0; 
    background: var(--bg-container) !important;
    border: 1.5px solid var(--border-base) !important; 
    border-radius: 12px !important;
    padding: 8px !important; /* Internal spacing */
    box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
    z-index: 1000 !important;
}

.custom-option {
    padding: 12px 20px !important;
    color: var(--text-secondary) !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-weight: 500 !important;
    cursor: pointer;
    border-radius: 8px !important;
    transition: all 0.2s ease;
}

/* Hover and selection state for premium feel */
.custom-option:hover {
    background: var(--bg-offset) !important;
    color: var(--brand-primary) !important; /* Highlight color on hover */
}

.custom-option.selected {
    background: var(--bg-offset) !important;
    color: var(--brand-primary) !important;
    font-weight: 700 !important;
}
</style>
