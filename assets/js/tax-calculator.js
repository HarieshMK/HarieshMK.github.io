/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.9 - Fix for SyntaxErrors & Button Connectivity
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
        console.log("Tax Controller 3.9 Initialized");

        // Global listeners for buttons if they are not using onclick
        const add80cBtn = document.getElementById('add-80c-btn');
        if (add80cBtn) add80cBtn.onclick = () => TaxController.add80CRow();

        const addPerkBtn = document.getElementById('add-perk-btn');
        if (addPerkBtn) addPerkBtn.onclick = () => TaxController.addPerkRow();

        document.addEventListener('input', (e) => {
            // Trigger calculation on any relevant input
            if (e.target.closest('.dynamic-input') || e.target.type === 'number' || e.target.type === 'date' || e.target.type === 'checkbox') {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        // Initialize display
        await TaxController.loadUserData();
        TaxController.calculateAll();
    },

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
        if (!window.FinanceEngine) {
            console.error("FinanceEngine not loaded");
            return;
        }

        // A. Primary Data
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const selectedYear = document.getElementById('fy-selector')?.value || '2024-25';
        const hraReceived = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';

        // B. Education Loan (80E) Toggle
        const hasEduLoan = document.getElementById('has-edu-loan')?.checked;
        const eduSection = document.getElementById('section-80e-input');
        if(eduSection) eduSection.style.display = hasEduLoan ? 'block' : 'none';

        // C. Home Loan Waterfall Logic
        const hasHomeLoan = document.getElementById('has-home-loan')?.checked;
        const sanctionDateStr = document.getElementById('loan-sanction-date')?.value;
        const propValue = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const interestPaid = parseFloat(document.getElementById('home-interest')?.value) || 0;
        
        // Waterfall Calculation
        let deduction24b = Math.min(interestPaid, 200000);
        let remainingInterest = interestPaid - deduction24b;
        let deductionExtra = 0;
        let extraLabel = "";

        if (hasHomeLoan && sanctionDateStr && remainingInterest > 0) {
            const sDate = new Date(sanctionDateStr);
            
            // Check 80EEA (01/01/2020 falls here)
            if (sDate >= ELIGIBILITY_RULES.sec80EEA.start && sDate <= ELIGIBILITY_RULES.sec80EEA.end && propValue <= 4500000) {
                deductionExtra = Math.min(remainingInterest, 150000);
                extraLabel = "Section 80EEA (Affordable Housing)";
            } 
            // Check 80EE
            else if (sDate >= ELIGIBILITY_RULES.sec80EE.start && sDate <= ELIGIBILITY_RULES.sec80EE.end && propValue <= 5000000) {
                deductionExtra = Math.min(remainingInterest, 50000);
                extraLabel = "Section 80EE (First Home)";
            }
        }

        // Toggle visibility of the extra section result
        const extraContainer = document.getElementById('extra-loan-logic-container');
        if (extraContainer) {
            extraContainer.style.display = (deductionExtra > 0) ? 'block' : 'none';
            document.getElementById('extra-loan-label').innerText = extraLabel;
            document.getElementById('extra-loan-display-val').innerText = `₹ ${deductionExtra.toLocaleString('en-IN')}`;
        }

        // D. 80C Aggregation
        TaxController.manageStatutoryRows(basic, hasHomeLoan);
        const total80C = Array.from(document.querySelectorAll('.row-amount-80c'))
                              .reduce((sum, el) => sum + (parseFloat(el.value) || 0), 0);

        // E. Engine Run
        const inputs = TaxController.captureInputs();
        const perksData = inputs.perks.map(p => ({
            type: p.type, 
            amount: p.value.includes('%') ? (parseFloat(p.value)/100)*basic : (parseFloat(p.value)||0)
        }));

        const hraExempt = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro).actualExemption;
        
        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, (basic + hraReceived), {
            ...inputs,
            section80C: total80C,
            homeLoanInterest: deduction24b,
            extraLoanInterest: deductionExtra,
            exemptHRA: hraExempt
        }, perksData, basic);

        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, (basic + hraReceived), perksData, inputs, basic);

        TaxController.updateSummaryUI(newReg.tax, oldReg.tax);
    },

    manageStatutoryRows: (basic, hasHomeLoan) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;

        // Manage EPF
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;

        // Manage Principal
        let pRow = container.querySelector('.row-80c-statutory-principal');
        const principalAmt = parseFloat(document.getElementById('home-principal')?.value) || 0;
        if (hasHomeLoan && principalAmt > 0) {
            if (!pRow) TaxController.add80CRow("Home Loan Principal", principalAmt, true, "row-80c-statutory-principal");
            else pRow.querySelector('.row-amount-80c').value = principalAmt;
        } else if (pRow) pRow.remove();
    },

    updateSummaryUI: (newTax, oldTax) => {
        const nEl = document.getElementById('new-regime-tax');
        const oEl = document.getElementById('old-regime-tax');
        if (nEl) nEl.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        if (oEl) oEl.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
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

    loadUserData: async () => {
        // Mock load logic - connect to Supabase here if needed
        console.log("Loading data...");
    }
};

// CRITICAL: Bind to window so HTML buttons can see the functions
window.TaxController = TaxController;
window.onload = () => TaxController.init();
