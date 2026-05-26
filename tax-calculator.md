---
layout: dashboard
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<!-- Main Outer Wrapper -->
<div id="calculator-container" class="calculator-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">

<!-- Header and Financial Year Selector Group -->
<div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;">
    <div>
        <h1 style="margin: 0; color: #38bdf8; font-family: 'Lora', serif;">💰 Income Tax Calculator</h1>
        <p style="margin: 5px 0 0 0; font-size: 0.95rem; color: #94a3b8;">Plan your investments and calculate your liability for FY 2026-27</p>
    </div>
    <div>
        <label for="fy-selector" style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 5px; font-weight: 700; text-transform: uppercase;">Assessment Year</label>
        <select id="fy-selector" class="calc-select" onchange="calculateAll()" style="padding: 8px 12px; background: #1e293b; border: 2px solid #334155; color: #38bdf8; border-radius: 8px; font-weight: 700; outline: none;">
            <option value="2026-27" selected>FY 2026-27 (AY 2027-28)</option>
            <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
        </select>
    </div>
</div>

<!-- Two-Column Flex Grid: Restricts side-by-side layout strictly to Inputs vs Sticky Sidebar -->
<div class="calc-main-row" style="display: flex; flex-wrap: wrap; gap: 25px; margin-bottom: 30px; width: 100%;">
    
    <!-- Left Column: Input Forms (Takes up flexible left space) -->
    <div class="calc-inputs" style="flex: 1 1 650px; max-width: 100%;">

        <!-- Annual Salary Details Module -->
        <div class="post-card">
            <h3 style="margin-top: 0; margin-bottom: 20px; color: #38bdf8; font-family: 'Lora', serif; border-bottom: 1px solid #334155; padding-bottom: 10px;">🏢 Annual Salary Details</h3>

            <div class="calc-form-grid">
                <!-- Basic Salary -->
                <div class="calc-field-group">
                    <div class="label-row">
                        <label for="basic-salary">Basic Salary (Annual):</label>
                        <input type="number" id="basic-salary" value="1200000" oninput="calculateAll()">
                    </div>
                </div>

                <!-- HRA Received -->
                <div class="calc-field-group">
                    <div class="label-row">
                        <label for="hra-received">HRA Received (Annual):</label>
                        <input type="number" id="hra-received" value="500000" oninput="calculateAll()">
                    </div>
                </div>

                <!-- Actual Rent Paid -->
                <div class="calc-field-group">
                    <div class="label-row">
                        <label for="rent-paid">Actual Rent Paid (Annual):</label>
                        <input type="number" id="rent-paid" value="240000" oninput="calculateAll()">
                    </div>
                </div>

                <!-- Metro Location Selector -->
                <div class="calc-field-group">
                    <div class="label-row">
                        <label for="is-metro">City of Residence:</label>
                        <select id="is-metro" onchange="calculateAll()" style="width: 120px; padding: 8px 12px; border-radius: 10px; font-weight: 700; background: var(--calc-input-bg); border: 2px solid var(--calc-input-border); color: var(--calc-text-main);">
                            <option value="true" selected>Metro</option>
                            <option value="false">Non-Metro</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Live HRA Exemption Calculation Warning Banner -->
            <div id="hra-warning" class="calc-warning-banner" style="display: none; color: #f87171; background: rgba(248, 113, 113, 0.1); padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.9rem; border-left: 4px solid #f87171;"></div>

            <!-- Legal Compliance Notice -->
            <div style="font-size: 0.75rem; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 10px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #fbbf24;">
                <i class="fas fa-exclamation-triangle"></i> Note: You are claiming both HRA and Home Loan (Self-Occupied). Ensure you meet legal criteria.
            </div>

            <!-- RESTORED ORIGINAL INPUT: Single box with original engine ID layout -->
            <div style="margin-top: 20px;">
                <label for="other-income" style="font-size: 0.85rem; color: var(--calc-text-muted); display: block; font-weight: bold; margin-bottom: 5px;">Other Income / Allowances / Bonus</label>
                <input type="number" id="other-income" class="dynamic-input" placeholder="₹ Enter total other income" style="width: 100%;" inputmode="decimal" oninput="calculateAll()">
            </div>
        </div>

        <!-- Perks & Flexi-Benefits Module -->
        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
            <h3 style="margin-top: 0; color: var(--calc-text-main);"><i class="fas fa-gift" style="margin-right: 10px; color: #a855f7;"></i>Perks & Flexi-Benefits</h3>
            <div style="font-size: 0.75rem; color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #fbbf24;">
                <i class="fas fa-exclamation-triangle"></i> <strong>Note:</strong> Only add perks here if they are already included in your <strong>Other Income</strong> above.
            </div>
            <div id="perks-rows-container"></div>
            <button type="button" onclick="addPerkRow()" style="background: none; border: 1px dashed #a855f7; color: #a855f7; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;"> 
                <i class="fas fa-plus-circle"></i> Add Benefit/Perk
            </button>
        </div>

        <!-- Section 80C Deductions Module -->
        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
            <div id="80c-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="TaxController.setupToggle('80c-header', '80c-content', '80c-icon')">
                <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-coins" style="margin-right: 10px; color: #fbbf24;"></i>Section 80C Deductions</h3>
                <i id="80c-icon" class="fas fa-chevron-up" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>
            <div id="80c-content" style="display: block; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
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

        <!-- Section 80D Health Insurance Module -->
        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
            <div id="80d-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="TaxController.setupToggle('80d-header', '80d-content', '80d-icon')">
                <h3 style="margin: 0; color: var(--calc-text-main);"><i class="fas fa-hand-holding-medical" style="margin-right: 10px; color: #f87171;"></i>Section 80D: Health Insurance</h3>
                <i id="80d-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>
            <div id="80d-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Self, Spouse & Children</label>
                    <input type="number" id="80d-self" class="dynamic-input" placeholder="Max ₹25,000" style="width: 100%; margin-top: 5px;" oninput="calculateAll()">
                </div>
                <div>
                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Parents Premium</label>
                    <input type="number" id="80d-parents" class="dynamic-input" placeholder="Max ₹25,000 / ₹50,000" style="width: 100%; margin-top: 5px;" oninput="calculateAll()">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--calc-text-muted); font-size: 0.8xl; margin-top: 8px;">
                        <input type="checkbox" id="parents-senior" onchange="calculateAll()"> Parents are Senior Citizens (60+)
                    </label>
                </div>
            </div>
        </div>

        <!-- Home Loan Assistant Module -->
        <div class="post-card" style="margin-bottom: 20px; padding: 25px; background: var(--calc-card);">
            <div id="home-loan-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="TaxController.setupToggle('home-loan-header','home-loan-content', 'home-loan-icon')">
                <h3 style="margin: 0; color: var(--calc-text-main);">
                    <i class="fas fa-home" style="margin-right: 10px; color: #38bdf8;"></i>Home Loan Assistant
                </h3>
                <i id="home-loan-icon" class="fas fa-chevron-down" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
            </div>

            <div id="home-loan-content" style="display: none; margin-top: 20px; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                <div style="background: rgba(56, 189, 248, 0.05); padding: 15px; border-radius: 8px; border: 1px dashed #38bdf8; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <label style="font-size: 0.9rem; color: var(--calc-text-main); font-weight: 500;">Do you have an active Home Loan?</label>
                        <input type="checkbox" id="has-home-loan" onchange="TaxController.toggleLoanWizard()" style="width: 18px; height: 18px; cursor: pointer;">
                    </div>
                </div>

                <div id="home-loan-wizard" style="display: none;">
                    <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid var(--calc-input-border);">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--calc-text-main);">
                            <input type="checkbox" id="is-first-buyer" onchange="calculateAll()" style="width: 16px; height: 16px;"> 
                            Is this your first home? (Required for 80EE/80EEA)
                        </label>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 0.8rem; color: var(--calc-text-muted); display: block; margin-bottom: 8px;">Possession Status</label>
                            <div style="display: flex; gap: 10px; font-size: 0.85rem;">
                                <label><input type="radio" name="possession" value="completed" onchange="TaxController.handleLoanStatusChange()" checked> Fully Constructed</label>
                                <label><input type="radio" name="possession" value="under-construction" onchange="TaxController.handleLoanStatusChange()"> Under Construction</label>
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 0.8rem; color: var(--calc-text-muted); display: block; margin-bottom: 8px;">Occupancy Status</label>
                            <div style="display: flex; gap: 10px; font-size: 0.85rem;">
                                <label><input type="radio" name="occupancy" value="self" onchange="calculateAll()" checked> Self-Occupied</label>
                                <label><input type="radio" name="occupancy" value="rented" onchange="calculateAll()"> Rented-out</label>
                            </div>
                        </div>
                    </div>

                    <div id="under-construction-msg" style="display: none; color: #fbbf24; font-size: 0.8rem; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border-left: 3px solid #fbbf24; margin-bottom: 15px;">
                        <i class="fas fa-info-circle"></i> Interest claimable in 5 installments post-construction.
                    </div>

                    <div id="completed-loan-fields">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Total Principal Paid</label>
                                <input type="number" id="loan-principal" class="dynamic-input" style="width: 100%;" oninput="calculateAll()">
                            </div>
                            <div>
                                <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Total Interest Paid</label>
                                <input type="number" id="loan-interest" class="dynamic-input" style="width: 100%;" oninput="calculateAll()">
                            </div>
                        </div>

                        <div style="background: var(--calc-input-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--calc-input-border);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Sanction Date</label>
                                    <input type="date" id="loan-sanction-date" class="dynamic-input" style="width: 100%;" onchange="calculateAll()">
                                </div>
                                <div>
                                    <label style="font-size: 0.8rem; color: var(--calc-text-muted);">Stamp Duty Value</label>
                                    <input type="number" id="property-stamp-value" class="dynamic-input" placeholder="₹" style="width: 100%;" oninput="calculateAll()">
                                </div>
                            </div>
                            
                            <div id="branch-80ee-fields" style="display:none; margin-top:10px;">
                                <label style="font-size: 0.8rem; color: #f472b6;">Original Loan Amount (Sanctioned)</label>
                                <input type="number" id="original-loan-amt" class="dynamic-input" style="width: 100%; border-color: #f472b6 !important;" oninput="calculateAll()">
                            </div>
                            <div id="branch-80eea-fields" style="display:none; margin-top:10px;">
                                <p style="font-size: 0.75rem; color: #4ade80;"><i class="fas fa-check-circle"></i> Eligible for 80EEA based on date.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Conditional Real-time Breakdown Module -->
        <div id="conditional-deductions" style="display: none; margin-top: 20px;">
            <div class="post-card" style="padding: 25px; background: var(--calc-card); border: 1px solid #38bdf8;">
                <div id="benefits-summary-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 20px;" 
                     onclick="TaxController.setupToggle('benefits-summary-header', 'benefits-summary-content', 'benefits-summary-icon')">
                    <h3 style="margin: 0; color: var(--calc-text-main);">
                        <i class="fas fa-chart-line" style="margin-right: 10px; color: #4ade80;"></i>Home Loan Tax Benefits
                    </h3>
                    <i id="benefits-summary-icon" class="fas fa-chevron-up" style="transition: transform 0.3s; color: var(--calc-text-muted);"></i>
                </div>

                <div id="benefits-summary-content" style="display: block; border-top: 1px solid var(--calc-input-border); padding-top: 15px;">
                    <div id="card-24b" style="margin-bottom: 15px; padding: 15px; background: var(--calc-input-bg); border-radius: 10px; border-left: 4px solid #38bdf8;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0; color: #38bdf8; font-size: 0.9rem;">Section 24(b)</h4>
                                <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: var(--calc-text-muted);">Interest on Home Loan</p>
                            </div>
                            <span id="display-24b-value" style="font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                        </div>
                    </div>

                    <div id="card-80eea" style="display: none; margin-bottom: 15px; padding: 15px; background: var(--calc-input-bg); border-radius: 10px; border-left: 4px solid #4ade80;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0; color: #4ade80; font-size: 0.9rem;">Section 80EEA</h4>
                                <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: var(--calc-text-muted);">Affordable Housing Interest</p>
                            </div>
                            <span id="display-80eea-value" style="font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                        </div>
                    </div>

                    <div id="card-80ee" style="display: none; margin-bottom: 15px; padding: 15px; background: var(--calc-input-bg); border-radius: 10px; border-left: 4px solid #f472b6;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0; color: #f472b6; font-size: 0.9rem;">Section 80EE</h4>
                                <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: var(--calc-text-muted);">First Time Home Buyer</p>
                            </div>
                            <span id="display-80ee-value" style="font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    </div>
        
    <!-- Right Column: Sticky Quick Tax Display Summary Panel -->
    <div class="calc-sidebar" style="flex: 1 1 300px; min-width: 300px;">
        <div class="post-card" style="position: -webkit-sticky; position: sticky; top: 20px; border: 1px solid #38bdf8; padding: 25px; background: var(--calc-card); z-index: 10;">
            <h3 style="margin-top: 0; text-align: center; color: var(--calc-text-main);">Tax Liability</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
                <div id="old-regime-box" style="text-align: center; padding: 20px; background: var(--calc-input-bg); border-radius: 12px; border: 1px solid var(--calc-input-border);">
                    <div style="font-size: 0.75rem; color: var(--calc-text-muted); margin-bottom: 5px;">OLD REGIME</div>
                    <div id="old-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                </div>
                <div id="new-regime-box" style="text-align: center; padding: 20px; background: var(--calc-input-bg); border-radius: 12px; border: 1px solid var(--calc-input-border);">
                    <div style="font-size: 0.75rem; color: var(--calc-text-muted); margin-bottom: 5px;">NEW REGIME</div>
                    <div id="new-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                </div>
            </div>

            <button onclick="scrollToResults()" class="btn" style="width: 100%; margin-top: 25px; padding: 15px; font-weight: bold; cursor: pointer; border: none; border-radius: 10px; background: #38bdf8; color: #0f172a;">View Detailed Breakdown</button>
            <button id="save-btn" onclick="handleSave()" class="btn" style="width: 100%; margin-top: 12px; padding: 12px; font-weight: bold; cursor: pointer; border: 1px solid #38bdf8; border-radius: 10px; background: transparent; color: #38bdf8;">Save to Profile</button>
        </div>
    </div>
