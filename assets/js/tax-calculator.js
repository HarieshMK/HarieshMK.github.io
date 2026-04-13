/**
 * Controller for the Tax Calculator UI with Supabase Persistence
 * VERSION: 3.1 - Full Integration & Reactive UI
 */
const TaxController = {
    isDirty: false,

    init: async () => {
        console.log("Tax Controller 3.1 Initialized");

        // 1. Setup Lifecycle - Warn if unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) { e.preventDefault(); e.returnValue = ''; }
        });

        // 2. Global Input Listener - Reactive Calculation
        document.addEventListener('input', (e) => {
            if (e.target.matches('.dynamic-input, .perk-amount, .perk-type, .row-amount-80c, .row-select-80c')) {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        // 3. Load Data from Supabase
        await TaxController.loadUserData();

        // 4. Default State: If no perks exist, add Professional Tax
        const perksContainer = document.getElementById('perks-rows-container');
        if (perksContainer && perksContainer.children.length === 0) {
            TaxController.addPerkRow("Professional Tax", 2500);
        }
        
        // Final calculation sweep
        TaxController.calculateAll();
    },

    // --- ROW MANAGEMENT (UI) ---
    add80CRow: (type = "", amount = "", isLocked = false) => {
        const container = document.getElementById('80c-rows-container');
        const emptyMsg = document.getElementById('empty-80c-msg');
        if (emptyMsg) emptyMsg.style.display = 'none';

        const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const row = document.createElement('div');
        row.id = rowId;
        row.className = isLocked ? "row-80c-statutory" : "row-80c-manual";
        row.style = "display: flex; gap: 10px; margin-bottom: 12px; align-items: center;";

        const options = typeof InvestmentRegistry !== 'undefined' 
        ? Object.keys(InvestmentRegistry).filter(k => InvestmentRegistry[k].taxCategory === "80C")
        : ["ELSS Funds", "PPF", "Home Loan Principal", "SSY", "NSC", "Children Tuition Fee", "Fixed Deposit (5yr)", "Term Insurance Premium"];
        
        row.innerHTML = `
            <select class="row-select-80c dynamic-input" style="flex: 2;" ${isLocked ? 'disabled' : ''}>
                <option value="EPF" ${type === 'EPF' ? 'selected' : ''}>EPF (Statutory)</option>
                ${options.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <input type="number" class="row-amount-80c dynamic-input" placeholder="Amount" value="${amount}" 
                   style="flex: 1; text-align: right;" ${isLocked ? 'readonly' : ''}>
            ${isLocked ? '<div style="width:30px; text-align:center; color:var(--calc-text-muted); font-size:0.7rem;"><i class="fas fa-lock"></i></div>' : 
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
            <input type="text" class="perk-amount dynamic-input" placeholder="Amt or %" value="${value}" style="text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.75rem; font-weight: bold;">₹ 0</div>
            <button type="button" onclick="document.getElementById('${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        
        container.appendChild(row);
        TaxController.calculateAll();
    },

    // --- CALCULATION ENGINE ---
    calculateAll: () => {
        const basicInput = document.getElementById('basic-salary');
        const basicValue = parseFloat(basicInput.value) || 0;
        const container80c = document.getElementById('80c-rows-container');

        // 1. Reactive EPF Row Management
        let epfRow = container80c.querySelector('.row-80c-statutory');
        if (basicValue > 0) {
            const epfAmt = Math.round(basicValue * 0.12);
            if (!epfRow) {
                TaxController.add80CRow("EPF", epfAmt, true);
            } else {
                epfRow.querySelector('.row-amount-80c').value = epfAmt;
            }
        } else if (epfRow) {
            epfRow.remove();
        }

        // 2. Capture Data for Engine
        const inputs = {
            basic: basicValue,
            hra: parseFloat(document.getElementById('hra-received').value) || 0,
            rent: parseFloat(document.getElementById('rent-paid').value) || 0,
            isMetro: document.getElementById('is-metro').value === 'true',
            otherIncome: parseFloat(document.getElementById('other-income').value) || 0,
            homeInterest: parseFloat(document.getElementById('home-interest').value) || 0,
            isUnderConstruction: document.getElementById('is-under-construction').checked,
            healthSelf: parseFloat(document.getElementById('80d-self').value) || 0,
            healthParents: parseFloat(document.getElementById('80d-parents').value) || 0,
            parentsSenior: document.getElementById('parents-senior').checked,
            npsExtra: parseFloat(document.getElementById('nps-extra').value) || 0,
            perks: Array.from(document.querySelectorAll('.perk-row')).map(row => ({
                type: row.querySelector('.perk-type').value,
                value: row.querySelector('.perk-amount').value
            })).filter(p => p.type),
            deductions80C: Array.from(document.querySelectorAll('.row-amount-80c')).map(input => parseFloat(input.value) || 0)
        };

        const total80C = inputs.deductions80C.reduce((a, b) => a + b, 0);
        const selectedYear = document.getElementById('fy-selector').value;

        // 3. Process Perks UI & Data
        const perksData = inputs.perks.map((p, idx) => {
            let actualAmt = p.value.toString().includes('%') 
                ? (parseFloat(p.value.replace('%', '')) / 100) * inputs.basic 
                : parseFloat(p.value) || 0;
            
            const label = document.querySelectorAll('.perk-row')[idx].querySelector('.perk-eligible');
            if (p.type === "Corporate NPS") {
                const capOld = inputs.basic * 0.10;
                const capNew = inputs.basic * 0.14;
                label.innerHTML = `<div style="color:#94a3b8">Old: ₹${Math.round(Math.min(actualAmt, capOld))}</div><div style="color:#4ade80">New: ₹${Math.round(Math.min(actualAmt, capNew))}</div>`;
            } else {
                label.innerText = `₹ ${Math.round(actualAmt).toLocaleString('en-IN')}`;
            }
            return { type: p.type, amount: actualAmt };
        });

        // 4. Run Finance Engines
        if (!window.FinanceEngine) return;
        
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(inputs.basic, inputs.hra, inputs.rent, inputs.isMetro);
        const grossSalary = inputs.basic + inputs.hra + inputs.otherIncome;

        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, grossSalary, perksData, inputs.basic);
        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, grossSalary, {
            section80C: total80C,
            npsSelf: inputs.npsExtra,
            section80D: inputs.healthSelf + inputs.healthParents,
            parentsSenior: inputs.parentsSenior,
            homeLoanInterest: inputs.isUnderConstruction ? 0 : inputs.homeInterest,
            exemptHRA: hraResult.actualExemption
        }, perksData, inputs.basic);

        TaxController.updateSummary(newReg.tax, oldReg.tax, total80C);
    },

    updateSummary: (newTax, oldTax, total80C) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;

        const isNewBetter = newTax < oldTax;
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            recBox.innerHTML = `<strong>${isNewBetter ? 'New' : 'Old'} Regime</strong> is better. Save <strong>₹${Math.round(Math.abs(newTax - oldTax)).toLocaleString('en-IN')}</strong>`;
        }

        const counterEl = document.getElementById('display-80c-total');
        if (counterEl) {
            counterEl.innerText = `₹ ${Math.min(total80C, 150000).toLocaleString('en-IN')} / 1,50,000`;
            counterEl.style.color = total80C > 150000 ? "#fbbf24" : "#4ade80";
        }
    },

    // --- DB OPERATIONS ---
    saveUserData: async (year) => { // Accept year here
    const btn = document.getElementById('save-btn');
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            localStorage.setItem('tax_calc_draft', JSON.stringify(TaxController.captureInputs()));
            window.location.href = `/login/?return_to=${window.location.pathname}`;
            return;
        }
        // Use the passed year, or fallback to DOM if year is missing
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

    captureInputs: () => {
        // Simple capture for storage
        return {
            basic: document.getElementById('basic-salary').value,
            hra: document.getElementById('hra-received').value,
            rent: document.getElementById('rent-paid').value,
            isMetro: document.getElementById('is-metro').value,
            otherIncome: document.getElementById('other-income').value,
            homeInterest: document.getElementById('home-interest').value,
            isUnderConstruction: document.getElementById('is-under-construction').checked,
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
            document.getElementById('home-interest').value = inputs.homeInterest || "";
            document.getElementById('is-under-construction').checked = inputs.isUnderConstruction || false;
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

// --- GLOBAL BRIDGES (Ensures HTML Buttons Work) ---
function add80CRow() { TaxController.add80CRow(); }
function addPerkRow() { TaxController.addPerkRow(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData(year) { return await TaxController.saveUserData(year);}

window.onload = TaxController.init;
