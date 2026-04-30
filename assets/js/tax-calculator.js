/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.12 - Full Engine Sync & Supabase Restore
 */

const ELIGIBILITY_RULES = {
    sec80EE: {
        start: new Date('2016-04-01'), end: new Date('2017-03-31'),
        loanLimit: 3500000, propertyLimit: 5000000, deductionLimit: 50000
    },
    sec80EEA: {
        start: new Date('2019-04-01'), end: new Date('2022-03-31'),
        propertyLimit: 4500000, deductionLimit: 150000
    }
};

const TaxController = {
    isDirty: false,

    init: async () => {
        console.log("Tax Controller 3.12 Initialized");

        // Global listener for automatic recalculation
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, .dynamic-input')) {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        // Load data from Supabase if user is logged in
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
            <input type="number" class="row-amount-80c dynamic-input" placeholder="Amount" value="${amount}" style="flex: 1; text-align: right; ${isLocked ? 'background-color: #f3f4f6;' : ''}">
            ${isLocked ? '<i class="fas fa-lock" style="color:#9ca3af; width:30px; text-align:center;"></i>' : 
            `<button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none; width:30px;"><i class="fas fa-trash"></i></button>`}
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
            <input type="text" class="perk-amount dynamic-input" placeholder="Amt" value="${value}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem;">₹ 0</div>
            <button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);
        TaxController.calculateAll();
    },

    calculateAll: () => {
        if (!window.FinanceEngine || !window.TAX_CONFIG) {
            console.warn("FinanceEngine or TAX_CONFIG not ready.");
            return;
        }

        // 1. Gather Basic Inputs
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2024-25';

        // 2. Sections Visibility (80E & Loan)
        const hasEdu = document.getElementById('has-edu-loan')?.checked;
        const eduSection = document.getElementById('section-80e-input');
        if (eduSection) eduSection.style.display = hasEdu ? 'block' : 'none';

        // 3. Home Loan Waterfall Logic
        const hasHome = document.getElementById('has-home-loan')?.checked;
        const interest = parseFloat(document.getElementById('home-interest')?.value) || 0;
        const sDateStr = document.getElementById('loan-sanction-date')?.value;
        const propVal = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const occupancy = document.getElementById('loan-occupancy')?.value || 'self-occupied';

        let d24b = Math.min(interest, 200000); // Default cap for self-occupied
        let rem = interest - d24b;
        let dExtra = 0;
        let lExtra = "";

        if (hasHome && sDateStr && rem > 0) {
            const sDate = new Date(sDateStr);
            // Check 80EEA
            if (sDate >= ELIGIBILITY_RULES.sec80EEA.start && sDate <= ELIGIBILITY_RULES.sec80EEA.end && propVal <= 4500000) {
                dExtra = Math.min(rem, 150000);
                lExtra = "Section 80EEA (Affordable Housing)";
            } 
            // Check 80EE
            else if (sDate >= ELIGIBILITY_RULES.sec80EE.start && sDate <= ELIGIBILITY_RULES.sec80EE.end && propVal <= 5000000) {
                dExtra = Math.min(rem, 50000);
                lExtra = "Section 80EE (Legacy)";
            }
        }

        const extraBox = document.getElementById('extra-loan-logic-container');
        if (extraBox) {
            extraBox.style.display = (dExtra > 0) ? 'block' : 'none';
            document.getElementById('extra-loan-label').innerText = lExtra;
            document.getElementById('extra-loan-display-val').innerText = `₹ ${dExtra.toLocaleString('en-IN')}`;
        }

        // 4. Statutory Rows (EPF / Principal)
        TaxController.manageStatutoryRows(basic, hasHome);

        // 5. Build Deductions Object for Engine
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
        
        const deductionsObj = {
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((sum, el) => sum + (parseFloat(el.value) || 0), 0),
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents')?.value) || 0,
            parentsSenior: document.getElementById('parents-senior')?.checked || false,
            npsSelf: parseFloat(document.getElementById('nps-extra')?.value) || 0,
            homeLoanInterest: interest, // Engine handles capping based on occupancy
            extraLoanInterest: dExtra,
            occupancy: occupancy,
            exemptHRA: hraResult.actualExemption,
            eduLoanInterest: parseFloat(document.getElementById('edu-interest')?.value) || 0
        };

        // 6. Build Perks Array
        const perksArr = Array.from(document.querySelectorAll('.perk-row')).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: row.querySelector('.perk-amount').value.includes('%') 
                    ? (parseFloat(row.querySelector('.perk-amount').value)/100)*basic 
                    : (parseFloat(row.querySelector('.perk-amount').value)||0)
        }));

        // 7. Calculate Both Regimes
        try {
            const gross = basic + hraRec + (parseFloat(document.getElementById('other-income')?.value) || 0);
            
            const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(fy, gross, deductionsObj, perksArr, basic);
            const newReg = FinanceEngine.TaxEngine.calculateNewRegime(fy, gross, perksArr, deductionsObj, basic);

            TaxController.updateSummaryUI(newReg.tax, oldReg.tax);
        } catch (err) {
            console.error("Calculation Engine Error:", err);
        }
    },

    manageStatutoryRows: (basic, hasHome) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        
        // EPF (12% of basic)
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;

        // Principal (User entered value synced to 80C)
        let pRow = container.querySelector('.row-80c-statutory-principal');
        const pAmt = parseFloat(document.getElementById('home-principal')?.value) || 0;
        if (hasHome && pAmt > 0) {
            if (!pRow) TaxController.add80CRow("Home Loan Principal", pAmt, true, "row-80c-statutory-principal");
            else pRow.querySelector('.row-amount-80c').value = pAmt;
        } else if (pRow) pRow.remove();
    },

    updateSummaryUI: (newTax, oldTax) => {
        const n = document.getElementById('new-regime-tax');
        const o = document.getElementById('old-regime-tax');
        if (n) n.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        if (o) o.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
        
        // Visual Recommendation
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            const diff = Math.abs(newTax - oldTax);
            const winner = newTax < oldTax ? 'New' : 'Old';
            recBox.className = winner === 'New' ? 'rec-new' : 'rec-old';
            recBox.innerHTML = `<strong>${winner} Regime</strong> is better. Savings: <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
        }
    },

    loadUserData: async () => {
        if (!window.supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from('tax_user_data')
            .select('calculator_inputs')
            .eq('id', user.id)
            .eq('financial_year', document.getElementById('fy-selector').value)
            .maybeSingle();

        if (data?.calculator_inputs) {
            const i = data.calculator_inputs;
            document.getElementById('basic-salary').value = i.basic || "";
            document.getElementById('hra-received').value = i.hra || "";
            document.getElementById('rent-paid').value = i.rent || "";
            if (i.perks) {
                document.getElementById('perks-rows-container').innerHTML = '';
                i.perks.forEach(p => TaxController.addPerkRow(p.type, p.value));
            }
            TaxController.calculateAll();
        }
    }
};

// --- GLOBAL BRIDGE ---
window.TaxController = TaxController;
window.runCalculator = TaxController.calculateAll;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;

document.addEventListener('DOMContentLoaded', TaxController.init);
