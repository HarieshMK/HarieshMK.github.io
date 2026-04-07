---
layout: default
title: Income Tax Calculator (FY 2026-27)
permalink: /tax-calculator/
---

<div class="dashboard-container" style="padding: 20px; max-width: 900px; margin: 0 auto;">
    <div style="margin-bottom: 30px; text-align: center;">
        <h1 style="margin: 0; color: #38bdf8;">💰 Indian Income Tax Calculator</h1>
        <p style="color: #64748b;">Compare Old vs. New Regime for FY 2026-27</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <div class="input-section">
            
            <div class="post-card" style="margin-bottom: 20px;">
                <h3 style="margin-top: 0;">💵 Annual Income</h3>
                <label>Basic Salary (Annual)</label>
                <input type="number" id="basic-salary" placeholder="₹" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                
                <label>HRA Received (Annual)</label>
                <input type="number" id="hra-received" placeholder="₹" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">

                <label>Other Allowances / Bonus</label>
                <input type="number" id="other-income" placeholder="₹" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
            </div>

            <div class="post-card" style="margin-bottom: 20px;">
                <h3 style="margin-top: 0;">🏠 Housing & Rent</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label>Monthly Rent Paid</label>
                        <input type="number" id="rent-paid" placeholder="₹" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                    </div>
                    <div>
                        <label>City Type</label>
                        <select id="is-metro" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                            <option value="false">Non-Metro</option>
                            <option value="true">Metro (CHE, MUM, DEL, KOL)</option>
                        </select>
                    </div>
                </div>

                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #38bdf8;">
                    <input type="checkbox" id="has-home-loan"> I have a Home Loan (Section 24b)
                </label>

                <div id="home-loan-section" style="display: none; margin-top: 15px; padding: 10px; border-left: 2px solid #38bdf8; background: #111;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-bottom: 10px;">
                        <input type="checkbox" id="is-under-construction"> Under Construction (CLP)
                    </label>
                    <div id="standard-interest">
                        <label>Annual Interest Paid</label>
                        <input type="number" id="home-interest" placeholder="₹" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #333; background: #000; color: #fff;">
                    </div>
                </div>
            </div>
        </div>

        <div class="result-section">
            <div class="post-card" style="position: sticky; top: 20px; border: 1px solid #38bdf8;">
                <h3 style="margin-top: 0;">📊 Tax Comparison</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                    <div style="text-align: center; padding: 15px; background: #1e293b; border-radius: 8px;">
                        <div style="font-size: 0.8rem; color: #94a3b8;">OLD REGIME</div>
                        <div id="old-regime-tax" style="font-size: 1.2rem; font-weight: bold; color: #ef4444;">₹ 0</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #1e293b; border-radius: 8px; border: 1px solid #4ade80;">
                        <div style="font-size: 0.8rem; color: #94a3b8;">NEW REGIME</div>
                        <div id="new-regime-tax" style="font-size: 1.2rem; font-weight: bold; color: #4ade80;">₹ 0</div>
                    </div>
                </div>

                <div id="recommendation-box" style="margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center; background: rgba(56, 189, 248, 0.1); color: #38bdf8; font-weight: bold;">
                    Enter your details to see results
                </div>
                
                <button onclick="calculateTax()" class="btn" style="width: 100%; margin-top: 20px; cursor: pointer;">Calculate My Tax</button>
            </div>
        </div>

    </div>
</div>

<script src="{{ '/assets/js/investment-options.js' | relative_url }}"></script>
<script src="{{ '/assets/js/finance-engine.js' | relative_url }}"></script>

<script>
    // Toggle Home Loan Logic
    document.getElementById('has-home-loan').addEventListener('change', function() {
        document.getElementById('home-loan-section').style.display = this.checked ? 'block' : 'none';
    });

    function calculateTax() {
        // We will link this to your FinanceEngine.TaxEngine.calculate()
        // in the next step!
        alert("Engine Link Ready - Calculating based on your 2026-27 Profile...");
    }
</script>
