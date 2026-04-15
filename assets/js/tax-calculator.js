/**
 * Controller for the Tax Calculator UI with Supabase Persistence
 * VERSION: 3.5 - Aligned with Home Loan Assistant IDs & Select Logic
 */

const TaxController = {
    isDirty: false,

    init: async () => {
        console.log("Tax Controller 3.5 Initialized");

        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) { e.preventDefault(); e.returnValue = ''; }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('.dynamic-input, .perk-amount, .perk-type, .row-amount-80c, .row-select-80c, .home-loan-input, #has-home-loan')) {
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

    // --- ROW MANAGEMENT (UI) ---
    add80CRow: (type = "", amount = "", isLocked = false, customClass = "") => {
        const container = document.getElementById('80c-rows-container');
        const emptyMsg = document.getElementById('empty-80c-msg');
        if (emptyMsg) emptyMsg.style.display = 'none';

        const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const row = document.createElement('div');
        row.id = rowId;
        row.className = (isLocked ? "row-80c-statutory " : "row-80c-manual ") + (customClass || "");
        row.style = "display: flex; gap: 10px; margin-bottom: 12px; align-items: center;";

        const options = ["ELSS Funds", "PPF", "Home Loan Principal", "SSY", "NSC", "Children Tuition Fee", "Fixed Deposit (5yr)", "Term Insurance Premium"];
        
        row.innerHTML = `
            <select class="row-select-80c dynamic-input" style="flex: 2; background-color: ${isLocked ? '#f3f4f6' : 'white'};" ${isLocked ? 'disabled' : ''}>
                <option value="${type}" selected>${type}</option>
                ${!isLocked ? options.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
            </select>
            <input type="number" class="row-amount-80c dynamic-input" placeholder="Amount" value="${amount}" 
                   style="flex: 1; text-align: right; background-color: ${isLocked ? '#f3f4f6' : 'white'}; font-weight: ${isLocked ? '600' : '400'};" ${isLocked ? 'readonly' : ''}>
            ${isLocked ? '<div style="width:30px; text-align:center; color:#9ca3af;"><i class="fas fa-lock" style="font-size:0.7rem;"></i></div>' : 
            `<button type="button" onclick="document.getElementById('${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer; width: 30px;"><i class="fas fa-trash"></i></button>`}
        `;
        
        if (isLocked) {
            if (customClass.includes('epf')) {
                container.prepend(row);
            } else {
                const epfRow = container.querySelector('.row-80c-statutory-epf');
                if (epfRow) epfRow.after(row);
                else container.prepend(row);
            }
        } else {
            container.appendChild(row);
        }

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
            <input type="text" class="perk-amount dynamic-input" placeholder="Amt or %" value="${value}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem; font-weight: bold;">₹ 0</div>
            <button type="button" onclick="document.getElementById('${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        
        container.appendChild(row);
        TaxController.calculateAll();
    },

    // --- CALCULATION ENGINE ---
    calculateAll: () => {
    const basicValue = parseFloat(document.getElementById('basic-salary').value) || 0;
    const container80c = document.getElementById('80c-rows-container');

    // --- 1. HOME LOAN STATE CHECK ---
    const hasHomeLoan = document.getElementById('has-home-loan')?.checked;
    const isUnderConstruction = document.getElementById('loan-possession')?.value === 'under-construction';
    const isCompleted = hasHomeLoan && !isUnderConstruction;

    // --- 2. STATUTORY 80C ROWS (EPF & Principal) ---
    // Handle EPF
    let epfRow = container80c.querySelector('.row-80c-statutory-epf');
    if (basicValue > 0) {
        const epfAmt = Math.round(basicValue * 0.12);
        if (!epfRow) TaxController.add80CRow("Employee PF", epfAmt, true, "row-80c-statutory-epf");
        else epfRow.querySelector('.row-amount-80c').value = epfAmt;
    } else if (epfRow) epfRow.remove();

    // Handle Home Loan Principal (Only if possession is completed)
    const principalInput = parseFloat(document.getElementById('home-principal')?.value) || 0;
    let principalRow = container80c.querySelector('.row-80c-statutory-principal');
    
    if (isCompleted && principalInput > 0) {
        if (!principalRow) TaxController.add80CRow("Home Loan Principal", principalInput, true, "row-80c-statutory-principal");
        else principalRow.querySelector('.row-amount-80c').value = principalInput;
    } else if (principalRow) {
        principalRow.remove();
    }

    // Handle Stamp Duty (Part of 80C)
    const stampDutyInput = parseFloat(document.getElementById('loan-stamp-duty')?.value) || 0;
    let stampRow = container80c.querySelector('.row-80c-statutory-stamp');
    if (isCompleted && stampDutyInput > 0) {
        if (!stampRow) TaxController.add80CRow("Stamp Duty", stampDutyInput, true, "row-80c-statutory-stamp");
        else stampRow.querySelector('.row-amount-80c').value = stampDutyInput;
    } else if (stampRow) stampRow.remove();

    // --- 3. CAPTURE INPUTS FOR ENGINE ---
    const inputs = {
        basic: basicValue,
        hra: parseFloat(document.getElementById('hra-received').value) || 0,
        rent: parseFloat(document.getElementById('rent-paid').value) || 0,
        isMetro: document.getElementById('is-metro').value === 'true',
        otherIncome: parseFloat(document.getElementById('other-income').value) || 0,
        
        // Home Loan Specifics
        hasHomeLoan: hasHomeLoan,
        isUnderConstruction: isUnderConstruction,
        homeInterest: isCompleted ? (parseFloat(document.getElementById('home-interest')?.value) || 0) : 0,
        homePrincipal: isCompleted ? principalInput : 0,
        extraLoanInterest: parseFloat(document.getElementById('extra-loan-amount')?.value) || 0, // For 80EEA
        occupancy: document.getElementById('loan-occupancy')?.value || 'self',
        
        healthSelf: parseFloat(document.getElementById('80d-self').value) || 0,
        healthParents: parseFloat(document.getElementById('80d-parents').value) || 0,
        parentsSenior: document.getElementById('parents-senior').checked,
        npsExtra: parseFloat(document.getElementById('nps-extra').value) || 0,
        
        perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
            rowRef: row,
            type: row.querySelector('.perk-type').value,
            value: row.querySelector('.perk-amount').value
        })).filter(p => p.type),
        deductions80C: Array.from(document.querySelectorAll('.row-amount-80c')).map(input => parseFloat(input.value) || 0)
    };

        if (!window.FinanceEngine) return;
        const selectedYear = document.getElementById('fy-selector').value;

        // 3. HRA Calculation
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(inputs.basic, inputs.hra, inputs.rent, inputs.isMetro);
        const hraDisplay = document.getElementById('hra-eligible-display');
        if (hraDisplay) {
            hraDisplay.innerText = `Eligible HRA: ₹${hraResult.actualExemption.toLocaleString('en-IN')}`;
        }

        // 4. Perks/NPS Logic
        const perksData = inputs.perks.map(p => {
            let rawValue = p.value.toString();
            let actualAmt = rawValue.includes('%') ? (parseFloat(rawValue.replace('%', '')) / 100) * inputs.basic : parseFloat(rawValue) || 0;
            
            let eligibleOld = 0;
            let eligibleNew = 0;

            if (p.type === "Corporate NPS") {
                eligibleOld = Math.min(actualAmt, inputs.basic * 0.10);
                eligibleNew = Math.min(actualAmt, inputs.basic * 0.14);
            } else {
                eligibleOld = actualAmt;
                eligibleNew = 0; 
            }
            
            const label = p.rowRef.querySelector('.perk-eligible');
            if (label) {
                if (p.type === "Corporate NPS") {
                    label.innerHTML = `Eligible:<br>Old (10%): ₹${Math.round(eligibleOld).toLocaleString('en-IN')}<br>New (14%): ₹${Math.round(eligibleNew).toLocaleString('en-IN')}`;
                    label.style.lineHeight = "1.2";
                } else {
                    label.innerText = `Eligible (Old): ₹${Math.round(eligibleOld).toLocaleString('en-IN')}`;
                }
            }
            return { type: p.type, amount: eligibleOld, amountNew: eligibleNew };
        });

        // 5. Final Tax Engine Calls
        const grossSalary = inputs.basic + inputs.hra + inputs.otherIncome;
        
        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, grossSalary, {
            ...inputs,
            section80C: inputs.deductions80C.reduce((a, b) => a + b, 0),
            npsSelf: inputs.npsExtra,
            section80D: inputs.healthSelf + inputs.healthParents,
            homeLoanInterest: inputs.isUnderConstruction ? 0 : inputs.homeInterest,
            exemptHRA: hraResult.actualExemption
        }, perksData, inputs.basic);

        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, grossSalary, perksData, inputs, inputs.basic);

        // 6. UI Updates
        TaxController.updateSummary(newReg.tax, oldReg.tax, inputs.deductions80C.reduce((a, b) => a + b, 0));
        TaxController.updateDeductionDisplay(oldReg.appliedDeductions || {});
        const hraWarning = document.getElementById('hra-loan-conflict-warning');
        if (hraWarning) {
            const isClaimingHRA = inputs.rent > 0;
            const isClaimingSelfOccupied = isCompleted && inputs.occupancy === 'self';
            hraWarning.style.display = (isClaimingHRA && isClaimingSelfOccupied) ? 'block' : 'none';
        }
    },
    
    updateSummary: (newTax, oldTax, total80CCombined) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;

        const isNewBetter = newTax < oldTax;
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            recBox.innerHTML = `<strong>${isNewBetter ? 'New' : 'Old'} Regime</strong> is better. Save <strong>₹${Math.round(Math.abs(newTax - oldTax)).toLocaleString('en-IN')}</strong>`;
        }

        const counterEl = document.getElementById('display-80c-total');
        if (counterEl) {
            counterEl.innerText = `₹ ${Math.min(total80CCombined, 150000).toLocaleString('en-IN')} / 1,50,000`;
            counterEl.style.color = total80CCombined > 150000 ? "#fbbf24" : "#4ade80";
        }
    },

    updateDeductionDisplay: (applied) => {
        const displayArea = document.getElementById('extra-deductions-info');
        if (!displayArea) return;

        let html = '';
        if (applied.homeInterestSection24 > 0) {
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Section 24(b) (Home Interest):</span>
                        <span style="color:#4ade80;">- ₹${applied.homeInterestSection24.toLocaleString('en-IN')}</span>
                     </div>`;
        }
        if (applied.homeInterest80EEA > 0) {
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Section 80EEA (Additional Interest):</span>
                        <span style="color:#4ade80;">- ₹${applied.homeInterest80EEA.toLocaleString('en-IN')}</span>
                     </div>`;
        }

        displayArea.innerHTML = html;
        displayArea.style.display = html ? 'block' : 'none';
    },

    captureInputs: () => {
        return {
            basic: document.getElementById('basic-salary').value,
            hra: document.getElementById('hra-received').value,
            rent: document.getElementById('rent-paid').value,
            isMetro: document.getElementById('is-metro').value,
            otherIncome: document.getElementById('other-income').value,
            hasHomeLoan: document.getElementById('has-home-loan')?.checked,
            possessionStatus: document.getElementById('loan-possession')?.value,
            homePrincipal: document.getElementById('home-principal')?.value,
            homeInterest: document.getElementById('home-interest')?.value,
            stampDuty: document.getElementById('loan-stamp-duty')?.value,
            loanSanctionDate: document.getElementById('loan-sanction-date')?.value,
            propertyStampValue: document.getElementById('property-stamp-value')?.value,
            propertyOccupancy: document.getElementById('loan-occupancy')?.value,
            extraLoanInterest: document.getElementById('extra-loan-amount')?.value,
            isUnderConstruction: document.getElementById('loan-possession')?.value === 'under-construction',
            firstTimeBuyer: document.getElementById('first-time-buyer')?.checked,
            healthSelf: document.getElementById('80d-self').value,
            healthParents: document.getElementById('80d-parents').value,
            parentsSenior: document.getElementById('parents-senior').checked,
            npsExtra: document.getElementById('nps-extra').value,
            perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
                type: row.querySelector('.perk-type').value,
                value: row.querySelector('.perk-amount').value
            })),
            deductions80C: Array.from(document.querySelectorAll('.row-80c-manual')).map(row => ({
                type: row.querySelector('.row-select-80c').value,
                amount: row.querySelector('.row-amount-80c').value
            }))
        };
    },

    saveUserData: async (year) => {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            if (!session) {
                localStorage.setItem('tax_calc_draft', JSON.stringify(TaxController.captureInputs()));
                window.location.href = `/login/?return_to=${window.location.pathname}`;
                return;
            }
            const selectedYear = year || document.getElementById('fy-selector').value; 
            
            const { error } = await supabase.from('tax_user_data').upsert({ 
                id: session.user.id, 
                financial_year: selectedYear, 
                calculator_inputs: TaxController.captureInputs(), 
                updated_at: new Date() 
            }, { onConflict: 'id, financial_year' });
            
            if (error) throw error;
            TaxController.isDirty = false;
        } catch (err) {
            console.error("Save failed:", err);
            throw err;
        }
    },

    loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const selectedYear = document.getElementById('fy-selector').value;
        const { data } = await supabase.from('tax_user_data').select('calculator_inputs').eq('id', user.id).eq('financial_year', selectedYear).maybeSingle();
        
        if (data?.calculator_inputs) {
            const inputs = data.calculator_inputs;
            document.getElementById('basic-salary').value = inputs.basic || "";
            document.getElementById('hra-received').value = inputs.hra || "";
            document.getElementById('rent-paid').value = inputs.rent || "";
            document.getElementById('is-metro').value = inputs.isMetro || "false";
            document.getElementById('other-income').value = inputs.otherIncome || "";
            
           // --- CLEANED HOME LOAN UI BLOCK ---
            if (document.getElementById('has-home-loan')) {
                const hasLoan = inputs.hasHomeLoan || false;
                document.getElementById('has-home-loan').checked = hasLoan;
                document.getElementById('home-loan-wizard').style.display = hasLoan ? 'block' : 'none';
            }
            
            // Helper to set values only if the element exists
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || "";
            };
            
            setVal('home-principal', inputs.homePrincipal);
            setVal('home-interest', inputs.homeInterest);
            setVal('loan-stamp-duty', inputs.stampDuty);
            setVal('loan-sanction-date', inputs.loanSanctionDate);
            setVal('property-stamp-value', inputs.propertyStampValue);
            setVal('extra-loan-amount', inputs.extraLoanInterest); // Aligned with captureInputs
            
            if (document.getElementById('loan-occupancy')) 
                document.getElementById('loan-occupancy').value = inputs.propertyOccupancy || "self-occupied";
            
            if (document.getElementById('loan-possession')) {
                // Priority: 1. possessionStatus string, 2. boolean fallback, 3. default
                document.getElementById('loan-possession').value = inputs.possessionStatus || 
                    (inputs.isUnderConstruction ? 'under-construction' : 'ready-to-move');
                
                // Refresh the UI to hide/show specific fields based on the loaded state
                if (typeof updateLoanUI === 'function') updateLoanUI(); 
            }
            
            if (document.getElementById('first-time-buyer')) 
                document.getElementById('first-time-buyer').checked = inputs.firstTimeBuyer || false;

            
            document.getElementById('80d-self').value = inputs.healthSelf || "";
            document.getElementById('80d-parents').value = inputs.healthParents || "";
            document.getElementById('parents-senior').checked = inputs.parentsSenior || false;
            document.getElementById('nps-extra').value = inputs.npsExtra || "";

            const perksContainer = document.getElementById('perks-rows-container');
            const rows80c = document.getElementById('80c-rows-container');
            perksContainer.innerHTML = '';
            rows80c.innerHTML = '';

            if (inputs.perks) inputs.perks.forEach(p => TaxController.addPerkRow(p.type, p.value));
            if (inputs.deductions80C) inputs.deductions80C.forEach(d => TaxController.add80CRow(d.type, d.amount));
        }
    }
};

// Global helpers
function add80CRow() { TaxController.add80CRow(); }
function addPerkRow() { TaxController.addPerkRow(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData(year) { return await TaxController.saveUserData(year);}

window.onload = TaxController.init;
