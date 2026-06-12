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
    <div class="calc-fy-dropdown-container" style="min-width: 240px; position: relative;">
        <select id="fy-selector" class="calc-select" style="display: none !important;">
            <option value="2026-27" selected>FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option> 
        </select>
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
                <div class="calc-custom-row single-row-span" style="margin-top: 15px;">
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
                <label class="calc-checkbox-label-wrapper" style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 15px; font-weight: 600;">
                    <input type="checkbox" id="parents-senior" style="width: 16px; height: 16px; cursor: pointer;"> Parents are Senior Citizens (60+)
                </label>
            </div>
        </div>

        <div class="post-card calculation-card collapsible-section-box">
            <div id="home-loan-header" class="calc-collapse-trigger">
                <span class="heading-title-text"><i class="fas fa-home" style="margin-right: 8px; color: #6366f1;"></i>Home Loan Assistant</span>
                <i id="home-loan-icon" class="fas fa-chevron-down toggle-chevron-arrow"></i>
            </div>
            <div id="home-loan-content" class="collapsible-content-wrapper" style="display: none;">
                <div class="home-loan-active-banner" style="background: rgba(14, 165, 233, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed var(--brand-primary); margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="font-size: 0.9rem; color: var(--text-primary); font-weight: 700; cursor: pointer;" for="has-home-loan">Do you have an active Home Loan?</label>
                        <input type="checkbox" id="has-home-loan" style="width: 18px; height: 18px; cursor: pointer;">
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
                            <div class="calc-grid-layout">
                                <div class="calc-custom-row">
                                    <label for="loan-sanction-date">Sanction Date</label>
                                    <input type="date" id="loan-sanction-date" class="calc-select" style="font-size: 0.85rem;">
                                </div>
                                <div class="calc-custom-row">
                                    <label for="property-stamp-value">Stamp Duty Value</label>
                                    <input type="text" id="property-stamp-value" placeholder="₹">
                                </div>
                            </div>
                            <div id="branch-80ee-fields" class="calc-custom-row single-row-span" style="display:none; margin-top: 15px;">
                                <label for="original-loan-amt">Sanctioned Loan Amount</label>
                                <input type="text" id="original-loan-amt">
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
                <div id="old-regime-tax" class="regime-row-value">₹ 0</div>
            </div>
            <div id="new-regime-card" class="regime-row-card">
                <div class="regime-meta-info">
                    <span class="regime-row-title">New Regime</span>
                </div>
                <div id="new-regime-tax" class="regime-row-value">₹ 0</div>
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
        <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">OLD</div>
        <div id="float-old-tax" class="tabular-nums font-bold">₹ 0</div>
    </div>
    <div style="text-align: center;">
        <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">NEW</div>
        <div id="float-new-tax" class="tabular-nums font-bold" style="color: var(--brand-primary);">₹ 0</div>
    </div>
</div>

