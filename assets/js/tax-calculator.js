/**
 * Controller for the Tax Calculator UI with Supabase Persistence
 * VERSION: 2.2 - Filtered Database Loading & Reactive Deletion
 */
const TaxController = {
    isDirty: false,

    init: async () => { 
        console.log("Tax Controller Initialized"); 
        
        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        });

        document.addEventListener('input', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'SELECT') {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        await TaxController.loadUserData();

        const savedDraft = localStorage.getItem('tax_calc_draft');
        if (savedDraft) {
            const inputs = JSON.parse(savedDraft);
            TaxController.fillForm(inputs); 
            localStorage.removeItem('tax_calc_draft');
            setTimeout(() => { TaxController.calculateAll(); }, 200);
        }

        const perksContainer = document.getElementById('perks-rows-container');
        if (perksContainer && perksContainer.children.length === 0) {
            TaxController.addPerkRowWithData("Professional Tax", 2500);
        }
        
        const { data: { session } } = await window.supabase.auth.getSession();
        const saveBtn = document.getElementById('btn-save-tax');
        if (saveBtn) {
            saveBtn.innerText = session ? "Save to Profile" : "Login to Save Progress";
        }
    },

    captureInputs: () => {
        const formData = {
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
            perks: [],
            deductions80C: []
        };
        document.querySelectorAll('[id^="row-"]').forEach(row => {
            const type = row.querySelector('.row-select-80c')?.value;
            const amt = row.querySelector('.row-amount-80c')?.value;
            const isAutoEPF = row.getAttribute('data-is-epf') === 'true';
            
            if (type && !isAutoEPF) { 
                formData.deductions80C.push({ type: type, amount: amt });
            }
        });
        
        document.querySelectorAll('.perk-row').forEach(row => {
            const type = row.querySelector('.perk-type')?.value;
            const val = row.querySelector('.perk-amount')?.value;
            if (type) formData.perks.push({ type: type, value: val });
        });
        
        return formData;
    },

    saveUserData: async () => {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            if (!session) {
                const formData = TaxController.captureInputs();
                localStorage.setItem('tax_calc_draft', JSON.stringify(formData));
                window.location.href = `/login/?return_to=${window.location.pathname}`;
                return false; 
            }
            const user = session.user;
            const selectedYear = document.getElementById('fy-selector').value;
            const formData = TaxController.captureInputs();
            const { error } = await supabase.from('tax_user_data').upsert({ 
                id: user.id, 
                financial_year: selectedYear, 
                calculator_inputs: formData, 
                updated_at: new Date() 
            }, { onConflict: 'id, financial_year' }); 
            if (error) throw error;
            TaxController.isDirty = false;
            alert("Data saved successfully!");
            return true;
        } catch (err) {
            console.error("Save failed:", err);
            alert("Save failed.");
            throw err;
        }
    },

    loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const selectedYear = document.getElementById('fy-selector').value;
        const { data } = await supabase.from('tax_user_data').select('calculator_inputs').eq('id', user.id).eq('financial_year', selectedYear).maybeSingle(); 
        if (data?.calculator_inputs) TaxController.fillForm(data.calculator_inputs);
    },

    fillForm: (inputs) => {
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
        if (perksContainer) perksContainer.innerHTML = '';
        if (inputs.perks) inputs.perks.forEach(p => TaxController.addPerkRowWithData(p.type, p.value));

        const rows80c = document.getElementById('80c-rows-container');
        if (rows80c) rows80c.innerHTML = '';
        if (inputs.deductions80C) {
            inputs.deductions80C.forEach(item => {
                if (item.type !== "EPF" && typeof window.add80CRow === 'function') {
                    window.add80CRow();
                    const lastRow = rows80c.lastElementChild;
                    lastRow.querySelector('.row-select-80c').value = item.type;
                    lastRow.querySelector('.row-amount-80c').value = item.amount;
                }
            });
        }
        setTimeout(() => { TaxController.calculateAll(); }, 100);
    },

    addPerkRowWithData: (type = "", value = "") => {
        const rowId = Date.now() + Math.random();
        const container = document.getElementById('perks-rows-container');
        if (!container) return;
        const row = document.createElement('div');
        row.id = `perk-${rowId}`;
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1fr 1.5fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";
        
        const perkOptions = ["Meal Coupons", "Corporate NPS", "Mobile Reimbursement", "Fuel Allowance", "LTA", "Books & Periodicals", "Professional Tax", "Other Flexi-Pay"];
        let selectOptions = perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('');
        
       // Ensure this part in addPerkRowWithData matches exactly
row.innerHTML = `
    <select class="perk-type" onchange="TaxController.calculateAll();" 
        style="padding: 10px; border-radius: 6px; border: 1px solid var(--calc-input-border); background: var(--calc-input-bg); color: var(--calc-text-main);">${selectOptions}</select>
    <input type="text" class="perk-amount" value="${value}" placeholder="Amt or %" oninput="TaxController.calculateAll();" 
        style="padding: 10px; border-radius: 6px; border: 1px solid var(--calc-input-border); background: var(--calc-input-bg); color: var(--calc-text-main); text-align: right;">
    <div class="perk-eligible" style="text-align: right; color: var(--calc-accent); font-size: 0.75rem; line-height: 1.2;"></div>
    <button onclick="document.getElementById('perk-${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>`;
        container.appendChild(row);
    },

    calculateAll: () => {
        const selectedYear = document.getElementById('fy-selector').value;
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0; 
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const rows80c = document.getElementById('80c-rows-container');
        
        // 1. Re-order 80C Rows (EPF on top)
        let manualRows = [];
        document.querySelectorAll('[id^="row-"]').forEach(row => {
            if (row.getAttribute('data-is-epf') !== 'true') {
                manualRows.push({
                    type: row.querySelector('.row-select-80c')?.value,
                    amount: row.querySelector('.row-amount-80c')?.value
                });
            }
        });
        rows80c.innerHTML = '';
        if (basic > 0) {
            window.add80CRow();
            const epfRow = rows80c.lastElementChild;
            epfRow.setAttribute('data-is-epf', 'true');
            const select = epfRow.querySelector('.row-select-80c');
            const amtInput = epfRow.querySelector('.row-amount-80c');
            const delBtn = epfRow.querySelector('button');
            if (select) { select.value = "EPF"; select.disabled = true; }
            if (amtInput) { 
                amtInput.value = Math.round(basic * 0.12); 
                amtInput.readOnly = true; 
                amtInput.style.opacity = "0.7";
            }
            if (delBtn) {
                const spacer = document.createElement('div');
                spacer.style.width = "30px";
                delBtn.parentNode.replaceChild(spacer, delBtn);
            }
        }
        manualRows.forEach(item => {
            window.add80CRow();
            const lastRow = rows80c.lastElementChild;
            lastRow.querySelector('.row-select-80c').value = item.type;
            lastRow.querySelector('.row-amount-80c').value = item.amount;
        });

        // 2. Calculate Perks with Dual-Regime NPS Logic
        let total80CInput = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80CInput += parseFloat(input.value) || 0;
        });

        let perksData = []; 
        document.querySelectorAll('.perk-row').forEach(row => {
            const type = row.querySelector('.perk-type')?.value;
            const amtVal = row.querySelector('.perk-amount')?.value || "0";
            let actualAmt = amtVal.includes('%') ? (parseFloat(amtVal.replace('%', '')) / 100) * basic : parseFloat(amtVal) || 0;
            
            perksData.push({ type: type, amount: actualAmt });
            
            const label = row.querySelector('.perk-eligible');
            if (label) {
                if (type === "Corporate NPS") {
                    const capOld = basic * 0.10;
                    const capNew = basic * 0.14;
                    const eligOld = Math.min(actualAmt, capOld);
                    const eligNew = Math.min(actualAmt, capNew);
                    
                    label.innerHTML = `
                        <div style="color: #94a3b8">Old: ₹${Math.round(eligOld).toLocaleString('en-IN')}</div>
                        <div style="color: #4ade80">New: ₹${Math.round(eligNew).toLocaleString('en-IN')}</div>
                    `;
                } else {
                    label.innerHTML = `<div style="color: #4ade80">₹${Math.round(actualAmt).toLocaleString('en-IN')}</div>`;
                }
            }
        });

        // 3. Run Engines
        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) return;

        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);
        const grossSalary = basic + hraReceived + otherIncome;
        
        const newReg = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, grossSalary, perksData, basic);
        const oldReg = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, grossSalary, {
            section80C: total80CInput,
            npsSelf: parseFloat(document.getElementById('nps-extra')?.value) || 0, 
            section80D: (parseFloat(document.getElementById('80d-self')?.value) || 0) + (parseFloat(document.getElementById('80d-parents')?.value) || 0),
            parentsSenior: document.getElementById('parents-senior')?.checked,
            homeLoanInterest: document.getElementById('is-under-construction')?.checked ? 0 : (parseFloat(document.getElementById('home-interest')?.value) || 0),
            exemptHRA: hraResult.actualExemption
        }, perksData, basic);

        TaxController.updateSummary(newReg.tax, oldReg.tax);
        
        const counterEl = document.getElementById('display-80c-total');
        if (counterEl) {
            counterEl.innerText = `₹ ${Math.min(total80CInput, 150000).toLocaleString('en-IN')} / 1,50,000`;
            counterEl.style.color = total80CInput > 150000 ? "#fbbf24" : "#4ade80";
        }
    },

    updateSummary: (newTax, oldTax) => {
        const newEl = document.getElementById('new-regime-tax');
        const oldEl = document.getElementById('old-regime-tax');
        const newBox = document.getElementById('new-regime-box');
        const oldBox = document.getElementById('old-regime-box');
        const recBox = document.getElementById('recommendation-box');

        newEl.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        oldEl.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;

        [newBox, oldBox].forEach(box => {
            box.style.borderColor = "var(--calc-input-border)";
            box.style.borderWidth = "1px";
        });

        const isNewBetter = newTax < oldTax;
        const winnerBox = isNewBetter ? newBox : oldBox;
        const winnerText = isNewBetter ? newEl : oldEl;
        winnerBox.style.borderColor = "#4ade80";
        winnerBox.style.borderWidth = "2px";
        winnerText.style.color = "#4ade80";

        if (recBox) {
            recBox.innerHTML = `<strong>${isNewBetter ? 'New' : 'Old'} Regime</strong> is better. Save <strong>₹${Math.round(Math.abs(newTax - oldTax)).toLocaleString('en-IN')}</strong>`;
        }
    }
};

const originalAdd80C = window.add80CRow;
window.add80CRow = function() {
    if (typeof originalAdd80C === 'function') originalAdd80C();
    const container = document.getElementById('80c-rows-container');
    const lastRow = container.lastElementChild;
    const delBtn = lastRow.querySelector('button');
    if (delBtn) {
        delBtn.setAttribute('onclick', 'this.parentElement.remove(); TaxController.calculateAll();');
    }
};

function addPerkRow() { TaxController.addPerkRowWithData(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData() { return await TaxController.saveUserData(); }
window.onload = TaxController.init;
