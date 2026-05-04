/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.13 - Race Condition Fix
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
    isInitialLoading: true, // Prevents calculation errors during data fetch

    init: async () => {
        console.log("Tax Controller 3.13 Initializing...");

        // WAIT for dependencies to exist
        const checkDependencies = setInterval(async () => {
            if (window.FinanceEngine && window.TAX_CONFIG) {
                clearInterval(checkDependencies);
                console.log("Dependencies found. Starting logic...");
                
                // Set up event listeners
                document.addEventListener('input', (e) => {
                    if (e.target.matches('input, select, .dynamic-input')) {
                        TaxController.isDirty = true;
                        TaxController.calculateAll();
                    }
                });

                // Load real data from Supabase
                await TaxController.loadUserData();
                
                // Allow calculations now
                TaxController.isInitialLoading = false;
                TaxController.calculateAll();
            }
        }, 100); // Check every 100ms
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
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
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
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    calculateAll: () => {
        // Exit if dependencies are missing or we are in initial data load state
        if (!window.FinanceEngine || !window.TAX_CONFIG) return;

        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2024-25';

        const hasEdu = document.getElementById('has-edu-loan')?.checked;
        if(document.getElementById('section-80e-input')) {
            document.getElementById('section-80e-input').style.display = hasEdu ? 'block' : 'none';
        }

        const hasHome = document.getElementById('has-home-loan')?.checked;
        const interest = parseFloat(document.getElementById('home-interest')?.value) || 0;
        const sDateStr = document.getElementById('loan-sanction-date')?.value;
        const propVal = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const occupancy = document.getElementById('loan-occupancy')?.value || 'self-occupied';

        let dExtra = 0;
        let lExtra = "";

        if (hasHome && sDateStr && interest > 0) {
            const sDate = new Date(sDateStr);
            if (sDate >= ELIGIBILITY_RULES.sec80EEA.start && sDate <= ELIGIBILITY_RULES.sec80EEA.end && propVal <= 4500000) {
                dExtra = Math.min(Math.max(0, interest - 200000), 150000);
                lExtra = "Section 80EEA (Affordable Housing)";
            } else if (sDate >= ELIGIBILITY_RULES.sec80EE.start && sDate <= ELIGIBILITY_RULES.sec80EE.end && propVal <= 5000000) {
                dExtra = Math.min(Math.max(0, interest - 200000), 50000);
                lExtra = "Section 80EE (Legacy)";
            }
        }

        const extraBox = document.getElementById('extra-loan-logic-container');
        if (extraBox) {
            extraBox.style.display = dExtra > 0 ? 'block' : 'none';
            document.getElementById('extra-loan-label').innerText = lExtra;
            document.getElementById('extra-loan-display-val').innerText = `₹ ${Math.round(dExtra).toLocaleString('en-IN')}`;
        }

        TaxController.manageStatutoryRows(basic, hasHome);

        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
        
        const deductionsObj = {
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + (parseFloat(e.value) || 0), 0),
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents')?.value) || 0,
            parentsSenior: document.getElementById('parents-senior')?.checked || false,
            npsSelf: parseFloat(document.getElementById('nps-extra')?.value) || 0,
            homeLoanInterest: interest,
            extraLoanInterest: dExtra,
            occupancy: occupancy,
            exemptHRA: hraResult.actualExemption,
            eduLoanInterest: parseFloat(document.getElementById('edu-interest')?.value) || 0
        };

        const perksArr = Array.from(document.querySelectorAll('.perk-row')).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: row.querySelector('.perk-amount').value.includes('%') 
                    ? (parseFloat(row.querySelector('.perk-amount').value)/100)*basic 
                    : (parseFloat(row.querySelector('.perk-amount').value)||0)
        }));

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
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;
    },

    updateSummaryUI: (newTax, oldTax) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
    },

    loadUserData: async () => {
        if (!window.supabase) return;
        
        // Ensure we have a user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            console.log("No active session found.");
            return;
        }

        const selectedYear = document.getElementById('fy-selector').value;
        console.log(`Fetching data for User: ${user.id} and Year: ${selectedYear}`);

        const { data, error } = await supabase.from('tax_user_data')
            .select('calculator_inputs')
            .eq('user_id', user.id) // Changed 'id' to 'user_id' (Common Supabase standard)
            .eq('financial_year', selectedYear)
            .maybeSingle();

        if (error) {
            console.error("Supabase Fetch Error:", error);
            return;
        }

        if (data?.calculator_inputs) {
            const i = data.calculator_inputs;
            
            // Map Basic Fields
            if(document.getElementById('basic-salary')) document.getElementById('basic-salary').value = i.basic || "";
            if(document.getElementById('hra-received')) document.getElementById('hra-received').value = i.hra || "";
            if(document.getElementById('rent-paid')) document.getElementById('rent-paid').value = i.rent || "";
            if(document.getElementById('other-income')) document.getElementById('other-income').value = i.other_income || "";

            // Clear and Restore Perks
            const pContainer = document.getElementById('perks-rows-container');
            if (pContainer && i.perks) {
                pContainer.innerHTML = '';
                i.perks.forEach(p => TaxController.addPerkRow(p.type, p.amount || p.value));
            }

            // Clear and Restore 80C Rows (THIS WAS MISSING)
            const cContainer = document.getElementById('80c-rows-container');
            if (cContainer && i.investments80C) {
                // Keep only statutory rows (like EPF), remove manual ones
                const manualRows = cContainer.querySelectorAll('.row-80c-manual');
                manualRows.forEach(row => row.remove());
                
                i.investments80C.forEach(inv => {
                    // Don't duplicate EPF if it's already there
                    if (inv.type !== "Employee PF") {
                        TaxController.add80CRow(inv.type, inv.amount);
                    }
                });
            }
            
            console.log("Data loaded and UI updated.");
        } else {
            console.log("No saved data found for this year.");
        }
    }
}

// GLOBAL BRIDGE - Connects Internal Controller to External HTML
window.TaxController = TaxController;
window.toggleSection = TaxController.toggleSection;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;

document.addEventListener('DOMContentLoaded', TaxController.init);