</div> <!-- .calc-main-row flex row ends here cleanly out of the layout flow -->

<!-- Bottom Layout Area: Placed outside the row blocks to safely stretch 100% width across the DOM -->
<div id="tax-breakdown-section" class="post-card" style="padding: 25px; background: var(--calc-card); border-top: 4px solid var(--calc-accent); width: 100%; clear: both; box-sizing: border-box;">
    <h3 style="margin-top: 0; color: var(--calc-text-main); text-align: center;">
        <i class="fas fa-list-ul" style="margin-right: 10px; color: var(--calc-accent);"></i> Detailed Comparison Summary
    </h3>
    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: var(--calc-text-main); min-width: 100%;">
            <thead>
                <tr style="border-bottom: 2px solid var(--calc-input-border); text-align: left; font-size: 0.9rem; background: rgba(0,0,0,0.05);">
                    <th style="padding: 12px;">Tax Component</th>
                    <th style="padding: 12px; text-align: right;">Old Regime</th>
                    <th style="padding: 12px; text-align: right;">New Regime</th>
                </tr>
            </thead>
            <tbody id="main-comparison-table" style="font-size: 0.95rem;">
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">Gross Salary</td>
                    <td id="summary-gross-salary" style="padding: 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-gross-salary-new" style="padding: 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">Standard Deduction</td>
                    <td id="summary-standard-deduction" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-standard-deduction-new" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">Section 80C Deductions</td>
                    <td id="summary-80c-deduction" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 12px; text-align: right; color: var(--calc-text-muted);">Not Eligible</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">HRA Exemption</td>
                    <td id="summary-hra-deduction" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 12px; text-align: right; color: var(--calc-text-muted);">Not Eligible</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">Section 80D (Health Insurance)</td>
                    <td id="summary-80d-deduction" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 12px; text-align: right; color: var(--calc-text-muted);">Not Eligible</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--calc-input-border);">
                    <td style="padding: 12px;">Home Loan Interest (Sec 24b)</td>
                    <td id="summary-24b-deduction" style="padding: 12px; text-align: right; color: #22c55e; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td style="padding: 12px; text-align: right; color: var(--calc-text-muted);">Not Eligible</td>
                </tr>
                <tr style="border-bottom: 2px solid var(--calc-input-border); background: rgba(56, 189, 248, 0.05); font-weight: bold;">
                    <td style="padding: 12px;">Taxable Net Income</td>
                    <td id="summary-taxable-old" style="padding: 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-taxable-new" style="padding: 12px; text-align: right; font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
                <tr style="font-weight: bold; background: rgba(74, 222, 128, 0.05);">
                    <td style="padding: 12px;">Net Tax Payable (incl. Cess)</td>
                    <td id="summary-total-tax-old" style="padding: 12px; text-align: right; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                    <td id="summary-total-tax-new" style="padding: 12px; text-align: right; color: var(--calc-text-main); font-family: 'JetBrains Mono', monospace;">₹ 0</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Mobile Dynamic Footer Sticky bar -->
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

</div> <!-- Calculator container ends safely -->

<script src="/assets/js/tax-config.js"></script>
<script src="/assets/js/investment-options.js"></script>
<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/tax-calculator.js"></script>

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
    
    .row-80c-statutory select, 
    .row-80c-statutory input {
        background-color: var(--calc-card) !important;
        border-style: dashed !important;
        pointer-events: none;
        opacity: 0.7;
        cursor: not-allowed;
    }
    #hra-warning {
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
        display: none;
    }
    .perk-amount::placeholder {
        font-size: 0.75rem;
        color: var(--calc-text-muted);
        opacity: 0.7;
    }
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
    </div>

    .tax-val { font-weight: bold; font-family: 'JetBrains Mono', monospace; }
    .tax-lower { color: #4ade80; }
    .tax-higher { color: #ef4444; }
</style>
