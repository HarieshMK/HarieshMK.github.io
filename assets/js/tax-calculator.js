/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.16 - Merged Script Logic
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
    isInitialLoading: true,

    init: async () => {
        console.log("Tax Controller 3.16 Initializing...");

        // Unsaved changes warning
        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) {
                const message = "You have unsaved tax data. Are you sure you want to leave?";
                e.returnValue = message;
                return message;
            }
        });

        const checkDependencies = setInterval(async () => {
            if (window.FinanceEngine && window.TAX_CONFIG) {
                clearInterval(checkDependencies);
                console.log("Dependencies found. Starting logic...");

                // Set up numeric input optimization
                document.querySelectorAll('input[type="number"]').forEach(input => {
                    if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', 'decimal');
                });

                // Setup UI Toggles (from your MD script)
                TaxController.setupToggle('80c-header', '80c-content', '80c-icon');
                TaxController.setupToggle('80d-header', '80d-content', '80d-icon');
                TaxController.setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
                TaxController.setupToggle('nps-header', 'nps-content', 'nps-icon');

                // Global Input Listener (Dirty Tracking & Calculation)
                document.addEventListener('input', (e) => {
                    if (e.target.matches('input, select, .dynamic-input') || e.target.type === 'checkbox') {
                        TaxController.isDirty = true;
                        
                        // Handle Perk UI Feedback if needed
                        const row = e.target.closest('.perk-row');
                        if (row) {
                            const perkSelect = row.querySelector('select');
                            if (perkSelect) TaxController.handlePerkUIFeedback(e.target, perkSelect.value);
                        }

                        TaxController.calculateAll();
                    }
                });

                // Load data from Supabase
                await TaxController.loadUserData();

                // Set Default Rows if empty
                const pContainer = document.getElementById('perks-rows-container');
                const cContainer = document.getElementById('80c-rows-container');
                if (pContainer && pContainer.children.length === 0) {
                    TaxController.addPerkRow("Professional Tax", 2500);
                }
                if (cContainer && (cContainer.children.length === 0 || cContainer.querySelector('#empty-80c-msg'))) {
                    TaxController.add80CRow();
                }

                TaxController.isInitialLoading = false;
                TaxController.calculateAll();

                // Final reset of dirty state after initial load
                setTimeout(() => { TaxController.isDirty = false; }, 500);
            }
        }, 100);
    },

    // --- LOGIC FROM YOUR MD SCRIPT ---

    cleanNum: (val) => {
        if (!val) return 0;
        const cleanValue = val.toString().replace(/[^0-9.-]+/g, "");
        return parseFloat(cleanValue) || 0;
    },

    setupToggle: (headerId, contentId, iconId) => {
        const header = document.getElementById(headerId);
        const content = document.getElementById(contentId);
        const icon = document.getElementById(iconId);
        if (header && content && icon) {
            header.addEventListener('click', () => {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    },

    handlePerkUIFeedback: (inputElement, perkName) => {
        const value = TaxController.cleanNum(inputElement.value);
        const fy = document.getElementById('fy-selector')?.value || "2024-25";
        const config = TAX_CONFIG[fy] || TAX_CONFIG["2024-25"];
        
        if (perkName === "Meal Coupons") {
            let warningDiv = inputElement.parentNode.querySelector('.perk-limit-warning');
            if (!warningDiv) {
                warningDiv = document.createElement('div');
                warningDiv.className = 'perk-limit-warning';
                inputElement.parentNode.appendChild(warningDiv);
            }
            const limit = config.perkRules["Meal Coupons"].govtLimit;
            if (value > limit) {
                warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Standard exempt limit is ₹${limit.toLocaleString('en-IN')}.`;
                warningDiv.style.display = 'block';
            } else {
                warningDiv.style.display = 'none';
            }
        }

        if (perkName === "Fuel Allowance" || perkName === "Mobile Reimbursement") {
            inputElement.placeholder = "Enter amount as per bills";
        }
    },

    toggleLoanWizard() {
        const hasLoan = document.getElementById('has-home-loan').checked;
        const wizard = document.getElementById('home-loan-wizard');
        const deductions = document.getElementById('conditional-deductions');
        
        wizard.style.display = hasLoan ? 'block' : 'none';
        deductions.style.display = hasLoan ? 'block' : 'none';
        calculateAll();
    },
    handleLoanStatusChange() {
        const status = document.querySelector('input[name="possession"]:checked').value;
        const msg = document.getElementById('under-construction-msg');
        const fields = document.getElementById('completed-loan-fields');
        
        if (status === 'under-construction') {
            msg.style.display = 'block';
            fields.style.display = 'none';
        } else {
            msg.style.display = 'none';
            fields.style.display = 'block';
        }
        calculateAll();
    },
    
    handleSave: async () => {
        const btn = document.getElementById('save-btn');
        const status = document.getElementById('save-status');
        const selectedYear = document.getElementById('fy-selector').value;

        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            if(status) status.innerText = "Connecting to database...";

            // This assumes saveTaxData is defined globally in your supabase-logic.js
            if (typeof window.saveTaxData === 'function') {
                await window.saveTaxData(selectedYear);
                TaxController.isDirty = false;
                btn.innerHTML = `<i class="fas fa-check-circle"></i> Saved!`;
                if(status) status.innerText = `Data for ${selectedYear} synced successfully.`;
            }

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Profile';
            }, 3000);
        } catch (error) {
            console.error(error);
            btn.disabled = false;
            btn.innerHTML = 'Try Again';
        }
    },

    // --- CORE CALCULATOR LOGIC ---

    add80CRow: (type = "", amount = "", isLocked = false, customClass = "") => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        const row = document.createElement('div');
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
            `<button type="button" onclick="this.parentElement.remove(); calculateAll();" style="color:#ef4444; background:none; border:none; width:30px;"><i class="fas fa-trash"></i></button>`}
        `;
        container.appendChild(row);
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    addPerkRow: (type = "", value = "") => {
        const container = document.getElementById('perks-rows-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 30px; gap: 10px; margin-bottom: 12px; align-items: center;";
        const perkOptions = ["Meal Coupons", "Corporate NPS", "Fuel Allowance", "LTA", "Professional Tax", "Mobile Reimbursement"];
        row.innerHTML = `
            <select class="perk-type dynamic-input">
                <option value="" disabled ${!type ? 'selected' : ''}>Select Perk</option>
                ${perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <input type="number" class="perk-amount dynamic-input" placeholder="Amt" value="${value}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem;">₹ 0</div>
            <button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    calculateAll: () => {
        if (!window.FinanceEngine || !window.TAX_CONFIG) return;

        // 1. Gather Basic Inputs
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2024-25';
    
        // 2. Update dynamic UI (EPF rows) based on Basic Salary
        TaxController.manageStatutoryRows(basic);

        // 3. Home Loan Logic
        const hasHome = document.getElementById('has-home-loan')?.checked;
        const homeLoanInterest = parseFloat(document.getElementById('loan-interest')?.value) || 0;
        const sanctionDate = new Date(document.getElementById('loan-sanction-date')?.value);
        const propVal = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const occupancy = document.querySelector('input[name="occupancy"]:checked')?.value || 'self-occupied';
        const isSelfOccupied = document.querySelector('input[name="occupancy"]:checked')?.value === 'self-occupied';
        const isClaimingHRA = (parseFloat(document.getElementById('rent-paid')?.value) || 0) > 0;
        const hasLoan = document.getElementById('has-home-loan')?.checked;

        let dExtra = 0;
        let lExtra = "No Extra Deduction";
    
        if (hasHome && homeLoanInterest > 200000 && !isNaN(sanctionDate.getTime())) {
            if (sanctionDate >= ELIGIBILITY_RULES.sec80EEA.start && 
                sanctionDate <= ELIGIBILITY_RULES.sec80EEA.end && 
                propVal <= ELIGIBILITY_RULES.sec80EEA.propertyLimit) {
                
                dExtra = Math.min(homeLoanInterest - 200000, ELIGIBILITY_RULES.sec80EEA.deductionLimit);
                lExtra = "Section 80EEA (Affordable Housing)";
            } else if (sanctionDate >= ELIGIBILITY_RULES.sec80EE.start && 
                       sanctionDate <= ELIGIBILITY_RULES.sec80EE.end && 
                       propVal <= ELIGIBILITY_RULES.sec80EE.propertyLimit) {
                
                dExtra = Math.min(homeLoanInterest - 200000, ELIGIBILITY_RULES.sec80EE.deductionLimit);
                lExtra = "Section 80EE (Legacy)";
            }
        }
        const warning = document.getElementById('hra-warning');
        if (warning) {
            if (hasLoan && isSelfOccupied && isClaimingHRA) {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }
        
        // Update UI for 80EE/EEA
        const extraBox = document.getElementById('extra-loan-logic-container');
        if (extraBox) {
            extraBox.style.display = dExtra > 0 ? 'block' : 'none';
            const labelEl = document.getElementById('extra-loan-label');
            const valEl = document.getElementById('extra-loan-display-val');
            if(labelEl) labelEl.innerText = lExtra;
            if(valEl) valEl.innerText = `₹ ${Math.round(dExtra).toLocaleString('en-IN')}`;
        }

        // 4. Gather Totals for Perks and Deductions
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
        
        const perksArr = Array.from(document.querySelectorAll('.perk-row')).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: parseFloat(row.querySelector('.perk-amount').value) || 0
        }));

        const perksTotal = perksArr.reduce((s, p) => s + p.amount, 0);
        const otherIncome = parseFloat(document.getElementById('other-income')?.value) || 0;

        // Calculate Final Gross
        const gross = basic + hraRec + perksTotal + otherIncome;

        const deductionsObj = {
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + (parseFloat(e.value) || 0), 0),
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            homeLoanInterest: homeLoanInterest,
            extraLoanInterest: dExtra,
            occupancy: occupancy,
            exemptHRA: hraResult.actualExemption
        };

        // 5. Run Calculation Engines
        try {
            const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(fy, gross, deductionsObj, perksArr, basic);
            const newReg = FinanceEngine.TaxEngine.calculateNewRegime(fy, gross, perksArr, deductionsObj, basic);
            TaxController.updateSummaryUI(newReg.tax, oldReg.tax);
        } catch (err) {
            console.error("Calculation Engine Error:", err);
        }
    },

    manageStatutoryRows: (basic) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else if (epfRow) epfRow.querySelector('.row-amount-80c').value = epfAmt;
    },

    updateSummaryUI: (newTax, oldTax) => {
        const nEl = document.getElementById('new-regime-tax');
        const oEl = document.getElementById('old-regime-tax');
        if(nEl) nEl.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        if(oEl) oEl.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
    },

    loadUserData: async () => {
        if (!window.supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const fy = document.getElementById('fy-selector').value;
        const { data } = await supabase.from('tax_user_data')
            .select('calculator_inputs')
            .eq('user_id', user.id)
            .eq('financial_year', fy)
            .maybeSingle();

        if (data?.calculator_inputs) {
            const i = data.calculator_inputs;
            
            // Map saved values to UI IDs
            if(document.getElementById('basic-salary')) document.getElementById('basic-salary').value = i.basic || "";
            if(document.getElementById('hra-received')) document.getElementById('hra-received').value = i.hraReceived || "";
            if(document.getElementById('rent-paid')) document.getElementById('rent-paid').value = i.rentPaid || "";
            if(document.getElementById('is-metro')) document.getElementById('is-metro').value = i.isMetro ? "true" : "false";
            if(document.getElementById('other-income')) document.getElementById('other-income').value = i.otherIncome || "";
            
            // Home Loan Fields
            if(document.getElementById('has-home-loan')) {
                document.getElementById('has-home-loan').checked = i.hasHomeLoan || false;
                TaxController.toggleLoanWizard(); // Open wizard if they have a loan
            }
            if(document.getElementById('loan-interest')) document.getElementById('loan-interest').value = i.homeLoanInterest || "";
            if(document.getElementById('loan-sanction-date')) document.getElementById('loan-sanction-date').value = i.sanctionDate || "";
            if(document.getElementById('property-stamp-value')) document.getElementById('property-stamp-value').value = i.propertyValue || "";
            
            // Section 80D
            if(document.getElementById('80d-self')) document.getElementById('80d-self').value = i.healthSelf || "";

            // Restore Dynamic Rows (Perks & 80C)
            if (i.perks && i.perks.length > 0) {
                document.getElementById('perks-rows-container').innerHTML = "";
                i.perks.forEach(p => TaxController.addPerkRow(p.type, p.amount));
            }
            if (i.investments80C && i.investments80C.length > 0) {
                document.getElementById('80c-rows-container').innerHTML = "";
                i.investments80C.forEach(inv => TaxController.add80CRow(inv.type, inv.amount));
            }
        }
    };

// GLOBAL BRIDGES
window.TaxController = TaxController;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;
window.handleSave = TaxController.handleSave;
window.toggleLoanWizard = TaxController.toggleLoanWizard;

document.addEventListener('DOMContentLoaded', TaxController.init);
