/**
 * Controller for the Tax Calculator UI
 */

const TaxController = {
    init: () => { 
        console.log("Tax Controller Initialized"); 
    },

    // --- PERK UI METHODS ---
    addPerkRow: () => {
        const rowId = Date.now();
        const container = document.getElementById('perks-rows-container');
        const row = document.createElement('div');
        
        row.id = `perk-${rowId}`;
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1fr 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";

        const perkOptions = ["Meal Coupons", "Corporate NPS", "VPF", "Mobile & Internet", "LTA", "Books & Periodicals", "Professional Tax", "Other Flexi-Pay"];
        let selectOptions = perkOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        
        row.innerHTML = `
            <select class="perk-type" onchange="TaxController.calculatePerkExemption('${rowId}')" style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                ${selectOptions}
            </select>
            <input type="text" class="perk-declaration" placeholder="Amt or %" oninput="TaxController.calculatePerkExemption('${rowId}')"
                   style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff; text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.85rem; font-weight: bold;">₹ 0</div>
            <button onclick="document.getElementById('perk-${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    },

    calculatePerkExemption: (rowId) => {
        const row = document.getElementById(`perk-${rowId}`);
        const type = row.querySelector('.perk-type').value;
        const declValue = row.querySelector('.perk-declaration').value;
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        
        // Safety check for TAX_CONFIG
        const rules = (typeof TAX_CONFIG !== 'undefined' && TAX_CONFIG.perkRules) ? TAX_CONFIG.perkRules[type] : { maxExempt: Infinity };
        
        let amount = 0;
        if (declValue.includes('%')) {
            amount = (parseFloat(declValue.replace('%', '')) / 100) * basic;
        } else {
            amount = parseFloat(declValue) || 0;
        }

        let eligible = amount;
        if (type === "Corporate NPS") {
            const maxPercent = (rules.oldLimit && rules.newLimit) ? Math.max(rules.oldLimit, rules.newLimit) : 0.14;
            eligible = Math.min(amount, basic * maxPercent);
        } else if (rules && rules.maxExempt) {
            eligible = Math.min(amount, rules.maxExempt);
        }

        row.querySelector('.perk-eligible').innerText = `₹ ${Math.round(eligible).toLocaleString('en-IN')}`;
        TaxController.calculateAll(); 
    },

    // --- MAIN CALCULATION ---
    calculateAll: () => {
        console.log("--- Calculation Started ---");
        
        // 1. Core Inputs
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid').value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const homeLoanInterest = document.getElementById('is-under-construction')?.checked ? 0 : (parseFloat(document.getElementById('home-interest')?.value) || 0);

        const grossSalary = basic + hraReceived + otherIncome;

        // 2. Collect Perks Data (THE NEW PART)
        let perksData = [];
        document.querySelectorAll('.perk-row').forEach(row => {
            const type = row.querySelector('.perk-type').value;
            const declValue = row.querySelector('.perk-declaration').value;
            let amt = 0;
            if (declValue.includes('%')) {
                amt = (parseFloat(declValue.replace('%', '')) / 100) * basic;
            } else {
                amt = parseFloat(declValue) || 0;
            }
            perksData.push({ type: type, amount: amt });
        });

        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) {
            console.error("Engine Missing!");
            return;
        }

        // 3. Deduction Calculations
        const exemptHRA = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);
        
        let total80C = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80C += parseFloat(input.value) || 0;
        });

        // 4. Run Engine with Perks Data
        const newRegimeTax = FinanceEngine.TaxEngine.calculateNewRegime(grossSalary, perksData, basic);
        const oldRegimeTax = FinanceEngine.TaxEngine.calculateOldRegime(grossSalary, {
            section80C: total80C,
            homeLoanInterest: homeLoanInterest,
            exemptHRA: exemptHRA
        }, perksData, basic);

        TaxController.updateSummary(newRegimeTax, oldRegimeTax);
    },

    updateSummary: (newTax, oldTax) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
        
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            const diff = Math.abs(newTax - oldTax);
            if (newTax < oldTax) {
                recBox.innerHTML = `<strong>New Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = "#4ade80";
            } else {
                recBox.innerHTML = `<strong>Old Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = "#38bdf8";
            }
        }
    }
};

// Global Bridge for HTML buttons
function addPerkRow() { TaxController.addPerkRow(); }
function runCalculator() { TaxController.calculateAll(); }

window.onload = TaxController.init;
