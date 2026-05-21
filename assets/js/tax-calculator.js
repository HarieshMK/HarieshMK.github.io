/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.17 - Fully Synced Schema & Global Routing Fixes
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
    isInitialLoading: true,

    init: async () => {
        console.log("Tax Controller 3.17 Initializing...");

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

                // Setup UI Toggles 
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
        const fy = document.getElementById('fy-selector')?.value || "2026-27";
        const config = TAX_CONFIG[fy] || TAX_CONFIG["2026-27"];
        
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
        
        if(wizard) wizard.style.display = hasLoan ? 'block' : 'none';
        if(deductions) deductions.style.display = hasLoan ? 'block' : 'none';
        TaxController.calculateAll();
    },
    
    handleLoanStatusChange() {
        const status = document.querySelector('input[name="possession"]:checked')?.value;
        const msg = document.getElementById('under-construction-msg');
        const fields = document.getElementById('completed-loan-fields');
        
        if (status === 'under-construction') {
            if(msg) msg.style.display = 'block';
            if(fields) fields.style.display = 'none';
        } else {
            if(msg) msg.style.display = 'none';
            if(fields) fields.style.display = 'block';
        }
        TaxController.calculateAll();
    },

    handleDateBranching: () => {
        const dateVal = document.getElementById('loan-sanction-date')?.value;
        const branchEE = document.getElementById('branch-80ee-fields');   
        const branchEEA = document.getElementById('branch-80eea-fields'); 

        if (!branchEE || !branchEEA) return;

        branchEE.style.display = 'none';
        branchEEA.style.display = 'none';

        if (!dateVal) return;
        const sanctionDate = new Date(dateVal);

        if (sanctionDate >= ELIGIBILITY_RULES.sec80EE.start && sanctionDate <= ELIGIBILITY_RULES.sec80EE.end) {
            branchEE.style.display = 'block';
        } else if (sanctionDate >= ELIGIBILITY_RULES.sec80EEA.start && sanctionDate <= ELIGIBILITY_RULES.sec80EEA.end) {
            branchEEA.style.display = 'block';
        }
    },

    syncPrincipalTo80C: (amount) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;

        let principalRow = container.querySelector('.row-80c-statutory-hl-principal');
        
        if (amount > 0) {
            if (!principalRow) {
                TaxController.add80CRow("Home Loan Principal", amount, true, "row-80c-statutory-hl-principal");
            } else {
                principalRow.querySelector('.row-amount-80c').value = amount;
            }
        } else if (principalRow) {
            principalRow.remove();
        }
    },
    
    handleSave: async () => {
        const btn = document.getElementById('save-btn');
        const status = document.getElementById('save-status');
        const selectedYear = document.getElementById('fy-selector').value;

        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            if(status) status.innerText = "Connecting to database...";

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
            `<button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none; width:30px;"><i class="fas fa-trash"></i></button>`}
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
    
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2026-27';
    
        TaxController.manageStatutoryRows(basic);
    
        const hasLoan = document.getElementById('has-home-loan')?.checked;
        
        let homeLoanInterest = 0;
        let homeLoanPrincipal = 0;
        let dExtra = 0;
        let extraSection = null;
        let isSelfOccupied = document.querySelector('input[name="occupancy"]:checked')?.value === 'self';
        let eligible24b = 0;

        TaxController.handleDateBranching();
        
        if (hasLoan) {
            homeLoanInterest = parseFloat(document.getElementById('loan-interest')?.value) || 0;
            homeLoanPrincipal = parseFloat(document.getElementById('loan-principal')?.value) || 0;
            const sanctionDateVal = document.getElementById('loan-sanction-date')?.value;
            const isFirstTimeBuyer = document.getElementById('is-first-buyer')?.checked; 
            const loanAmt = parseFloat(document.getElementById('original-loan-amt')?.value) || 0; 
            const propVal = parseFloat(document.getElementById('property-stamp-value')?.value) || 0; 

            if (isSelfOccupied && homeLoanInterest > 200000 && isFirstTimeBuyer && sanctionDateVal) {
                const sanctionDate = new Date(sanctionDateVal);

                if (sanctionDate >= ELIGIBILITY_RULES.sec80EEA.start && 
                    sanctionDate <= ELIGIBILITY_RULES.sec80EEA.end && 
                    propVal > 0 && propVal <= ELIGIBILITY_RULES.sec80EEA.propertyLimit) {
                    
                    dExtra = Math.max(0, Math.min(homeLoanInterest - 200000, ELIGIBILITY_RULES.sec80EEA.deductionLimit));
                    extraSection = 'card-80eea';
                } 
                else if (sanctionDate >= ELIGIBILITY_RULES.sec80EE.start && 
                         sanctionDate <= ELIGIBILITY_RULES.sec80EE.end && 
                         propVal > 0 && propVal <= ELIGIBILITY_RULES.sec80EE.propertyLimit &&
                         loanAmt > 0 && loanAmt <= ELIGIBILITY_RULES.sec80EE.loanLimit) {
                    
                    dExtra = Math.max(0, Math.min(homeLoanInterest - 200000, ELIGIBILITY_RULES.sec80EE.deductionLimit));
                    extraSection = 'card-80ee';
                }
            }

            eligible24b = isSelfOccupied ? Math.min(homeLoanInterest, 200000) : homeLoanInterest;
        }

        TaxController.syncPrincipalTo80C(hasLoan ? homeLoanPrincipal : 0);

        const cardEEA = document.getElementById('card-80eea');
        const cardEE = document.getElementById('card-80ee');
        if(cardEEA) cardEEA.style.display = (extraSection === 'card-80eea') ? 'block' : 'none';
        if(cardEE) cardEE.style.display = (extraSection === 'card-80ee') ? 'block' : 'none';

        if (extraSection) {
            const displayId = extraSection === 'card-80eea' ? 'display-80eea-value' : 'display-80ee-value';
            const displayEl = document.getElementById(displayId);
            if(displayEl) displayEl.innerText = `₹ ${Math.round(dExtra).toLocaleString('en-IN')}`;
        }

        const display24b = document.getElementById('display-24b-value');
        if(display24b) display24b.innerText = `₹ ${Math.round(eligible24b).toLocaleString('en-IN')}`;
    
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
        const hraDisplay = document.getElementById('display-hra-value');
        if (hraDisplay) {
            hraDisplay.innerText = `₹ ${Math.round(hraResult.actualExemption).toLocaleString('en-IN')}`;
        }
    
        // Gather Perks (Fixed: Normalized variable parameters map directly as value and amount)
        const perkRows = document.querySelectorAll('.perk-row');
        const perksArr = Array.from(perkRows).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: parseFloat(row.querySelector('.perk-amount').value) || 0,
            value: parseFloat(row.querySelector('.perk-amount').value) || 0,
            element: row.querySelector('.perk-eligible')
        }));
    
        const otherIncome = parseFloat(document.getElementById('other-income')?.value) || 0;
        const gross = basic + hraRec + otherIncome;
    
        const deductionsObj = {
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + (parseFloat(e.value) || 0), 0),
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents')?.value) || 0,
            parentsSenior: document.getElementById('parents-senior')?.checked || false,
            npsExtra: parseFloat(document.getElementById('nps-80ccd-1b')?.value) || 0,
            homeLoanInterest: homeLoanInterest, 
            extraLoanInterest: dExtra, 
            occupancy: isSelfOccupied ? 'self' : 'rented',
            exemptHRA: hraResult.actualExemption
        };
    
        const total80CDisplay = document.getElementById('display-80c-total');
        if(total80CDisplay) {
            const total80C = Math.min(deductionsObj.section80C, 150000);
            total80CDisplay.innerText = `₹ ${total80C.toLocaleString('en-IN')}`;
        }
    
        try {
            const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(fy, gross, deductionsObj, perksArr, basic);
            const newReg = FinanceEngine.TaxEngine.calculateNewRegime(fy, gross, perksArr, deductionsObj, basic);
            
            newReg.perkBreakdown.forEach((item, index) => {
                if (perksArr[index] && perksArr[index].element) {
                    perksArr[index].element.innerText = `₹ ${Math.round(item.eligible).toLocaleString('en-IN')}`;
                }
            });
    
            TaxController.updateSummaryUI(newReg.tax, oldReg.tax, oldReg, newReg, gross);
            
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

    updateSummaryUI: (newTax, oldTax, oldRegDetails, newRegDetails, grossSalary) => {
        let finalOldTax = oldTax;
        if (oldTax === 0 && oldRegDetails.netTaxable > 500000) {
            const taxable = oldRegDetails.netTaxable;
            let baseTax = 0;
            if (taxable > 250000) baseTax += (Math.min(taxable, 500000) - 250000) * 0.05;
            if (taxable > 500000) baseTax += (Math.min(taxable, 1000000) - 500000) * 0.20;
            if (taxable > 1000000) baseTax += (taxable - 1000000) * 0.30;
            finalOldTax = baseTax * 1.04; 
        }

        const fy = document.getElementById('fy-selector')?.value || '2026-27';
        
        // Fixed: Evaluates correctly for FY 2026-27 and all subsequent fiscal periods
        const oldStdDeduction = 50000;
        const newStdDeduction = (fy === '2024-25' || fy === '2025-26') ? 50000 : 75000;

        const nEl = document.getElementById('new-regime-tax');
        const oEl = document.getElementById('old-regime-tax');
        if(nEl) nEl.innerText = `₹ ${Math.round(newTax || 0).toLocaleString('en-IN')}`;
        if(oEl) oEl.innerText = `₹ ${Math.round(finalOldTax || 0).toLocaleString('en-IN')}`;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if(el) {
                const safeVal = isNaN(val) || val === undefined || val === null ? 0 : val;
                el.innerText = `₹ ${Math.round(safeVal).toLocaleString('en-IN')}`;
            }
        };

        if (oldRegDetails && newRegDetails) {
            // Fixed: Maps cleanly to the single uniform gross-salary row identifier
            setVal('summary-gross-salary', grossSalary || 0); 
            setVal('summary-gross-salary-new', grossSalary || 0);

            setVal('summary-taxable-old', oldRegDetails.netTaxable);
            setVal('summary-taxable-new', newRegDetails.netTaxable);

            // Fixed: Standardizes elements across the uniform table mapping identifiers
            setVal('summary-standard-deduction', oldStdDeduction);
            setVal('summary-standard-deduction-new', newStdDeduction);

            const applied80C = oldRegDetails.appliedDeductions?.section80C || 0;
            const applied80D = oldRegDetails.appliedDeductions?.section80D || 0;
            const applied24b = oldRegDetails.appliedDeductions?.homeInterest || 0;
            
            const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
            const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
            const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
            const isMetro = document.getElementById('is-metro')?.value === 'true';
            const calculatedHRA = window.FinanceEngine?.TaxEngine?.calculateExemptHRA(basic, hraRec, rentPaid, isMetro)?.actualExemption || 0;

            setVal('summary-80c-deduction', applied80C);
            setVal('summary-hra-deduction', calculatedHRA);
            setVal('summary-80d-deduction', applied80D);
            setVal('summary-24b-deduction', applied24b); // Fixed: Connected directly to table layout targets

            setVal('summary-total-tax-old', finalOldTax);
            setVal('summary-total-tax-new', newTax || 0);
        }
    },

    loadUserData: async () => {
        console.log("DEBUG: loadUserData started");
        if (!window.supabase) {
            console.error("DEBUG: Supabase not found");
            return;
        }

        const { data: authRecord, error: authError } = await supabase.auth.getUser();
        const user = authRecord?.user;

        if (authError || !user) {
            console.log("DEBUG: No logged-in user found.");
            return;
        }

        const fySelector = document.getElementById('fy-selector');
        const fy = fySelector ? fySelector.value : '2026-27';

        const { data, error } = await supabase.from('tax_user_data')
            .select('calculator_inputs')
            .eq('user_id', user.id)
            .eq('financial_year', fy)
            .maybeSingle();

        if (error) {
            console.error("DEBUG: Database query error:", error.message);
            return;
        }

        if (!data || !data.calculator_inputs) {
            console.warn("DEBUG: No data found for this FY.");
            return;
        }

        const i = data.calculator_inputs;
        console.log("DEBUG: Standardizing mapping for data:", i);
        
        if(document.getElementById('basic-salary')) document.getElementById('basic-salary').value = i.basic || "";
        if(document.getElementById('hra-received')) document.getElementById('hra-received').value = i.hra || "";
        if(document.getElementById('rent-paid')) document.getElementById('rent-paid').value = i.rent || "";
        if(document.getElementById('is-metro')) document.getElementById('is-metro').value = (i.isMetro === 'true' || i.isMetro === true) ? "true" : "false";
        if(document.getElementById('other-income')) document.getElementById('other-income').value = i.otherIncome || "";
        
        if(document.getElementById('has-home-loan')) {
            document.getElementById('has-home-loan').checked = (i.homeInterest > 0 || i.isUnderConstruction);
            TaxController.toggleLoanWizard(); 
        }
        if(document.getElementById('loan-interest')) document.getElementById('loan-interest').value = i.homeInterest || "";
        if(document.getElementById('loan-sanction-date')) document.getElementById('loan-sanction-date').value = i.sanctionDate || "";
        if(document.getElementById('loan-principal')) document.getElementById('loan-principal').value = i.loanPrincipal || "";
        if(document.getElementById('property-stamp-value')) document.getElementById('property-stamp-value').value = i.propertyValue || "";
        
        if (i.isUnderConstruction !== undefined) {
            const radio = document.querySelector(`input[name="possession"][value="${i.isUnderConstruction ? 'under-construction' : 'completed'}"]`);
            if (radio) {
                radio.checked = true;
                TaxController.handleLoanStatusChange();
            }
        }
        if (i.occupancy) {
            const occRadio = document.querySelector(`input[name="occupancy"][value="${i.occupancy}"]`);
            if (occRadio) occRadio.checked = true;
        }
        
        if (i.perks && i.perks.length > 0) {
            const pContainer = document.getElementById('perks-rows-container');
            if (pContainer) {
                pContainer.innerHTML = "";
                i.perks.forEach(p => TaxController.addPerkRow(p.type, p.value || p.amount));
            }
        }

        if (i.deductions80C && i.deductions80C.length > 0) {
            const cContainer = document.getElementById('80c-rows-container');
            if (cContainer) {
                cContainer.innerHTML = "";
                i.deductions80C.forEach(inv => TaxController.add80CRow(inv.type, inv.amount));
            }
        }
        
        TaxController.calculateAll();
    }
};

// GLOBAL FIXED WINDOW ROUTING LINK FOR THE MARKDOWN BUTTON
window.scrollToResults = function() {
    const targetElement = document.getElementById('tax-breakdown-section');
    if (targetElement) {
        targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });
    } else {
        console.warn("Target element '#tax-breakdown-section' not found in the DOM.");
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
