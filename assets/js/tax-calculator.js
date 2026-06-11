const TaxController = {
    isDirty: false,
    isInitialLoading: true,

    init: async () => {
        if (!window.FinanceEngine || !window.TAX_CONFIG) { 
            console.warn("Tax engines missing. Retrying initialization context..."); 
            const retryInterval = setInterval(async () => {
                if (window.FinanceEngine && window.TAX_CONFIG) {
                    clearInterval(retryInterval);
                    await TaxController.init();
                }
            }, 100);
            return; 
        }

        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) { 
                const message = "Your data is unsaved. Are you sure you want to leave?"; 
                e.returnValue = message; 
                return message; 
            }
        });

        const handleInteraction = (e) => {
            TaxController.handleDelegatedInput(e);

            if (e.target.matches('input, select, .dynamic-input') || e.target.type === 'checkbox' || e.target.type === 'radio') {
                TaxController.isDirty = true;

                // Safely hand over presentation-state changes to the window UI object if ready
                if (e.target.name === 'possession' && window.TaxUI) {
                    window.TaxUI.handleLoanStatusChange();
                }

                const row = e.target.closest('.perk-row');
                if (row) { 
                    const perkSelect = row.querySelector('select'); 
                    if (perkSelect && window.TaxUI) { 
                        window.TaxUI.handlePerkUIFeedback(e.target, perkSelect.value); 
                    } 
                }
                TaxController.calculateAll();
            }
        };

        document.addEventListener('input', handleInteraction);
        document.addEventListener('change', handleInteraction);

        // BIND CLICK BUTTONS VIA EVENT DELEGATION
        document.addEventListener('click', (e) => {
            // Check if the clicked element is the Add 80C Button
            if (e.target.closest('#add-80c-btn') || e.target.id === 'add-80c-btn') {
                e.preventDefault();
                TaxController.add80CRow();
            }
            // Check if the clicked element is the Add Perk Button
            if (e.target.closest('#add-perk-btn') || e.target.id === 'add-perk-btn') {
                e.preventDefault();
                TaxController.addPerkRow();
            }
        });

        const appFySelector = document.getElementById('fy-selector');
        if (appFySelector) {
            appFySelector.addEventListener('change', async () => {
                TaxController.isInitialLoading = true;
                await TaxController.loadUserData();
                TaxController.isInitialLoading = false;
                TaxController.calculateAll();
                setTimeout(() => { TaxController.isDirty = false; }, 200);
            });
        }

        await TaxController.loadUserData();
        TaxController.isInitialLoading = false;
        TaxController.calculateAll();
        setTimeout(() => { TaxController.isDirty = false; }, 500);
    },

    cleanNum: (val) => window.FinanceEngine.Formatters.cleanNum(val),
    formatIndianCurrency: (valString) => window.FinanceEngine.Formatters.formatIndianCurrency(valString),

    handleDelegatedInput: (e) => {
        const target = e.target;
        if (target.matches('#basic-salary, #hra-received, #rent-paid, #other-income, #loan-interest, #loan-principal, [id="80d-self"], [id="80d-parents"], #nps-80ccd-1b, #original-loan-amt, #property-stamp-value, .perk-amount, .row-amount-80c')) {
            if (target.tagName === 'INPUT' && !target.classList.contains('currency-mapped')) {
                target.classList.add('currency-mapped');
                target.setAttribute('type', 'text');
                target.setAttribute('inputmode', 'decimal');
            }
            const maskResult = window.FinanceEngine.Formatters.applyCurrencyMask(target.value, target.selectionStart);
            target.value = maskResult.formattedValue;
            target.setSelectionRange(maskResult.newCursorPosition, maskResult.newCursorPosition);
        }
    },

    syncPrincipalTo80C: (amount) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        let principalRow = container.querySelector('.row-80c-statutory-hl-principal');
        if (amount > 0) {
            if (!principalRow) { TaxController.add80CRow("Home Loan Principal", amount, true, "row-80c-statutory-hl-principal"); } else {
                const targetInput = principalRow.querySelector('.row-amount-80c');
                if (targetInput) { targetInput.value = TaxController.formatIndianCurrency(amount.toString()); }
            }
        } else if (principalRow) { principalRow.remove(); }
    },

    handleSave: async () => {
        if (typeof window.validateInputs === 'function' && !window.validateInputs()) {
            const status = document.getElementById('save-status');
            if (status) {
                status.style.color = "#ef4444";
                status.innerText = "❌ Cannot sync profiles containing invalid or negative figures.";
            }
            return;
        }
    
        const btn = document.getElementById('save-btn');
        const status = document.getElementById('save-status');
        const selectedYear = document.getElementById('fy-selector')?.value || '2026-27';
        if (status) status.innerText = "";
        try {
            if (!window.supabase) { throw new Error("Supabase Database connection client could not be detected."); }
            const { data: authRecord } = await supabase.auth.getUser();
            const user = authRecord?.user;
            if (!user) { const firstChoice = confirm("We need a free account to secure this progress. Click 'OK' to login!"); if (firstChoice) { window.location.href = "https://harieshmk.github.io/login/"; } return; }
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            if (typeof window.saveTaxData !== 'function') { throw new Error("Backend coordinator missing."); }
            const structuredPayload = {
                financial_year: selectedYear,
                calculator_inputs: {
                    basic: TaxController.cleanNum(document.getElementById('basic-salary')?.value),
                    hra: TaxController.cleanNum(document.getElementById('hra-received')?.value),
                    rent: TaxController.cleanNum(document.getElementById('rent-paid')?.value),
                    otherIncome: TaxController.cleanNum(document.getElementById('other-income')?.value),
                    isMetro: document.getElementById('is-metro')?.value === 'true',
                    homeInterest: TaxController.cleanNum(document.getElementById('loan-interest')?.value),
                    loanPrincipal: TaxController.cleanNum(document.getElementById('loan-principal')?.value),
                    propertyValue: TaxController.cleanNum(document.getElementById('property-stamp-value')?.value),
                    sanctionDate: document.getElementById('loan-sanction-date')?.value || "",
                    isUnderConstruction: document.querySelector('input[name="possession"]:checked')?.value === 'under-construction',
                    occupancy: document.querySelector('input[name="occupancy"]:checked')?.value || 'self',
                    healthSelf: TaxController.cleanNum(document.getElementById('80d-self')?.value),
                    healthParents: TaxController.cleanNum(document.getElementById('80d-parents')?.value),
                    npsExtra: TaxController.cleanNum(document.getElementById('nps-80ccd-1b')?.value),
                    parentsSenior: document.getElementById('parents-senior')?.checked || false,
                    perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
                        type: row.querySelector('.perk-type').value,
                        amount: TaxController.cleanNum(row.querySelector('.perk-amount').value)
                    })),
                    deductions80C: Array.from(document.querySelectorAll('[id="80c-rows-container"] > div'))
                        .filter(row => row.classList.contains('row-80c-manual'))
                        .map(row => {
                            const typeEl = row.querySelector('.row-select-80c');
                            const amtEl = row.querySelector('.row-amount-80c');
                            return { type: typeEl ? typeEl.value : "Investment", amount: amtEl ? TaxController.cleanNum(amtEl.value) : 0 };
                        }),
                }
            };
            const response = await window.saveTaxData(structuredPayload);
            if (response?.error) throw new Error(response.error);
            TaxController.isDirty = false;
            btn.innerHTML = `<i class="fas fa-check-circle"></i> Profile Synced!`;
            if (status) { status.style.color = "#22c55e"; status.innerText = `🎉 Success! Your data for FY ${selectedYear} is saved securely.`; }
            setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Profile'; }, 4000);
        } catch (error) {
            console.error("💥 CRITICAL ERROR CAPTURED INSIDE handleSave:", error);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sync Failed';
            if (status) { status.style.color = "#ef4444"; status.innerText = `❌ Save Failed: ${error.message || error}`; }
        }
    },

    add80CRow: (type = "", amount = "", isLocked = false, customClass = "") => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        if (isLocked && type) {
            const existingRows = container.querySelectorAll('.row-80c-statutory select');
            for (let sel of existingRows) {
                if (sel.value === type) {
                    const amtInput = sel.parentElement.querySelector('.row-amount-80c');
                    if (amtInput) { amtInput.value = amount !== "" ? TaxController.formatIndianCurrency(amount.toString()) : ""; }
                    if (!TaxController.isInitialLoading) TaxController.calculateAll(); return;
                }
            }
        }
        const row = document.createElement('div');
        row.className = (isLocked ? "row-80c-statutory " : "row-80c-manual ") + (customClass || "");
        row.style = "display: flex; gap: 10px; margin-bottom: 12px; align-items: center;";
        const options = ["ELSS", "PPF", "VPF", "Home Loan Principal", "SSY", "NSC", "Children Tuition Fees", "5-Year Tax FD", "LIC plan"];
        let displayAmt = amount !== "" ? TaxController.formatIndianCurrency(amount.toString()) : "";
        row.innerHTML = `
            <select class="row-select-80c dynamic-input" style="flex: 2; background-color: #0f172a; color: #f8fafc; border: 1.5px solid #334155; ${isLocked ? 'background-color: #1e293b;' : ''}" ${isLocked ? 'disabled' : ''}>
                ${isLocked ? `<option value="${type}" selected style="background-color: #1e293b; color: #f8fafc;">${type}</option>` : `
                <option value="" disabled ${!type ? 'selected' : ''} style="background-color: #1e293b; color: #f8fafc;">Select Investment</option>
                ${options.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''} style="background-color: #1e293b; color: #f8fafc;">${opt}</option>`).join('')}`}
            </select>
            <input type="text" inputmode="decimal" class="row-amount-80c currency-mapped dynamic-input" placeholder="Amount" value="${displayAmt}" style="flex: 1; text-align: right; background-color: #0f172a; color: #f8fafc; border: 1.5px solid #334155; ${isLocked ? 'background-color: #1e293b;' : ''}">
            ${isLocked ? '<i class="fas fa-lock" style="color:#9ca3af; width:30px; text-align:center;"></i>' :
            `<button type="button" onclick="this.parentElement.remove(); window.TaxController.calculateAll();" style="color:#ef4444; background:none; border:none; width:30px;"><i class="fas fa-trash"></i></button>`}`;
        container.appendChild(row);
        if (window.initCustomDropdowns) window.initCustomDropdowns();
        if (!TaxController.isInitialLoading) TaxController.calculateAll();
    },

    addPerkRow: (type = "", value = "") => {
        const container = document.getElementById('perks-rows-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 30px; gap: 10px; margin-bottom: 12px; align-items: center;";
        const perkOptions = ["Meal Coupons", "Corporate NPS", "Fuel Allowance", "LTA", "Professional Tax", "Mobile Reimbursement"];
        let displayVal = (value !== "" && value !== undefined && value !== null) ? TaxController.formatIndianCurrency(value.toString()) : "";
        row.innerHTML = `
            <select class="perk-type dynamic-input" style="background-color: #0f172a; color: #f8fafc; border: 1.5px solid #334155;">
                <option value="" disabled ${!type ? 'selected' : ''} style="background-color: #1e293b; color: #f8fafc;">Select Perk</option>
                ${perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''} style="background-color: #1e293b; color: #f8fafc;">${opt}</option>`).join('')}
            </select>
            <input type="text" inputmode="decimal" class="perk-amount currency-mapped dynamic-input" placeholder="Amt" value="${displayVal}" style="text-align: right; background-color: #0f172a; color: #f8fafc; border: 1.5px solid #334155;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem;">₹ 0</div>
            <button type="button" onclick="this.parentElement.remove(); window.TaxController.calculateAll();" style="color:#ef4444; background:none; border:none;"><i class="fas fa-trash"></i></button>`;
        container.appendChild(row);
        if (window.initCustomDropdowns) window.initCustomDropdowns();
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

        // Route date evaluation to UI layer
        if (window.TaxUI) { window.TaxUI.handleDateBranching(); }

        if (hasLoan) {
            homeLoanInterest = TaxController.cleanNum(document.getElementById('loan-interest')?.value);
            homeLoanPrincipal = TaxController.cleanNum(document.getElementById('loan-principal')?.value);
            const loanResult = FinanceEngine.TaxRules.getLoanTaxBenefits(
                document.getElementById('loan-sanction-date')?.value,
                TaxController.cleanNum(document.getElementById('property-stamp-value')?.value),
                TaxController.cleanNum(document.getElementById('original-loan-amt')?.value),
                homeLoanInterest, isSelfOccupied);
            dExtra = loanResult.dExtra;
            extraSection = loanResult.extraSection;
            eligible24b = isSelfOccupied ? Math.min(homeLoanInterest, 200000) : homeLoanInterest;
        }
        TaxController.syncPrincipalTo80C(hasLoan ? homeLoanPrincipal : 0);
        const cardEEA = document.getElementById('card-80eea');
        const cardEE = document.getElementById('card-80ee');
        if (cardEEA) cardEEA.style.display = (extraSection === 'card-80eea') ? 'block' : 'none';
        if (cardEE) cardEE.style.display = (extraSection === 'card-80ee') ? 'block' : 'none';
        if (extraSection) {
            let displayId = (extraSection === 'card-80eea') ? 'display-80eea-value' : 'display-80ee-value';
            const displayEl = document.getElementById(displayId);
            if (displayEl) { displayEl.innerHTML = `<div class="section-24b-result-container"><span class="section-24b-amount-display">₹ ${Math.round(dExtra).toLocaleString('en-IN')}</span></div>`; }
        }
        const display24b = document.getElementById('display-24b-value');
        if (display24b) { display24b.innerHTML = `<div class="section-24b-result-container"><span class="section-24b-amount-display">₹ ${Math.round(eligible24b).toLocaleString('en-IN')}</span></div>`; }
        const hraResult = window.FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraRec, rentPaid, isMetro) || { actualExemption: 0 };
        const hraDisplay = document.getElementById('display-hra-value');
        if (hraDisplay) hraDisplay.innerText = `₹ ${Math.round(hraResult.actualExemption).toLocaleString('en-IN')}`;
        const perkRows = document.querySelectorAll('.perk-row');
        const rawPerks = Array.from(perkRows).map(row => ({
            type: row.querySelector('.perk-type').value,
            amount: TaxController.cleanNum(row.querySelector('.perk-amount').value),
            element: row.querySelector('.perk-eligible')
        }));
        const processedPerks = FinanceEngine.TaxEngine.processPerks(rawPerks, basic, fy);
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
        if (total80CDisplay) { const total80C = Math.min(deductionsObj.section80C, 150000); total80CDisplay.innerText = `₹ ${total80C.toLocaleString('en-IN')}`; }
        try {
            const oldReg = window.FinanceEngine.TaxEngine.calculateOldRegime(fy, gross, deductionsObj, processedPerks, basic);
            const newReg = window.FinanceEngine.TaxEngine.calculateNewRegime(fy, gross, processedPerks, deductionsObj, basic);
            processedPerks.forEach((p, index) => { const eligibleVal = p.eligibleNew; if (rawPerks[index]?.element) { rawPerks[index].element.innerText = `₹ ${Number(eligibleVal).toLocaleString('en-IN')}`; } });
            TaxController.updateSummaryUI(newReg.tax, oldReg.tax, oldReg, newReg, gross);
            
            // Invoke display updates globally across layout layers
            if (window.TaxUI) {
                window.TaxUI.updateRegimeHighlights();
                window.TaxUI.checkHraLoanWarning();
            }
        } catch (err) { console.error("Calculation Engine Error:", err); }
    },

    manageStatutoryRows: (basic) => {
        const container = document.getElementById('80c-rows-container');
        if (!container) return;
        let epfRow = container.querySelector('.row-80c-statutory-epf');
        const epfAmt = Math.round(basic * 0.12);
        if (basic > 0 && !epfRow) { TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf"); } else if (epfRow) {
            const targetInput = epfRow.querySelector('.row-amount-80c');
            if (targetInput) targetInput.value = TaxController.formatIndianCurrency(epfAmt.toString());
        }
    },

    updateSummaryUI: (newTax, oldTax, oldRegDetails, newRegDetails, grossSalary) => {
        let finalOldTax = oldTax;
        if (oldTax === 0 && oldRegDetails?.netTaxable > 500000) {
            const taxable = oldRegDetails.netTaxable;
            let baseTax = 0;
            if (taxable > 250000) baseTax += (Math.min(taxable, 500000) - 250000) * 0.05;
            if (taxable > 500000) baseTax += (Math.min(taxable, 1000000) - 500000) * 0.20;
            if (taxable > 1000000) baseTax += (taxable - 1000000) * 0.30;
            finalOldTax = baseTax * 1.04;
        }
        const fy = document.getElementById('fy-selector')?.value || '2026-27';
        const config = window.TAX_CONFIG[fy] || window.TAX_CONFIG["2026-27"];
        const oldStdDeduction = 50000;
        const newStdDeduction = config?.stdDeduction !== undefined ? config.stdDeduction : 75000;
        const nEl = document.getElementById('new-regime-tax');
        const oEl = document.getElementById('old-regime-tax');
        if (nEl) nEl.innerText = `₹ ${Math.round(newTax || 0).toLocaleString('en-IN')}`;
        if (oEl) oEl.innerText = `₹ ${Math.round(finalOldTax || 0).toLocaleString('en-IN')}`;
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) { const safeVal = isNaN(val) || val === undefined || val === null ? 0 : val; el.innerText = `₹ ${Math.round(safeVal).toLocaleString('en-IN')}`; }
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
        const pContainer = document.getElementById('perks-rows-container');
        const cContainer = document.getElementById('80c-rows-container');
        if (pContainer) pContainer.innerHTML = "";
        if (cContainer) cContainer.innerHTML = "";
        const inputIdsToClear = ['basic-salary', 'hra-received', 'rent-paid', 'other-income', 'loan-interest', 'loan-principal', '80d-self', '80d-parents', 'nps-80ccd-1b'];
        inputIdsToClear.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
        if (!window.supabase) { TaxController.addPerkRow("Professional Tax", 2500); TaxController.add80CRow(); return; }
        const { data: authRecord, error: authError } = await supabase.auth.getUser();
        const user = authRecord?.user;
        if (authError || !user) { TaxController.addPerkRow("Professional Tax", 2500); TaxController.add80CRow(); return; }
        const fySelector = document.getElementById('fy-selector');
        const fy = fySelector ? fySelector.value : '2026-27';
        const { data, error } = await supabase.from('tax_user_data').select('calculator_inputs').eq('user_id', user.id).eq('financial_year', fy).maybeSingle();
        if (error || !data || !data.calculator_inputs) { TaxController.addPerkRow("Professional Tax", 2500); TaxController.add80CRow(); return; }
        try {
            const i = data.calculator_inputs || {};
            const setNumericValue = (id, value) => { 
                const el = document.getElementById(id); 
                if (el) { const parsed = TaxController.cleanNum(value); el.value = parsed === 0 ? "" : TaxController.formatIndianCurrency(parsed.toString()); } 
            };
            setNumericValue('basic-salary', i.basic); setNumericValue('hra-received', i.hra); setNumericValue('rent-paid', i.rent); setNumericValue('other-income', i.otherIncome);
            if (document.getElementById('is-metro')) { document.getElementById('is-metro').value = (i.isMetro === 'true' || i.isMetro === true) ? "true" : "false"; }
            if (document.getElementById('has-home-loan')) { document.getElementById('has-home-loan').checked = (parseFloat(i.homeInterest) > 0 || i.isUnderConstruction === true); if (window.TaxUI) window.TaxUI.toggleLoanWizard(); }
            setNumericValue('loan-interest', i.homeInterest); setNumericValue('loan-principal', i.loanPrincipal); setNumericValue('property-stamp-value', i.propertyValue);
            if (document.getElementById('loan-sanction-date')) { document.getElementById('loan-sanction-date').value = i.sanctionDate || ""; }
            if (i.isUnderConstruction !== undefined) { const radio = document.querySelector(`input[name="possession"][value="${i.isUnderConstruction ? 'under-construction' : 'completed'}"]`); if (radio) { radio.checked = true; if (window.TaxUI) window.TaxUI.handleLoanStatusChange(); } }
            if (i.occupancy) { const occRadio = document.querySelector(`input[name="occupancy"][value="${i.occupancy}"]`); if (occRadio) occRadio.checked = true; }
            setNumericValue('80d-self', i.healthSelf); setNumericValue('80d-parents', i.healthParents); setNumericValue('nps-80ccd-1b', i.npsExtra);
            if (document.getElementById('parents-senior')) { document.getElementById('parents-senior').checked = !!i.parentsSenior; }
            if (pContainer) { if (i.perks && i.perks.length > 0) { i.perks.forEach(p => { const cleanVal = parseFloat(p.amount || p.value) || 0; TaxController.addPerkRow(p.type, cleanVal); }); } else { TaxController.addPerkRow("Professional Tax", 2500); } }
            if (cContainer) { if (i.deductions80C && i.deductions80C.length > 0) { i.deductions80C.forEach(inv => { if (inv.type === "Employee PF" || inv.type === "Home Loan Principal") return; const cleanInv = Math.round(parseFloat(inv.amount)) || 0; TaxController.add80CRow(inv.type, cleanInv); }); } else { TaxController.add80CRow(); } }
            setTimeout(() => { TaxController.calculateAll(); }, 50);
        } catch (parseError) { console.error("CRITICAL ERROR: Failed parsing user data:", parseError); }
    }
};

window.TaxController = TaxController;
window.add80CRow = TaxController.add80CRow;
window.addPerkRow = TaxController.addPerkRow;
window.calculateAll = TaxController.calculateAll;
window.handleSave = () => TaxController.handleSave();

document.addEventListener('DOMContentLoaded', TaxController.init);
