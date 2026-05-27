/**
 * Controller for the Tax Calculator UI
 * VERSION: 3.22 - Optimized for Indian Currency Parsing, Rightaligned Layouts, and Checked HRA Validation
 */

const TaxController = {
    isDirty: false,
    isInitialLoading: true,

    init: async () => {
        console.log("Tax Controller Initializing...");

        if (!window.FinanceEngine || !window.TAX_CONFIG) {
            console.warn("Tax engines missing. Re-routing initialization hook...");
            window.addEventListener('load', () => TaxController.init());
            return;
        }

        console.log("Dependencies verified successfully. Initializing application logic components...");

        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) {
                const message = "Your data is unsaved. Are you sure you want to leave?";
                e.returnValue = message;
                return message;
            }
        });

        // Initialize masking on existing fields and attach formatting listeners
        TaxController.applyCurrencyFormattingListeners();

        TaxController.setupToggle('80c-header', '80c-content', '80c-icon');
        TaxController.setupToggle('80d-header', '80d-content', '80d-icon');
        TaxController.setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
        TaxController.setupToggle('nps-header', 'nps-content', 'nps-icon');

        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, .dynamic-input') || e.target.type === 'checkbox') {
                TaxController.isDirty = true;
                const row = e.target.closest('.perk-row');
                if (row) {
                    const perkSelect = row.querySelector('select');
                    if (perkSelect) TaxController.handlePerkUIFeedback(e.target, perkSelect.value);
                }
                TaxController.calculateAll();
            }
        });

        const appFySelector = document.getElementById('fy-selector');
        if (appFySelector) {
            appFySelector.addEventListener('change', async () => {
                console.log(`FY Dropdown changed to: ${appFySelector.value}. Fetching fresh data...`);
                TaxController.isInitialLoading = true;

                const pContainer = document.getElementById('perks-rows-container');
                const cContainer = document.getElementById('80c-rows-container');
                if (pContainer) pContainer.innerHTML = "";
                if (cContainer) cContainer.innerHTML = "";

                const fieldsToClear = ['basic-salary', 'hra-received', 'rent-paid', 'other-income', 'loan-interest', 'loan-principal', '80d-self', '80d-parents', 'nps-80ccd-1b'];
                fieldsToClear.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = "";
                });
                
                const seniorCheck = document.getElementById('parents-senior');
                if (seniorCheck) seniorCheck.checked = false;

                await TaxController.loadUserData();

                if (pContainer && pContainer.children.length === 0) {
                    TaxController.addPerkRow("Professional Tax", 2500);
                }
                if (cContainer && cContainer.children.length === 0) {
                    TaxController.add80CRow();
                }

                TaxController.isInitialLoading = false;
                TaxController.applyCurrencyFormattingListeners();
                TaxController.calculateAll();
                setTimeout(() => { TaxController.isDirty = false; }, 200);
            });
        }

        await TaxController.loadUserData();

        const pContainer = document.getElementById('perks-rows-container');
        const cContainer = document.getElementById('80c-rows-container');
        if (pContainer && pContainer.children.length === 0) {
            TaxController.addPerkRow("Professional Tax", 2500);
        }
        if (cContainer && (cContainer.children.length === 0 || cContainer.querySelector('#empty-80c-msg'))) {
            TaxController.add80CRow();
        }

        TaxController.isInitialLoading = false;
        TaxController.applyCurrencyFormattingListeners();
        TaxController.calculateAll();

        setTimeout(() => { TaxController.isDirty = false; }, 500);
    },

    cleanNum: (val) => {
        if (val === undefined || val === null || val === '') return 0;
        // Strip out commas completely before running evaluation loops to protect calculations
        const cleanValue = val.toString().replace(/,/g, "").replace(/[^0-9.-]+/g, "");
        return parseFloat(cleanValue) || 0;
    },

    formatIndianCurrency: (valueString) => {
        let value = valueString.replace(/,/g, '');
        if (!value) return '';
        let parts = value.split('.');
        let lastThree = parts[0].substring(parts[0].length - 3);
        let otherBits = parts[0].substring(0, parts[0].length - 3);
        if (otherBits !== '') lastThree = ',' + lastThree;
        let formatted = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        if (parts.length > 1) formatted += '.' + parts[1];
        return formatted;
    },

    applyCurrencyFormattingListeners: () => {
        // Targets all standard input elements and sets input type to text safely to support commas
        const targets = document.querySelectorAll('#basic-salary, #hra-received, #rent-paid, #other-income, #loan-interest, #loan-principal, #80d-self, #80d-parents, #nps-80ccd-1b, #original-loan-amt, #property-stamp-value, .perk-amount, .row-amount-80c');
        
        targets.forEach(input => {
            if (input.tagName === 'INPUT' && !input.classList.contains('currency-mapped')) {
                input.classList.add('currency-mapped');
                input.setAttribute('type', 'text');
                input.setAttribute('inputmode', 'decimal');

                // If loaded data already populated a raw digit value, format it right away
                if (input.value) {
                    input.value = TaxController.formatIndianCurrency(input.value);
                }

                input.addEventListener('input', function() {
                    let selectionStart = this.selectionStart;
                    let oldLength = this.value.length;
                    
                    let formatted = TaxController.formatIndianCurrency(this.value);
                    this.value = formatted;
                    
                    let newLength = this.value.length;
                    this.setSelectionRange(selectionStart + (newLength - oldLength), selectionStart + (newLength - oldLength));
                });
            }
        });
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
                const targetInput = principalRow.querySelector('.row-amount-80c');
                targetInput.value = TaxController.formatIndianCurrency(amount.toString());
            }
        } else if (principalRow) {
            principalRow.remove();
        }
    },

    scrollToResults() {
        console.log("DEBUG: scrollToResults triggered!");
        const target = document.getElementById('tax-breakdown-section');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error("ERROR: Element #tax-breakdown-section not found in the HTML!");
        }
    },
    
    handleSave: async () => {
        const btn = document.getElementById('save-btn');
        const status = document.getElementById('save-status');
        const selectedYear = document.getElementById('fy-selector').value;

        if (status) {
            status.style.color = "";
            status.innerText = "";
        }

        try {
            if (!window.supabase) {
                throw new Error("Supabase Database connection client could not be detected on the page template.");
            }

            const { data: authRecord } = await supabase.auth.getUser();
            const user = authRecord?.user;

            if (!user) {
                const firstChoice = confirm(
                    "Wait, who are you? 🕵️‍♂️\n\n" +
                    "We love your tax-saving ambition, but we can't save your data into thin air! You need a free account to secure this progress.\n\n" +
                    "Click 'OK' to secure your tax profile now!\n" +
                    "Click 'Cancel' if you prefer manually re-typing all of this later."
                );

                if (firstChoice) {
                    window.location.href = "https://harieshmk.github.io/login/";
                } else {
                    const secondChoice = confirm(
                        "Oh No! Your beautifully optimized tax plan is crying in a corner now. 😢\n\n" +
                        "Are you absolutely sure you want to miss out on free tracking and lose all your inputs?"
                    );
                    
                    if (secondChoice) {
                        if (status) {
                            status.style.color = "#d97706";
                            status.innerText = "⚠️ Progress unsaved. Your tax data is living on the edge!";
                        }
                        btn.innerHTML = `<i class="fas fa-heart-broken"></i> Unsaved Profile`;
                        setTimeout(() => {
                            btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Profile';
                        }, 5000);
                    } else {
                        window.location.href = "https://harieshmk.github.io/login/";
                    }
                }
                return; 
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Cloud...';
            if (status) status.innerText = "Connecting securely to data systems...";

            if (typeof window.saveTaxData !== 'function') {
                throw new Error("The backend logic coordinator 'window.saveTaxData' is missing or failed to initialize.");
            }

            await window.saveTaxData(selectedYear);
            
            TaxController.isDirty = false;
            btn.innerHTML = `<i class="fas fa-check-circle"></i> Profile Synced!`;
            
            if (status) {
                status.style.color = "#22c55e";
                status.innerText = `🎉 Success! Your data for FY ${selectedYear} is saved. You can visit this site anytime and access your data securely.`;
            }

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Profile';
            }, 4000);

        } catch (error) {
            console.error("CRITICAL DATA SYNC ERROR:", error);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sync Failed';
            if (status) {
                status.style.color = "#ef4444";
                status.innerText = `❌ Save Failed! Error Details: ${error.message || error || "Unknown system intercept anomaly."}`;
            }
        }
    },

    add80CRow: (type = "", amount = "", isLocked = false, customClass = "") => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = (isLocked ? "row-80c-statutory " : "row-80c-manual ") + (customClass || "");
        row.style = "display: flex; gap: 10px; margin-bottom: 12px; align-items: center;";
        const options = ["ELSS Funds", "PPF", "Home Loan Principal", "SSY", "NSC", "Children Tuition Fee", "Fixed FD (5yr)", "Life Insurance"];
        
        let displayAmt = amount !== "" ? TaxController.formatIndianCurrency(amount.toString()) : "";

        row.innerHTML = `
            <select class="row-select-80c dynamic-input" style="flex: 2; ${isLocked ? 'background-color: #f3f4f6;' : ''}" ${isLocked ? 'disabled' : ''}>
                <option value="${type}" selected>${type || 'Select Investment'}</option>
                ${!isLocked ? options.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
            </select>
            <input type="text" inputmode="decimal" class="row-amount-80c dynamic-input" placeholder="Amount" value="${displayAmt}" style="flex: 1; text-align: right; ${isLocked ? 'background-color: #f3f4f6;' : ''}">
            ${isLocked ? '<i class="fas fa-lock" style="color:#9ca3af; width:30px; text-align:center;"></i>' : 
            `<button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none; width:30px;"><i class="fas fa-trash"></i></button>`}
        `;
        container.appendChild(row);
        
        TaxController.applyCurrencyFormattingListeners();
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    addPerkRow: (type = "", value = "") => {
        const container = document.getElementById('perks-rows-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 30px; gap: 10px; margin-bottom: 12px; align-items: center;";
        const perkOptions = ["Meal Coupons", "Corporate NPS", "Fuel Allowance", "LTA", "Professional Tax", "Mobile Reimbursement"];
        
        let displayVal = value !== "" ? TaxController.formatIndianCurrency(value.toString()) : "";

        row.innerHTML = `
            <select class="perk-type dynamic-input">
                <option value="" disabled ${!type ? 'selected' : ''}>Select Perk</option>
                ${perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <input type="text" inputmode="decimal" class="perk-amount dynamic-input" placeholder="Amt" value="${displayVal}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem;">₹ 0</div>
            <button type="button" onclick="this.parentElement.remove(); TaxController.calculateAll();" style="color:#ef4444; background:none; border:none;"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);

        TaxController.applyCurrencyFormattingListeners();
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    calculateAll: () => {
        if (!window.FinanceEngine || !window.TAX_CONFIG) return;
    
        const basic = TaxController.cleanNum(document.getElementById('basic-salary')?.value);
        const hraRec = TaxController.cleanNum(document.getElementById('hra-received')?.value);
        const rentPaid = TaxController.cleanNum(document.getElementById('rent-paid')?.value);
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
            homeLoanInterest = TaxController.cleanNum(document.getElementById('loan-interest')?.value);
            homeLoanPrincipal = TaxController.cleanNum(document.getElementById('loan-principal')?.value);
            const sanctionDateVal = document.getElementById('loan-sanction-date')?.value;
            const isFirstTimeBuyer = document.getElementById('is-first-buyer')?.checked; 
            const loanAmt = TaxController.cleanNum(document.getElementById('original-loan-amt')?.value); 
            const propVal = TaxController.cleanNum(document.getElementById('property-stamp-value')?.value); 

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

        // ISSUE 4 FIX: Outputs clean structural layout wrapper matching right-aligned column styles
        const display24b = document.getElementById('display-24b-value');
        if(display24b) {
            display24b.innerHTML = `
                <div class="section-24b-result-container">
                    <span class="section-24b-label">Section 24(b) - Interest on Home Loan</span>
                    <span class="section-24b-amount-display">₹ ${Math.round(eligible24b).toLocaleString('en-IN')}</span>
                </div>
            `;
        }

        // ISSUE 5 FIX: Notice checks if user has explicitly turned on home loan wrapper AND checked self-occupied status
        const warningBox = document.getElementById('hra-homeloan-warning');
        if (warningBox) {
            const hasHraInputs = (basic > 0 && hraRec > 0);
            if (hasHraInputs && hasLoan && isSelfOccupied) {
                warningBox.style.display = 'block';
            } else {
                warningBox.style.display = 'none';
            }
        }
    
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro);
        const hraDisplay = document.getElementById('display-hra-value');
        if (hraDisplay) {
            hraDisplay.innerText = `₹ ${Math.round(hraResult.actualExemption).toLocaleString('en-IN')}`;
        }
    
        const perkRows = document.querySelectorAll('.perk-row');
        const perksArr = Array.from(perkRows).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: TaxController.cleanNum(row.querySelector('.perk-amount').value),
            value: TaxController.cleanNum(row.querySelector('.perk-amount').value),
            element: row.querySelector('.perk-eligible')
        }));
    
        const otherIncome = TaxController.cleanNum(document.getElementById('other-income')?.value);
        const gross = basic + hraRec + otherIncome;
    
        const deductionsObj = {
            section80C: Array.from(document.querySelectorAll('.row-amount-80c')).reduce((s, e) => s + TaxController.cleanNum(e.value), 0),
            healthSelf: TaxController.cleanNum(document.getElementById('80d-self')?.value),
            healthParents: TaxController.cleanNum(document.getElementById('80d-parents')?.value),
            parentsSenior: document.getElementById('parents-senior')?.checked || false,
            npsExtra: TaxController.cleanNum(document.getElementById('nps-80ccd-1b')?.value),
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
        if (basic > 0 && !epfRow) {
            TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        } else if (epfRow) {
            epfRow.querySelector('.row-amount-80c').value = TaxController.formatIndianCurrency(epfAmt.toString());
        }
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
        const config = TAX_CONFIG[fy] || TAX_CONFIG["2026-27"];
        const oldStdDeduction = 50000;
        const newStdDeduction = config.stdDeduction !== undefined ? config.stdDeduction : 75000;

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
            setVal('summary-gross-salary', grossSalary || 0); 
            setVal('summary-gross-salary-new', grossSalary || 0);

            setVal('summary-taxable-old', oldRegDetails.netTaxable);
            setVal('summary-taxable-new', newRegDetails.netTaxable);

            setVal('summary-standard-deduction', oldStdDeduction);
            setVal('summary-standard-deduction-new', newStdDeduction);

            const applied80C = oldRegDetails.appliedDeductions?.section80C || 0;
            const applied80D = oldRegDetails.appliedDeductions?.section80D || 0;
            const applied24b = oldRegDetails.appliedDeductions?.homeInterest || 0;
            
            const rentPaid = TaxController.cleanNum(document.getElementById('rent-paid')?.value);
            const basic = TaxController.cleanNum(document.getElementById('basic-salary')?.value);
            const hraRec = TaxController.cleanNum(document.getElementById('hra-received')?.value);
            const isMetro = document.getElementById('is-metro')?.value === 'true';
            const calculatedHRA = window.FinanceEngine?.TaxEngine?.calculateExemptHRA(basic, hraRec, rentPaid, isMetro)?.actualExemption || 0;

            setVal('summary-80c-deduction', applied80C);
            setVal('summary-hra-deduction', calculatedHRA);
            setVal('summary-80d-deduction', applied80D);
            setVal('summary-24b-deduction', applied24b);

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

        try {
            const i = data.calculator_inputs || {};
            console.log("DEBUG: Standardizing mapping for data:", i);
            
            const setNumericValue = (id, value) => {
                const el = document.getElementById(id);
                if (el) {
                    const parsed = parseFloat(value);
                    el.value = isNaN(parsed) ? "" : TaxController.formatIndianCurrency(parsed.toString());
                }
            };

            setNumericValue('basic-salary', i.basic);
            setNumericValue('hra-received', i.hra);
            setNumericValue('rent-paid', i.rent);
            setNumericValue('other-income', i.otherIncome);
            
            if(document.getElementById('is-metro')) {
                document.getElementById('is-metro').value = (i.isMetro === 'true' || i.isMetro === true) ? "true" : "false";
            }
            
            if(document.getElementById('has-home-loan')) {
                document.getElementById('has-home-loan').checked = (parseFloat(i.homeInterest) > 0 || i.isUnderConstruction === true);
                TaxController.toggleLoanWizard(); 
            }
            setNumericValue('loan-interest', i.homeInterest);
            setNumericValue('loan-principal', i.loanPrincipal);
            setNumericValue('property-stamp-value', i.propertyValue);
            
            if(document.getElementById('loan-sanction-date')) {
                document.getElementById('loan-sanction-date').value = i.sanctionDate || "";
            }
            
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
            
            setNumericValue('80d-self', i.healthSelf);
            setNumericValue('80d-parents', i.healthParents);
            setNumericValue('nps-80ccd-1b', i.npsExtra);
            
            if(document.getElementById('parents-senior')) {
                document.getElementById('parents-senior').checked = !!i.parentsSenior;
            }

            const pContainer = document.getElementById('perks-rows-container');
            if (pContainer) {
                pContainer.innerHTML = "";
                if (i.perks && i.perks.length > 0) {
                    i.perks.forEach(p => TaxController.addPerkRow(p.type, parseFloat(p.value || p.amount) || 0));
                }
            }

            const cContainer = document.getElementById('80c-rows-container');
            if (cContainer) {
                cContainer.innerHTML = "";
                if (i.deductions80C && i.deductions80C.length > 0) {
                    i.deductions80C.forEach(inv => TaxController.add80CRow(inv.type, parseFloat(inv.amount) || 0));
                }
            }
        } catch (parseError) {
            console.error("CRITICAL ERROR: Failed parsing user data safely:", parseError);
        }
    }
};

