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

            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;">

            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #38bdf8; font-weight: 600;">
                <input type="checkbox" id="has-home-loan" style="width: 18px; height: 18px;"> I have an active Home Loan (Section 24b)
            </label>

            <div id="home-loan-section" style="display: none; margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.05); border-radius: 10px; border: 1px dashed #38bdf8;">
                <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; font-size: 0.9rem;">
                    <input type="checkbox" id="is-under-construction"> My property is Under Construction
                </label>
                
                <div id="interest-input-group">
                    <label id="interest-label" style="font-size: 0.8rem; color: #64748b;">Annual Interest Paid this Year</label>
                    <input type="number" id="home-interest" placeholder="₹" style="width: 100%; padding: 10px; margin-top: 5px; border-radius: 6px; border: 1px solid #1e293b; background: #000; color: #fff;">
                    <p id="clp-note" style="display: none; font-size: 0.7rem; color: #94a3b8; margin-top: 8px;">
                        * Under Old Regime, interest paid during construction is deferred. You can claim it in 5 installments after possession.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div style="flex: 1 1 300px;">
        <div class="post-card" style="position: sticky; top: 20px; border: 1px solid #38bdf8; padding: 25px;">
            <h3 style="margin-top: 0; text-align: center;">Tax Liability Comparison</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
                <div style="text-align: center; padding: 20px; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b;">
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">OLD REGIME TAX</div>
                    <div id="old-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: #fff; font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #0f172a; border-radius: 12px; border: 2px solid #4ade80;">
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 5px;">NEW REGIME TAX</div>
                    <div id="new-regime-tax" style="font-size: 1.8rem; font-weight: bold; color: #4ade80; font-family: 'JetBrains Mono', monospace;">₹ 0</div>
                </div>
            </div>

            <div id="recommendation-box" style="margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center; background: rgba(56, 189, 248, 0.1); color: #38bdf8; font-size: 0.9rem;">
                Fill in your salary details to generate a report.
            </div>

            <button onclick="runCalculator()" class="btn" style="width: 100%; margin-top: 25px; padding: 15px; font-weight: bold; cursor: pointer;">
                Calculate Tax
            </button>
        </div>
    </div>
</div>

<script src="{{ '/assets/js/investment-options.js' | relative_url }}"></script>
<script>
    // Logic for UI interactions
    const homeLoanCheck = document.getElementById('has-home-loan');
    const clpCheck = document.getElementById('is-under-construction');
    const homeLoanSection = document.getElementById('home-loan-section');
    const clpNote = document.getElementById('clp-note');

    homeLoanCheck.addEventListener('change', (e) => {
        homeLoanSection.style.display = e.target.checked ? 'block' : 'none';
    });

    clpCheck.addEventListener('change', (e) => {
        clpNote.style.display = e.target.checked ? 'block' : 'none';
    });

    function runCalculator() {
        // Collect all data
        const data = {
            basic: parseFloat(document.getElementById('basic-salary').value) || 0,
            hraRec: parseFloat(document.getElementById('hra-received').value) || 0,
            other: parseFloat(document.getElementById('other-income').value) || 0,
            rent: parseFloat(document.getElementById('rent-paid').value) || 0,
            isMetro: document.getElementById('is-metro').value === 'true',
            loanActive: homeLoanCheck.checked,
            isCLP: clpCheck.checked,
            interest: parseFloat(document.getElementById('home-interest').value) || 0
        };

        // This is where we call FinanceEngine.TaxEngine.calculate(data)
        // For now, let's just log it to ensure it's working
        console.log("Input Data for Engine:", data);
        alert("Inputs collected! Next: Linking the Math Engine.");
    }
</script>
