/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.16 - Merged Script Logic (Restored with Schema Fixes)
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
    
        const basic = parseFloat(document.getElementById('basic-salary')?.value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received')?.value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0;
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const fy = document.getElementById('fy-selector')?.value || '2024-25';
    
        TaxController.manageStatutoryRows(basic);
    
        // --- HOME LOAN LOGIC START ---
        const homeLoanInterest = parseFloat(document.getElementById('loan-interest')?.value) || 0;
        const homeLoanPrincipal = parseFloat(document.getElementById('loan-principal')?.value) || 0;
        const sanctionDateVal = document.getElementById('loan-sanction-date')?.value;
        const sanctionDate = sanctionDateVal ? new Date(sanctionDateVal) : null;
        const propVal = parseFloat(document.getElementById('property-stamp-value')?.value) || 0;
        const isSelfOccupied = document.querySelector('input[name="occupancy"]:checked')?.value === 'self';
        const hasLoan = document.getElementById('has-home-loan')?.checked;
    
        let dExtra = 0;
        let extraSection = null; // To track which UI card to show (EE or EEA)
    
        // We only show 80EE/EEA if the property is Self-Occupied
            if (hasLoan && isSelfOccupied && homeLoanInterest > 0 && sanctionDate && !isNaN(sanctionDate.getTime())) {
                
                // Calculate 80EEA
                if (sanctionDate >= ELIGIBILITY_RULES.sec80EEA.start && 
                    sanctionDate <= ELIGIBILITY_RULES.sec80EEA.end && 
                    propVal <= ELIGIBILITY_RULES.sec80EEA.propertyLimit) {
                    
                    // Only trigger if interest exceeds the 2L cap of Section 24b
                    dExtra = Math.min(Math.max(0, homeLoanInterest - 200000), ELIGIBILITY_RULES.sec80EEA.deductionLimit);
                    extraSection = 'card-80eea';
                    document.getElementById('display-80eea-value').innerText = `₹ ${Math.round(dExtra).toLocaleString('en-IN')}`;
                } 
                // Calculate 80EE
                else if (sanctionDate >= ELIGIBILITY_RULES.sec80EE.start && 
                         sanctionDate <= ELIGIBILITY_RULES.sec80EE.end && 
                         propVal <= ELIGIBILITY_RULES.sec80EE.propertyLimit) {
                    
                    dExtra = Math.min(Math.max(0, homeLoanInterest - 200000), ELIGIBILITY_RULES.sec80EE.deductionLimit);
                    extraSection = 'card-80ee';
                    document.getElementById('display-80ee-value').innerText = `₹ ${Math.round(dExtra).toLocaleString('en-IN')}`;
                }
            } else {
                // If rented or no loan, reset extra deduction
                dExtra = 0;
                extraSection = null;
            }
    
        // Toggle Extra Logic UI Cards
        document.getElementById('card-80eea').style.display = (extraSection === 'card-80eea' && dExtra > 0) ? 'block' : 'none';
        document.getElementById('card-80ee').style.display = (extraSection === 'card-80ee' && dExtra > 0) ? 'block' : 'none';
    
        // Update Section 24b Display
        const eligible24b = isSelfOccupied ? Math.min(homeLoanInterest, 200000) : homeLoanInterest;
        const display24b = document.getElementById('display-24b-value');
        if(display24b) display24b.innerText = `₹ ${Math.round(eligible24b).toLocaleString('en-IN')}`;
        // --- HOME LOAN LOGIC END ---
    
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
    
        // Gather Perks
        const perkRows = document.querySelectorAll('.perk-row');
        const perksArr = Array.from(perkRows).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: parseFloat(row.querySelector('.perk-amount').value) || 0,
            element: row.querySelector('.perk-eligible')
        }));
    
        const otherIncome = parseFloat(document.getElementById('other-income')?.value) || 0;
        const gross = basic + hraRec + otherIncome;
    
        // Build Deductions Object
        const deductionsObj = {
            // Collect all 80C rows PLUS the Principal from the Home Loan assistant
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + (parseFloat(e.value) || 0), 0) + (hasLoan ? homeLoanPrincipal : 0),
            healthSelf: parseFloat(document.getElementById('80d-self')?.value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents')?.value) || 0,
            parentsSenior: document.getElementById('parents-senior')?.checked || false,
            npsExtra: parseFloat(document.getElementById('nps-80ccd-1b')?.value) || 0,
            homeLoanInterest: homeLoanInterest,
            extraLoanInterest: dExtra, // Pass the 80EE/EEA calculated value here
            occupancy: isSelfOccupied ? 'self' : 'rented',
            exemptHRA: hraResult.actualExemption
        };
    
        // Update 80C total display in UI
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
        const fy = fySelector ? fySelector.value : '2024-25';

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
        
        // 1. Basic Income & HRA
        if(document.getElementById('basic-salary')) document.getElementById('basic-salary').value = i.basic || "";
        if(document.getElementById('hra-received')) document.getElementById('hra-received').value = i.hra || "";
        if(document.getElementById('rent-paid')) document.getElementById('rent-paid').value = i.rent || "";
        if(document.getElementById('is-metro')) document.getElementById('is-metro').value = (i.isMetro === 'true' || i.isMetro === true) ? "true" : "false";
        if(document.getElementById('other-income')) document.getElementById('other-income').value = i.otherIncome || "";
        
        // 2. Home Loan Fields (Standardized keys: homeInterest, isUnderConstruction)
        if(document.getElementById('has-home-loan')) {
            document.getElementById('has-home-loan').checked = (i.homeInterest > 0 || i.isUnderConstruction);
            TaxController.toggleLoanWizard(); 
        }
        if(document.getElementById('loan-interest')) document.getElementById('loan-interest').value = i.homeInterest || "";
        if(document.getElementById('loan-sanction-date')) document.getElementById('loan-sanction-date').value = i.sanctionDate || "";
        if(document.getElementById('property-stamp-value')) document.getElementById('property-stamp-value').value = i.propertyValue || "";
        
        if (i.isUnderConstruction !== undefined) {
            const radio = document.querySelector(`input[name="possession"][value="${i.isUnderConstruction ? 'under-construction' : 'completed'}"]`);
            if (radio) {
                radio.checked = true;
                TaxController.handleLoanStatusChange();
            }
        }
        // Restore Occupancy status
        if (i.occupancy) {
            const occRadio = document.querySelector(`input[name="occupancy"][value="${i.occupancy}"]`);
            if (occRadio) occRadio.checked = true;
        }
        
        // 3. Section 80D & NPS (Standardized keys: healthSelf, healthParents, npsExtra)
        if(document.getElementById('80d-self')) document.getElementById('80d-self').value = i.healthSelf || "";
        if(document.getElementById('80d-parents')) document.getElementById('80d-parents').value = i.healthParents || "";
        if(document.getElementById('parents-senior')) document.getElementById('parents-senior').checked = i.parentsSenior || false;
        if(document.getElementById('nps-80ccd-1b')) document.getElementById('nps-80ccd-1b').value = i.npsExtra || "";

        // 4. Restore Perks (Mapping 'value' to the row's input)
        if (i.perks && i.perks.length > 0) {
            const pContainer = document.getElementById('perks-rows-container');
            if (pContainer) {
                pContainer.innerHTML = "";
                i.perks.forEach(p => TaxController.addPerkRow(p.type, p.value));
            }
        }

        // 5. Restore 80C (Mapping 'deductions80C' to the rows)
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

// GLOBAL BRIDGES
window.TaxController = TaxController;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;
window.handleSave = TaxController.handleSave;
window.toggleLoanWizard = TaxController.toggleLoanWizard;

document.addEventListener('DOMContentLoaded', TaxController.init);