<style>
    /* ==========================================================================
       1. LAYOUT & GRID STRUCTURE
       ========================================================================== */
    .unique-tax-calc .calc-form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 15px;
        margin-top: 10px;
    }

    .unique-tax-calc .calc-grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 20px; }
    
    .unique-tax-calc .calc-custom-row { display: flex; flex-direction: column; gap: 8px; position: relative; }
    .unique-tax-calc .calc-custom-row label { font-weight: 700; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* ==========================================================================
       2. INPUTS, SELECTS & DYNAMIC ELEMENTS
       ========================================================================== */
    .unique-tax-calc select, 
    .unique-tax-calc input[type="text"], 
    .unique-tax-calc input[type="number"], 
    .unique-tax-calc .dynamic-input, 
    .unique-tax-calc .calc-select,
    .perk-row input, .perk-row select,
    .row-80c-manual input, .row-80c-manual select, 
    .row-80c-statutory input, .row-80c-statutory select {
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 12px 20px !important;
        border-radius: 14px !important;
        font-size: 1.1rem !important;
        height: 50px !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 700 !important;
        background-color: #0f172a !important;
        border: 1.5px solid #334155 !important;
        color: #f8fafc !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }

    .unique-tax-calc select, .unique-tax-calc .calc-select {
        appearance: none !important;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f8fafc%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 15px top 50% !important;
        background-size: 12px auto !important;
        cursor: pointer;
    }

    select option { color: #f8fafc !important; background-color: #0f172a !important; }
    input[type="radio"] { accent-color: #38bdf8; width: 18px; height: 18px; cursor: pointer; }
    .unique-tax-calc input:hover, .unique-tax-calc .calc-select:focus { border-color: var(--brand-primary) !important; outline: none; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .unique-tax-calc .dynamic-row-item { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; animation: fadeIn 0.2s ease-out; }

    /* ==========================================================================
       3. COMPONENTS (Collapsibles, Perks, Sidebars)
       ========================================================================== */
    .unique-tax-calc .collapsible-section-box { padding: 0; overflow: visible !important; }
    .unique-tax-calc .calc-collapse-trigger { padding: 20px 25px; background: transparent; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: none; }
    .unique-tax-calc .collapsible-content-wrapper { padding: 5px 25px 25px 25px; border-top: 1px solid var(--border-base); }
    .unique-tax-calc .heading-title-text { font-family: 'Lora', serif; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .unique-tax-calc .toggle-chevron-arrow { transition: transform 0.3s ease; color: var(--text-muted); }

    #perks-rows-container .perk-row, #perks-rows-container > div { display: grid !important; grid-template-columns: 1fr 0.8fr 40px !important; gap: 12px !important; align-items: center !important; margin-bottom: 12px !important; width: 100% !important; }
    #perks-rows-container .perk-type, 
    #perks-rows-container .perk-amount { width: 100% !important; height: 50px !important;min-width: 0 !important; }
    #perks-rows-container button { grid-column: 3 / 4 !important; justify-self: center; color: #ef4444; background: none; border: none; cursor: pointer; padding: 0;}
    .perk-warning { margin-top: 8px; color: #fbbf24; font-size: 0.75rem; display: none; }
    .perk-row-wrapper { display: flex; flex-direction: column; margin-bottom: 15px; width: 100%; }
    .perk-row { display: grid !important; grid-template-columns: 1fr 0.8fr 40px !important; gap: 12px !important; align-items: center !important; width: 100% !important;}
    .perk-warning, .perk-limit-warning { color: #f59e0b; font-size: 0.75rem; margin-top: 4px; display: none; }
    #80c-rows-container > div { display: grid !important; grid-template-columns: 1.5fr 1fr auto !important; gap: 15px; align-items: center; margin-bottom: 12px; }
    .input-error { border: 1px solid #ef4444 !important; background-color: #fef2f2 !important; } 

    .custom-select-wrapper { position: relative; width: 100%; cursor: pointer; user-select: none; z-index: 99; }
    .custom-select-trigger { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-radius: 14px; font-size: 1.1rem; height: 50px; font-family: 'JetBrains Mono', monospace; font-weight: 700; background-color: var(--bg-body); border: 1.5px solid var(--border-base); color: var(--text-primary); transition: border-color 0.2s ease; }
    .custom-select-wrapper:hover .custom-select-trigger { border-color: var(--brand-primary) !important; }
    .custom-options-panel { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1.5px solid var(--border-base); border-radius: 12px; margin-top: 5px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); z-index: 100; max-height: 200px; overflow-y: auto; }
    .custom-select-wrapper.open .custom-options-panel { display: block; }
    .custom-option { padding: 12px 20px; font-size: 1rem; color: var(--text-primary); transition: background 0.2s ease; text-align: left; }
    .custom-option:hover { background: var(--bg-offset); color: var(--brand-primary); }
    .custom-option.selected { background: rgba(14, 165, 233, 0.1); color: var(--brand-primary); font-weight: bold; }

    .unique-tax-calc .sidebar-stacked-layout { background: var(--bg-card) !important; padding: 24px; border-radius: 16px; border: 1px solid var(--border-base) !important; }
    .unique-tax-calc .sidebar-panel-header-accent { border-bottom: 1px solid var(--border-base); padding-bottom: 12px; margin-bottom: 20px; width: 100%; }
    .unique-tax-calc .sidebar-panel-heading { margin: 0; font-family: 'Lora', serif; font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }
    .unique-tax-calc .sidebar-stacked-rows-container { display: flex; flex-direction: column; gap: 16px; width: 100%; }
    .unique-tax-calc .regime-row-card { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px 20px; border-radius: 12px; border: 1.5px solid var(--border-base) !important; background-color: var(--bg-body) !important; transition: all 0.3s ease; }
    .unique-tax-calc .regime-row-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin-bottom: 8px; }
    .unique-tax-calc .regime-row-value { font-family: 'JetBrains Mono', monospace !important; font-size: 2rem; font-weight: 700; color: var(--text-primary); }
    .unique-tax-calc .regime-row-card.regime-winner { transform: scale(1.02); border-color: var(--color-success) !important; background-color: rgba(16, 185, 129, 0.05) !important; }
    .unique-tax-calc .regime-row-card.regime-winner .regime-row-value { color: var(--color-success) !important; }
    .unique-tax-calc .regime-row-card.regime-loser .regime-row-value { color: var(--text-muted) !important; }

    /* ==========================================================================
       4. RESPONSIVE HOOKS
       ========================================================================== */
    .benefit-flex-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-offset); border-radius: 10px; box-sizing: border-box; width: 100%; min-height: 80px; gap: 15px; }
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
    .value-red { color: #ef4444; }

    @media (max-width: 768px) {
        .benefit-flex-row { flex-direction: column; align-items: flex-start; gap: 12px; padding: 15px; }
        .benefit-value-text { margin-left: 0; width: 100%; text-align: left; border-top: 1px dashed var(--border-base); padding-top: 8px; }
        #perks-rows-container > div, #80c-rows-container > div { grid-template-columns: 1fr; gap: 8px; padding: 12px; background: var(--bg-offset); border-radius: 12px; }
    }
</style>
