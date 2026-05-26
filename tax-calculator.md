---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div class="calculator-container unique-tax-calc">

    <div class="calc-inputs">
        
        <div class="post-card calculation-card">
            <h3>🏢 Annual Salary Details</h3>

            <div class="calc-grid-layout">
                <div class="calc-custom-row">
                    <label for="basic-salary">Basic Salary (Annual)</label>
                    <input type="number" id="basic-salary" value="1200000" oninput="calculateAll()">
                </div>

                <div class="calc-custom-row">
                    <label for="hra-received">HRA Received (Annual)</label>
                    <input type="number" id="hra-received" value="500000" oninput="calculateAll()">
                </div>

                <div class="calc-custom-row">
                    <label for="rent-paid">Actual Rent Paid (Annual)</label>
                    <input type="number" id="rent-paid" value="360000" oninput="calculateAll()">
                </div>

                <div class="calc-custom-row">
                    <label for="is-metro">City of Residence</label>
                    <select id="is-metro" class="calc-select" onchange="calculateAll()">
                        <option value="true" selected>Metro</option>
                        <option value="false">Non-Metro</option>
                    </select>
                </div>
            </div>

            <div id="hra-warning" class="calc-warning-banner" style="display: none;"></div>

            <div class="calc-disclaimer">
                <p><i class="fas fa-exclamation-triangle"></i> Note: You are claiming both HRA and Home Loan (Self-Occupied). Ensure you meet legal criteria.</p>
            </div>

            <div class="calc-custom-row single-row-span">
                <label for="other-income">Other Income / Allowances / Bonus</label>
                <input type="number" id="other-income" placeholder="₹ Enter Total Amount" inputmode="decimal" oninput="calculateAll()">
            </div>
        </div>

        <div class="post-card calculation-card">
            <h3 style="margin-top: 0;"><i class="fas fa-gift" style="margin-right: 10px; color: var(--brand-primary);"></i>Perks & Flexi-Benefits</h3>
            <div class="calc-disclaimer" style="margin-bottom: 15px; padding: 12px;">
                <p style="margin: 0; font-weight: 500;"><i class="fas fa-info-circle"></i> <strong>Note:</strong> Only add perks here if they are already included in your <strong>Other Income</strong> above.</p>
            </div>
            <div id="perks-rows-container"></div>
            <button type="button" onclick="addPerkRow()" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;">
                <i class="fas fa-plus-circle"></i> Add Benefit/Perk
            </button>
        </div>

        <div class="post-card calculation-card">
            <div id="80c-header" class="calc-collapse-trigger" onclick="TaxController.setupToggle('80c-header', '80c-content', '80c-icon')">
                <span style="font-family: 'Lora', serif;"><i class="fas fa-coins" style="margin-right: 10px; color: var(--brand-primary);"></i>Section 80C Deductions</span>
                <i id="80c-icon" class="fas fa-chevron-up" style="transition: transform 0.3s; color: var(--text-muted);"></i>
            </div>
            <div id="80c-content" style="display: block; margin-top: 15px; padding-top: 10px;">
                <div id="80c-rows-container">
                    <p id="empty-80c-msg" style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; margin: 20px 0;">No entries added yet.</p>
                </div>
                <button type="button" onclick="add80CRow()" class="btn-secondary-outline" style="width: 100%; padding: 12px; margin-top: 10px;">
                    <i class="fas fa-plus-circle"></i> Add entry
                </button>
                <div style="margin-top: 15px; text-align: right; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
                    Total 80C: <span id="display-80c-total" style="color: var(--color-success); font-family: 'JetBrains Mono', monospace;">₹ 0</span> / ₹ 1,50,000
                </div>
            </div>
        </div>

        <div class="post-card calculation-card">
            <div id="80d-header" class="calc-collapse-trigger" onclick="TaxController.setupToggle('80d-header', '80d-content', '80d-icon')">
                <span style="font-family: 'Lora', serif;"><i class="fas fa-hand-holding-medical" style="margin-right: 10px; color: var(--color-danger);"></i>Section 80D: Health Insurance</span>
                <i id="80d-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--text-muted);"></i>
            </div>
            <div id="80d-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--border-base); padding-top: 15px;">
                <div class="calc-grid-layout">
                    <div class="calc-custom-row">
                        <label for="80d-self">Self, Spouse & Children</label>
                        <input type="number" id="80d-self" placeholder="Max ₹25,000" oninput="calculateAll()">
                    </div>
                    <div class="calc-custom-row">
                        <label for="80d-parents">Parents Premium</label>
                        <input type="number" id="80d-parents" placeholder="Max ₹25,000" oninput="calculateAll()">
                    </div>
                </div>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; margin-top: 15px; font-weight: 600;">
                    <input type="checkbox" id="parents-senior" onchange="calculateAll()" style="width: 16px; height: 16px; cursor: pointer;"> Parents are Senior Citizens (60+)
                </label>
            </div>
        </div>

        <div class="post-card calculation-card">
            <div id="home-loan-header" class="calc-collapse-trigger" onclick="TaxController.setupToggle('home-loan-header','home-loan-content', 'home-loan-icon')">
                <span style="font-family: 'Lora', serif;"><i class="fas fa-home" style="margin-right: 10px; color: var(--brand-primary);"></i>Home Loan Assistant</span>
                <i id="home-loan-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--text-muted);"></i>
            </div>

            <div id="home-loan-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--border-base); padding-top: 15px;">
                <div style="background: rgba(14, 165, 233, 0.04); padding: 15px; border-radius: 10px; border: 1px dashed var(--brand-primary); margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="font-size: 0.9rem; color: var(--text-primary); font-weight: 700; cursor: pointer;" for="has-home-loan">Do you have an active Home Loan?</label>
                        <input type="checkbox" id="has-home-loan" onchange="TaxController.toggleLoanWizard()" style="width: 18px; height: 18px; cursor: pointer;">
                    </div>
                </div>

                <div id="home-loan-wizard" style="display: none;">
                    <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-base);">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
                            <input type="checkbox" id="is-first-buyer" onchange="calculateAll()" style="width: 16px; height: 16px;"> 
                            Is this your first home? (Required for 80EE/80EEA)
                        </label>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 700;">Possession Status</label>
                            <div style="display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-primary);">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="possession" value="completed" onchange="TaxController.handleLoanStatusChange()" checked style="cursor: pointer;"> Fully Constructed</label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="possession" value="under-construction" onchange="TaxController.handleLoanStatusChange()" style="cursor: pointer;"> Under Construction</label>
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 700;">Occupancy Status</label>
                            <div style="display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-primary);">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="occupancy" value="self" onchange="calculateAll()" checked style="cursor: pointer;"> Self-Occupied</label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="occupancy" value="rented" onchange="calculateAll()" style="cursor: pointer;"> Rented-out</label>
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
                                <input type="number" id="loan-principal" oninput="calculateAll()">
                            </div>
                            <div class="calc-custom-row">
                                <label for="loan-interest">Total Interest Paid</label>
                                <input type="number" id="loan-interest" oninput="calculateAll()">
                            </div>
                        </div>

                        <div style="background: var(--bg-offset); padding: 20px; border-radius: 12px; border: 1px solid var(--border-base);">
                            <div class="calc-grid-layout">
                                <div class="calc-custom-row">
                                    <label for="loan-sanction-date">Sanction Date</label>
                                    <input type="date" id="loan-sanction-date" class="calc-select" style="font-size:0.85rem; width: 100%;" onchange="calculateAll()">
                                </div>
                                <div class="calc-custom-row">
                                    <label for="property-stamp-value">Stamp Duty Value</label>
                                    <input type="number" id="property-stamp-value" placeholder="₹" oninput="calculateAll()">
                                </div>
                            </div>
                            
                            <div id="branch-80ee-fields" class="calc-custom-row single-row-span" style="display:none; margin-top:15px;">
                                <label for="original-loan-amt" style="color: var(--color-danger);">Sanctioned Loan Amount</label>
                                <input type="number" id="original-loan-amt" oninput="calculateAll()">
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
            <div class="post-card" style="border: 2px solid var(--brand-primary); padding: 25px;">
                <div id="benefits-summary-header" class="calc-collapse-trigger" onclick="TaxController.setupToggle('benefits-summary-header', 'benefits-summary-content', 'benefits-summary-icon')">
                    <span style="font-family: 'Lora', serif;"><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--color-success);"></i>Home Loan Tax Benefits</span>
                    <i id="benefits-summary-icon" class="fas fa-chevron-up" style="transition: transform 0.3s; color: var(--text-muted);"></i>
                </div>

                <div id="benefits-summary-content" style="display: block; margin-top: 15px; padding-top: 10px;">
                    <div id="card-24b" style="margin-bottom: 15px; padding: 15px; background: var(--bg-offset); border-radius: 10px; border-left: 4px solid var(--brand-primary); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 24(b)</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">Interest on Home Loan</p>
                        </div>
                        <span id="display-24b-value" style="font-weight: bold; font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                    </div>

                    <div id="card-80eea" style="display: none; margin-bottom: 15px; padding: 15px; background: var(--bg-offset); border-radius: 10px; border-left: 4px solid var(--color-success); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 80EEA</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">Affordable Housing Interest</p>
                        </div>
                        <span id="display-80eea-value" style="font-weight: bold; font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                    </div>

                    <div id="card-80ee" style="display: none; margin-bottom: 15px; padding: 15px; background: var(--bg-offset); border-radius: 10px; border-left: 4px solid var(--color-danger); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">Section 80EE</h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">First Time Home Buyer</p>
                        </div>
                        <span id="display-80ee-value" style="font-weight: bold; font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                    </div>
                </div>
            </div>
        </div> 
    </div>
        
    <div class="calc-results sticky-score-panel">
        <div style="margin-bottom: 25px; width: 100%;">
            <label for="fy-selector" style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Assessment Year</label>
            <select id="fy-selector" class="calc-select" onchange="calculateAll()" style="color: var(--brand-primary); width: 100% !important; padding: 10px 14px !important;">
                <option value="2026-27" selected>FY 2026-27 (AY 2027-28)</option>
                <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
            </select>
        </div>

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

        <button onclick="scrollToResults()" style="width: 100%; margin-top: 25px; padding: 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 10px; background: var(--brand-primary); color: var(--text-on-brand); font-size: 0.95rem;">View Detailed Breakdown</button>
        <button id="save-btn" onclick="handleSave()" style="width: 100%; margin-top: 12px; padding: 12px; font-weight: bold; cursor: pointer; border: 2px solid var(--brand-primary); border-radius: 10px; background: transparent; color: var(--brand-primary); font-size: 0.9rem;">Save to Profile</button>
    </div>

