/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.10 - Fixed Global Reference Errors
 */

const ELIGIBILITY_RULES = {
    sec80EE: {
        start: new Date('2016-04-01'),
        end: new Date('2017-03-31'),
        loanLimit: 3500000,
        propertyLimit: 5000000,
        deductionLimit: 50000
    },
    sec80EEA: {
        start: new Date('2019-04-01'),
        end: new Date('2022-03-31'),
        propertyLimit: 4500000,
        deductionLimit: 150000
    }
};

const TaxController = {
    isDirty: false,

    init: async () => {
        console.log("Tax Controller 3.10 Initialized");

        // Listen for all inputs to trigger calculation
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, .dynamic-input')) {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        // Initialize display
        await TaxController.loadUserData();
        TaxController.calculateAll();
    },

    // 80C Row Logic
    add80CRow: (type = "", amount = "", isLocked = false, customClass = "") => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        
        const rowId = `row-${Date.now()}`;
        const row = document.createElement('div');
        row.id = rowId;
        row.className = (isLocked ? "row-80c-statutory " : "row-80c-manual ") + (customClass || "");
        row.style = "display: flex; gap: 10px; margin-bottom: 12px; align-items: center;";
        
        const options = ["ELSS Funds", "PPF", "Home Loan Principal", "SSY", "NSC", "Children Tuition Fee", "Fixed FD (5yr)", "Life Insurance"];
        
        row.innerHTML = `
            <select class="row-select-80c dynamic-input" style="flex: 2; ${isLocked ? 'background-color: #f3f4f6;' : ''}" ${isLocked ? 'disabled' : ''}>
                <option value="${type}" selected>${type || 'Select Investment'}</option>
                ${!isLocked ? options.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
            </select>
            <input type="number" class="row-amount-80c dynamic-input" placeholder="Amount" value="${amount}" 
                   style="flex: 1; text-align: right; ${isLocked ? 'background-color: #f3f4f6;' : ''}" ${isLocked ? 'readonly' : ''}>
            ${isLocked ? '<i class="fas fa-lock" style="color:#9ca3af; width:30px; text-align:center;"></i>' : 
            `<button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; width:30px; cursor:pointer; background:none; border:none;"><i class="fas fa-trash"></i></button>`}
        `;
        container.appendChild(row);
        TaxController.calculateAll();
    },

    // Perks Row Logic
    addPerkRow: (type = "", value = "") => {
        const container = document.getElementById('perks-rows-container');
        if (!container) return;
        
        const rowId = `perk-${Date.now()}`;
        const row = document.createElement('div');
        row.className = "perk-row";
        row.id = rowId;
        row.style = "display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 30px; gap: 10px; margin-bottom: 12px; align-items: center;";
        
        const perkOptions = ["Meal Coupons", "Corporate NPS", "Fuel Allowance", "LTA", "Professional Tax", "Mobile Reimbursement"];
        
        row.innerHTML = `
            <select class="perk-type dynamic-input">
                <option value="" disabled ${!type ? 'selected' : ''}>Select Perk</option>
                ${perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <input type="text" class="perk-amount dynamic-input" placeholder="Amt or %" value="${value}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem;">₹ 0</div>
            <button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);
        TaxController.calculateAll();
    },

    calculateAll: () => {
        if (!window.FinanceEngine) return;

        // 1. Gather Inputs
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2024-25';

        // 2. Home Loan & 80E Toggles
        const hasHomeLoan = document.getElementById('has-home-loan')?.checked;
        const hasEduLoan = document.getElementById('has-edu-loan')?.checked;
        
        const eduInput = document.getElementById('section-80e-input');
        if(eduInput) eduInput.style.display = hasEduLoan ? 'block' : 'none';

        // 3. Waterfall Logic (24b -> 80EE/80EEA)
        const interestPaid = parseFloat(document.getElementById('home-interest')?.value) || 0;
        const sanctionDateStr = document.getElementById('loan-sanction-date')?.value;
        const propValue = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;

        let ded24b = Math.min(interestPaid, 200000);
        let remain = interestPaid - ded24b;
        let dedExtra = 0;
        let labelExtra = "";

        if (hasHomeLoan && sanctionDateStr && remain > 0) {
            const sDate = new Date(sanctionDateStr);
            if (sDate >= ELIGIBILITY_RULES.sec80EEA.start && sDate <= ELIGIBILITY_RULES.sec80EEA.end && propValue <= 4500000) {
                dedExtra = Math.min(remain, 150000);
                labelExtra = "Section 80EEA (Affordable Housing)";
            } else if (sDate >= ELIGIBILITY_RULES.sec80EE.start && sDate <= ELIGIBILITY_RULES.sec80EE.end && propValue <= 5000000) {
                dedExtra = Math.min(remain, 50000);
                labelExtra = "Section 80EE (Legacy First Home)";
            }
        }

        const extraBox = document.getElementById('extra-loan-logic-container');
        if (extraBox) {
            extraBox.style.display = dedExtra > 0 ? 'block' : 'none';
            document.getElementById('extra-loan-label').innerText = labelExtra;
            document.getElementById('extra-loan-display-val').innerText = `₹ ${dedExtra.toLocaleString('en-IN')}`;
        }

        // 4. Update 80C Rows
        TaxController.manageStatutoryRows(basic, hasHomeLoan);

        // 5. Run Engine
        const inputs = TaxController.captureInputs();
        const hraExempt = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro).actualExemption;
        
        const perks = inputs.perks.map(p => ({
            type: p.type,
            amount: p.value.includes('%') ? (parseFloat(p.value)/100)*basic : (parseFloat(p.value)||0)
        }));

        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(fy, (basic + hraReceived), {
            ...inputs,
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + (parseFloat(e.value) || 0), 0),
            homeLoanInterest: ded24b,
            extraLoanInterest: dedExtra,
            eduLoanInterest: parseFloat(document.getElementById('edu-interest')?.value) || 0,
            exemptHRA: hraExempt
        }, perks, basic);

        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(fy, (basic + hraReceived), perks, inputs, basic);

        TaxController.updateSummaryUI(newReg.tax, oldReg.tax);
    },

    manageStatutoryRows: (basic, hasHomeLoan) => {
        const container = document.getElementById('80c-rows-container');
        if(!container) return;

        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;

        let pRow = container.querySelector('.row-80c-statutory-principal');
        const pAmt = parseFloat(document.getElementById('home-principal')?.value) || 0;
        if (hasHomeLoan && pAmt > 0) {
            if (!pRow) TaxController.add80CRow("Home Loan Principal", pAmt, true, "row-80c-statutory-principal");
            else pRow.querySelector('.row-amount-80c').value = pAmt;
        } else if (pRow) pRow.remove();
    },

    updateSummaryUI: (newTax, oldTax) => {
        const n = document.getElementById('new-regime-tax');
        const o = document.getElementById('old-regime-tax');
        if(n) n.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        if(o) o.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
    },

    captureInputs: () => {
        return {
            otherIncome: parseFloat(document.getElementById('other-income')?.value) || 0,
            npsExtra: parseFloat(document.getElementById('nps-extra')?.value) || 0,
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents')?.value) || 0,
            perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
                type: row.querySelector('.perk-type').value,
                value: row.querySelector('.perk-amount').value
            }))
        };
    },

    loadUserData: async () => { console.log("Data loaded."); }
};

// --- THE BRIDGE: EXPOSE TO HTML ---
window.TaxController = TaxController;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TaxController.init);
} else {
    TaxController.init();
}
