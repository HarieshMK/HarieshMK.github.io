/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.8 - Logic Implementation (24b, 80EEA, 80EE, 80E Waterfall)
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
        console.log("Tax Controller 3.8 Initialized");
        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) { e.preventDefault(); e.returnValue = ''; }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('.dynamic-input, .perk-amount, .perk-type, .row-amount-80c, .row-select-80c, .home-loan-input, #has-home-loan, #fy-selector, .loan-check')) {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        await TaxController.loadUserData();
        const perksContainer = document.getElementById('perks-rows-container');
        if (perksContainer && perksContainer.children.length === 0) {
            TaxController.addPerkRow("Professional Tax", 2500);
        }
        TaxController.calculateAll();
    },

    // UI Row Management (Unchanged as per request)
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
                <option value="${type}" selected>${type}</option>
                ${!isLocked ? options.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
            </select>
            <input type="number" class="row-amount-80c dynamic-input" placeholder="Amount" value="${amount}" 
                   style="flex: 1; text-align: right; ${isLocked ? 'background-color: #f3f4f6; font-weight: 600;' : ''}" ${isLocked ? 'readonly' : ''}>
            ${isLocked ? '<div style="width:30px; text-align:center;"><i class="fas fa-lock" style="font-size:0.7rem; color:#9ca3af;"></i></div>' : 
            `<button type="button" onclick="document.getElementById('${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer; width: 30px;"><i class="fas fa-trash"></i></button>`}
        `;
        container.appendChild(row);
        if (!isLocked) TaxController.calculateAll();
    },

    addPerkRow: (type = "", value = "") => {
        const container = document.getElementById('perks-rows-container');
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
            <input type="text" class="perk-amount dynamic-input" placeholder="Amt or %" value="${value}" style="text-align: right; width: 100%;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem; font-weight: bold;">₹ 0</div>
            <button type="button" onclick="document.getElementById('${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);
        TaxController.calculateAll();
    },

    calculateAll: () => {
        if (!window.FinanceEngine) return;

        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const selectedYear = document.getElementById('fy-selector').value;
        const container80c = document.getElementById('80c-rows-container');

        // --- SECTION 1: EDUCATION LOAN (80E) VISIBILITY ---
        const hasEduLoan = document.getElementById('has-edu-loan')?.checked;
        const eduSection = document.getElementById('section-80e-input');
        if(eduSection) eduSection.style.display = hasEduLoan ? 'block' : 'none';

        // --- SECTION 2: HOME LOAN WATERFALL LOGIC ---
        const hasHomeLoan = document.getElementById('has-home-loan')?.checked;
        const sanctionDateVal = document.getElementById('loan-sanction-date')?.value;
        const propValue = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const loanAmt = parseFloat(document.getElementById('home-loan-amount')?.value) || 0;
        const totalInterestPaid = parseFloat(document.getElementById('home-interest')?.value) || 0;
        
        // 1. Section 24(b) - First 2 Lakhs
        let interestSection24b = Math.min(totalInterestPaid, 200000);
        let remainingInterest = totalInterestPaid - interestSection24b;

        // 2. Waterfall to 80EE or 80EEA
        let extraInterestDeduction = 0;
        let showExtraSection = false;
        let extraSectionLabel = "";

        if (hasHomeLoan && sanctionDateVal && remainingInterest > 0) {
            const sDate = new Date(sanctionDateVal);
            
            // Check 80EEA (Affordable Housing)
            if (sDate >= ELIGIBILITY_RULES.sec80EEA.start && sDate <= ELIGIBILITY_RULES.sec80EEA.end && propValue <= ELIGIBILITY_RULES.sec80EEA.propertyLimit) {
                extraInterestDeduction = Math.min(remainingInterest, ELIGIBILITY_RULES.sec80EEA.deductionLimit);
                showExtraSection = true;
                extraSectionLabel = "Section 80EEA (Affordable Housing)";
            } 
            // Check 80EE (First time buyers 2016)
            else if (sDate >= ELIGIBILITY_RULES.sec80EE.start && sDate <= ELIGIBILITY_RULES.sec80EE.end && loanAmt <= ELIGIBILITY_RULES.sec80EE.loanLimit && propValue <= ELIGIBILITY_RULES.sec80EE.propertyLimit) {
                extraInterestDeduction = Math.min(remainingInterest, ELIGIBILITY_RULES.sec80EE.deductionLimit);
                showExtraSection = true;
                extraSectionLabel = "Section 80EE (Home Loan)";
            }
        }

        // UI Update for Waterfall Section
        const extraUi = document.getElementById('extra-loan-logic-container');
        if (extraUi) {
            extraUi.style.display = showExtraSection ? 'block' : 'none';
            if(showExtraSection) {
                document.getElementById('extra-loan-label').innerText = extraSectionLabel;
                document.getElementById('extra-loan-display-val').innerText = `₹ ${extraInterestDeduction.toLocaleString('en-IN')}`;
            }
        }

        // --- SECTION 3: FINAL CALCULATIONS ---
        TaxController.manageStatutoryRows(container80c, basic, hasHomeLoan);

        const inputs = TaxController.captureInputs();
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, inputs.hra, inputs.rent, inputs.isMetro === 'true');
        document.getElementById('hra-eligible-display').innerText = `Eligible HRA: ₹${hraResult.actualExemption.toLocaleString('en-IN')}`;

        const perksData = inputs.perks.map(p => {
            let amt = p.value.toString().includes('%') ? (parseFloat(p.value) / 100) * basic : parseFloat(p.value) || 0;
            return { type: p.type, amount: amt };
        });

        const gross = basic + (parseFloat(inputs.hra) || 0) + (parseFloat(inputs.otherIncome) || 0);
        
        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, gross, {
            ...inputs,
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((sum, el) => sum + (parseFloat(el.value) || 0), 0),
            homeLoanInterest: interestSection24b, // Capped at 2L
            extraLoanInterest: extraInterestDeduction, // 80EE or 80EEA
            eduLoanInterest: parseFloat(document.getElementById('edu-interest')?.value) || 0,
            exemptHRA: hraResult.actualExemption
        }, perksData, basic);

        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, gross, perksData, {
            ...inputs,
            homeLoanInterest: 0 // New regime doesn't allow 24b interest for self-occupied
        }, basic);

        TaxController.updateSummaryUI(newReg.tax, oldReg.tax);
    },

    manageStatutoryRows: (container, basic, hasHomeLoan) => {
        // EPF Calculation
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;

        // Home Loan Principal (80C) - Only if loan exists
        const principalInput = parseFloat(document.getElementById('home-principal')?.value) || 0;
        let pRow = container.querySelector('.row-80c-statutory-principal');
        if (hasHomeLoan && principalInput > 0) {
            if (!pRow) TaxController.add80CRow("Home Loan Principal", principalInput, true, "row-80c-statutory-principal");
            else pRow.querySelector('.row-amount-80c').value = principalInput;
        } else if (pRow) pRow.remove();
    },

    updateSummaryUI: (newTax, oldTax) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
        const diff = Math.abs(newTax - oldTax);
        const winner = newTax < oldTax ? 'New' : 'Old';
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            recBox.innerHTML = `<strong>${winner} Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
            recBox.className = winner === 'New' ? 'rec-new' : 'rec-old';
        }
    },

    captureInputs: () => {
        const getVal = (id) => document.getElementById(id)?.value || "";
        const getCheck = (id) => document.getElementById(id)?.checked || false;
        return {
            basic: getVal('basic-salary'),
            hra: getVal('hra-received'),
            rent: getVal('rent-paid'),
            isMetro: getVal('is-metro'),
            otherIncome: getVal('other-income'),
            hasHomeLoan: getCheck('has-home-loan'),
            homeInterest: getVal('home-interest'),
            homePrincipal: getVal('home-principal'),
            loanSanctionDate: getVal('loan-sanction-date'),
            propertyStampValue: getVal('property-stamp-value'),
            occupancy: getVal('loan-occupancy'),
            healthSelf: getVal('80d-self'),
            healthParents: getVal('80d-parents'),
            parentsSenior: getCheck('parents-senior'),
            npsExtra: getVal('nps-extra'),
            perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
                type: row.querySelector('.perk-type').value,
                value: row.querySelector('.perk-amount').value
            }))
        };
    },

    saveUserData: async () => {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) return alert("Please login to save");
        const payload = {
            id: session.user.id,
            financial_year: document.getElementById('fy-selector').value,
            calculator_inputs: TaxController.captureInputs(),
            updated_at: new Date()
        };
        const { error } = await supabase.from('tax_user_data').upsert(payload);
        if (!error) TaxController.isDirty = false;
    },

    loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('tax_user_data')
            .select('calculator_inputs')
            .eq('id', user.id)
            .eq('financial_year', document.getElementById('fy-selector').value)
            .maybeSingle();

        if (data?.calculator_inputs) {
            const i = data.calculator_inputs;
            document.getElementById('basic-salary').value = i.basic;
            document.getElementById('hra-received').value = i.hra;
            document.getElementById('rent-paid').value = i.rent;
            document.getElementById('is-metro').value = i.isMetro;
            if (i.hasHomeLoan) document.getElementById('has-home-loan').checked = true;
            const perksContainer = document.getElementById('perks-rows-container');
            perksContainer.innerHTML = ''; 
            if (i.perks) i.perks.forEach(p => TaxController.addPerkRow(p.type, p.value));
        }
    }
};

window.onload = TaxController.init;
function runCalculator() { TaxController.calculateAll(); }