</div> <div id="tax-breakdown-section" class="post-card" style="padding: 25px; border-top: 4px solid var(--brand-primary); margin-top: 30px; width: 100%; box-sizing: border-box;">
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

<style>
    /* 1. Target fields inside our custom dashboard container to break out of main.css constraints */
    .unique-tax-calc .calc-grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }

    /* 2. Style input rows to stretch vertically and look modern, spacious, and premium */
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

    /* 3. Force inputs to break out of the squeezed 120px main.css restriction */
    .unique-tax-calc .calc-custom-row input[type="number"],
    .unique-tax-calc .calc-custom-row select {
        width: 100% !important;
        box-sizing: border-box;
        padding: 12px 16px !important;
        border-radius: 12px !important;
        font-size: 1rem !important;
        height: 48px !important;
        background: var(--bg-offset) !important;
        border: 2px solid var(--border-base) !important;
        color: var(--text-primary) !important;
        font-family: 'JetBrains Mono', monospace !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .unique-tax-calc .calc-custom-row input[type="number"]:focus,
    .unique-tax-calc .calc-custom-row select:focus {
        outline: none !important;
        border-color: var(--brand-primary) !important;
        background: var(--bg-container) !important;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important;
    }

    /* 4. Let specific wide elements (like other income) span full-width smoothly */
    .unique-tax-calc .single-row-span {
        grid-column: 1 / -1;
        margin-top: 10px;
    }

    /* 5. Tweak internal padding of cards for a premium feel */
    .unique-tax-calc .calculation-card {
        padding: 30px !important;
        margin-bottom: 25px !important;
    }

    .unique-tax-calc .calculation-card h3 {
        margin-top: 0;
        margin-bottom: 25px;
        border-bottom: 1px solid var(--border-base);
        padding-bottom: 12px;
        font-size: 1.3rem;
    }

    /* Functional helper animations */
    .hidden { display: none !important; }
    #hra-warning { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .perk-limit-warning {
        font-size: 0.7rem;
        color: var(--color-danger);
        margin-top: 4px;
        background: rgba(239, 68, 68, 0.05);
        padding: 6px;
        border-radius: 4px;
        border-left: 2px solid var(--color-danger);
        display: none;
    }
</style>