// DYNAMIC INPUT/ERROR STYLE HOOKS - CLEAN IMPLEMENTATION
let errorStyle = document.getElementById('tax-calculator-error-styles');
if (!errorStyle) {
    errorStyle = document.createElement('style');
    errorStyle.id = 'tax-calculator-error-styles';
    errorStyle.innerHTML = `
        .input-error { border: 1px solid #ef4444 !important; background-color: #fef2f2 !important; }
        .perk-limit-warning { color: #f59e0b; font-size: 0.75rem; margin-top: 4px; display: none; }
    `;
    document.head.appendChild(errorStyle);
}

// BACKWARDS-COMPATIBLE UTILITY WRAPPERS
function validateInputs() {
    let isValid = true;
    document.querySelectorAll('.currency-mapped').forEach(input => {
        const val = TaxController.cleanNum(input.value);
        if (val < 0) {
            input.classList.add('input-error');
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });
    return isValid;
}

// GLOBAL BRIDGES
window.TaxController = TaxController;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;
window.handleSave = () => TaxController.handleSave();
window.toggleLoanWizard = TaxController.toggleLoanWizard;
window.scrollToResults = () => TaxController.scrollToResults();
window.validateInputs = validateInputs;


document.addEventListener('DOMContentLoaded', TaxController.init);
