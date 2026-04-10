/**
 * Controller for the Tax Calculator UI with Supabase Persistence
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

        // 1. Load data from Supabase first
        await TaxController.loadUserData();

        // 2. Load data from Local Draft (if any)
        const savedDraft = localStorage.getItem('tax_calc_draft');
        if (savedDraft) {
            const inputs = JSON.parse(savedDraft);
            TaxController.fillForm(inputs); 
            localStorage.removeItem('tax_calc_draft');
            
            setTimeout(() => {
                TaxController.calculateAll();
            }, 200);
        }

        // 3. Pre-fill PT if empty
        const perksContainer = document.getElementById('perks-rows-container');
        if (perksContainer && perksContainer.children.length === 0) {
            TaxController.addPerkRowWithData("Professional Tax", 2500);
        }
        
        // 4. Update Button Label based on Auth status
        const { data: { session } } = await window.supabase.auth.getSession();
        const saveBtn = document.getElementById('btn-save-tax');
        if (saveBtn) {
            saveBtn.innerText = session ? "Save to Profile" : "Login to Save Progress";
        }
    },

    // --- PERSISTENCE METHODS ---
    saveUserData: async () => {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (!session) {
                const formData = TaxController.captureInputs();
                localStorage.setItem('tax_calc_draft', JSON.stringify(formData));
                const currentPath = window.location.pathname;
                window.location.href = `/login/?return_to=${currentPath}`;
                return false; 
            }

            const user = session.user;
            const selectedYear = document.getElementById('fy-selector').value;
            const formData = TaxController.captureInputs();

            const { error } = await supabase
                .from('tax_user_data')
                .upsert({ 
                    id: user.id, 
                    financial_year: selectedYear, 
                    calculator_inputs: formData, 
                    updated_at: new Date() 
                }, { onConflict: 'id, financial_year' }); 

            if (error) throw error;
            TaxController.isDirty = false;
            alert("Data saved successfully to your profile!");
            return true;
        } catch (err) {
            console.error("Save process failed:", err);
            alert("Save failed. Check console for details.");
            throw err;
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

        document.querySelectorAll('[id^="perk-"]').forEach(row => {
            const typeSelect = row.querySelector('.perk-type');
            const amtInput = row.querySelector('.perk-amount'); 
            if (typeSelect && typeSelect.value) {
                formData.perks.push({ type: typeSelect.value, value: amtInput.value });
            }
        });

        document.querySelectorAll('[id^="row-"]').forEach(row => {
            const select = row.querySelector('.row-select-80c');
            const amtInput = row.querySelector('.row-amount-80c');
            if (select && select.value && amtInput.value) {
                formData.deductions80C.push({ type: select.value, amount: amtInput.value });
            }
        });
        return formData;
    },

    loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const selectedYear = document.getElementById('fy-selector').value;
        const { data, error } = await supabase
            .from('tax_user_data')
            .select('calculator_inputs')
            .eq('id', user.id)
            .eq('financial_year', selectedYear)
            .maybeSingle(); 

        if (data && data.calculator_inputs) {
            TaxController.fillForm(data.calculator_inputs);
        } else {
            TaxController.resetForm();
        }
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

        if (document.getElementById('clp-note')) {
            document.getElementById('clp-note').style.display = inputs.isUnderConstruction ? 'block' : 'none';
        }

        const perksContainer = document.getElementById('perks-rows-container');
        perksContainer.innerHTML = '';
        if (inputs.perks?.length > 0) {
            inputs.perks.forEach(p => TaxController.addPerkRowWithData(p.type, p.value));
        }

        const rows80c = document.getElementById('80c-rows-container');
        rows80c.innerHTML = '';
        if (inputs.deductions80C?.length > 0) {
            inputs.deductions80C.forEach(item => {
                if (typeof window.add80CRow === 'function') {
                    window.add80CRow();
                    const lastRow = rows80c.lastElementChild;
                    lastRow.querySelector('.row-select-80c').value = item.type;
                    lastRow.querySelector('.row-amount-80c').value = item.amount;
                }
            });
        }
        
        setTimeout(() => {
            TaxController.calculateAll();
        }, 100);
    },

    resetForm: () => {
        document.querySelectorAll('input[type="number"], input[type="text"]').forEach(i => i.value = "");
        document.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
        document.getElementById('perks-rows-container').innerHTML = '';
        document.getElementById('80c-rows-container').innerHTML = '';
        if(document.getElementById('is-metro')) document.getElementById('is-metro').value = "false";
        TaxController.calculateAll();
    },

    addPerkRowWithData: (type = "", value = "") => {
        const rowId = Date.now() + Math.random();
        const container = document.getElementById('perks-rows-container');
        if (!container) return;

        const row = document.createElement('div');
        row.id = `perk-${rowId}`;
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1fr 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";

        const perkOptions = ["Meal Coupons", "Corporate NPS", "Mobile Reimbursement", "Fuel Allowance", "LTA", "Books & Periodicals", "Professional Tax", "Other Flexi-Pay"];
        let selectOptions = perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('');
        
        row.innerHTML = `
            <select class="perk-type" onchange="TaxController.calculateAll();" style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                ${selectOptions}
            </select>
            <input type="text" class="perk-amount" value="${value}" placeholder="Amt or %" 
                   oninput="TaxController.calculateAll();"
                   style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff; text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.85rem; font-weight: bold;">₹ 0</div>
            <button onclick="document.getElementById('perk-${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    },

    calculateAll: () => {
        const selectedYear = document.getElementById('fy-selector').value;
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0; 
        const isMetro = document.getElementById('is-metro')?.value === 'true';
        const epfAmount = Math.round(basic * 0.12);
        const rows80c = document.getElementById('80c-rows-container');

        const isUnderConstruction = document.getElementById('is-under-construction')?.checked;
        const homeLoanInterest = isUnderConstruction ? 0 : (parseFloat(document.getElementById('home-interest')?.value) || 0);
        
        const premSelf = parseFloat(document.getElementById('80d-self')?.value) || 0;
        const premParents = parseFloat(document.getElementById('80d-parents')?.value) || 0;
        const isSr = document.getElementById('parents-senior')?.checked;
        const npsExtra = parseFloat(document.getElementById('nps-extra')?.value) || 0;

        // --- EPF HANDLING ---
        const all80cSelects = Array.from(rows80c.querySelectorAll('.row-select-80c'));
        let epfRow = all80cSelects.find(sel => sel.value === "EPF")?.closest('.row-80c');

        if (!epfRow && basic > 0) {
            if (typeof window.add80CRow === 'function') {
                window.add80CRow();
                const newRow = rows80c.lastElementChild;
                const select = newRow.querySelector('.row-select-80c');
                if (select) {
                    select.value = "EPF";
                    select.disabled = true; 
                }
                epfRow = newRow;
            }
        }

        if (epfRow) {
            const amtInput = epfRow.querySelector('.row-amount-80c');
            if (amtInput) {
                amtInput.value = epfAmount;
                amtInput.readOnly = true;
                amtInput.style.opacity = "0.7";
            }
        }

        let total80CInput = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80CInput += parseFloat(input.value) || 0;
        });

        // --- PERKS ---
        let perksData = []; 
        document.querySelectorAll('[id^="perk-"]').forEach(row => {
            const typeSelect = row.querySelector('.perk-type');
            const amtInput = row.querySelector('.perk-amount');
            const label = row.querySelector('.perk-eligible');

            if (typeSelect && amtInput && typeSelect.value) {
                const type = typeSelect.value;
                const amtVal = amtInput.value;
                let amt = amtVal.includes('%') ? (parseFloat(amtVal.replace('%', '')) / 100) * basic : parseFloat(amtVal) || 0;
                perksData.push({ type: type, amount: amt });

                const yearData = TAX_CONFIG[selectedYear];
                const rule = yearData.perkRules ? yearData.perkRules[type] : null;
                
                if (type === "Corporate NPS") {
                    const allowedAmt = basic * 0.14;
                    label.innerText = amt > allowedAmt ? `Capped at ₹${Math.round(allowedAmt).toLocaleString('en-IN')} (14%)` : `₹ ${Math.round(amt).toLocaleString('en-IN')}`;
                    label.style.color = amt > allowedAmt ? "#fbbf24" : "#4ade80";
                } else {
                    const isAllowedInNew = rule && (rule.regime === "both" || rule.regime === "new");
                    label.innerText = isAllowedInNew ? `₹ ${Math.round(amt).toLocaleString('en-IN')}` : `Not in New Regime`;
                    label.style.color = isAllowedInNew ? "#4ade80" : "#ef4444";
                }
            }
        });

        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) return;

        // --- CALCULATIONS ---
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);
        const hraEligibleLabel = document.getElementById('hra-eligible-display');
        if(hraEligibleLabel) hraEligibleLabel.innerText = `Eligible: ₹ ${Math.round(hraResult.actualExemption).toLocaleString('en-IN')}`;

        const grossSalary = basic + hraReceived + otherIncome;
        const newRegimeObj = FinanceEngine.TaxEngine.calculateNewRegime(selectedYear, grossSalary, perksData, basic);
        const oldRegimeObj = FinanceEngine.TaxEngine.calculateOldRegime(selectedYear, grossSalary, {
            section80C: total80CInput,
            npsSelf: npsExtra, 
            section80D: premSelf + premParents,
            parentsSenior: isSr,
            homeLoanInterest: homeLoanInterest,
            exemptHRA: hraResult.actualExemption
        }, perksData, basic);

        TaxController.updateSummary(newRegimeObj.tax, oldRegimeObj.tax);
        
        const display80C = Math.min(total80CInput, 150000);
        const counterEl = document.getElementById('display-80c-total');
        if (counterEl) {
            counterEl.textContent = `₹ ${display80C.toLocaleString('en-IN')} / 1,50,000`;
            counterEl.style.color = total80CInput > 150000 ? "#fbbf24" : "#4ade80";
        }

        if(window.syncFloatingBar) syncFloatingBar(oldRegimeObj.tax, newRegimeObj.tax);
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
            box.style.boxShadow = "none";
        });
        newEl.style.color = "var(--calc-text-main)";
        oldEl.style.color = "var(--calc-text-main)";

        if (newTax === oldTax) {
            if (recBox) recBox.innerHTML = `Both regimes result in the same tax.`;
            return;
        }

        const isNewBetter = newTax < oldTax;
        const winnerBox = isNewBetter ? newBox : oldBox;
        const winnerText = isNewBetter ? newEl : oldEl;
        const diff = Math.abs(newTax - oldTax);

        winnerBox.style.borderColor = "#4ade80";
        winnerBox.style.borderWidth = "2px";
        winnerBox.style.boxShadow = "0 0 15px rgba(74, 222, 128, 0.1)";
        winnerText.style.color = "#4ade80";

        if (recBox) {
            recBox.innerHTML = `<strong>${isNewBetter ? 'New' : 'Old'} Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
            recBox.style.borderColor = isNewBetter ? "#4ade80" : "#38bdf8"; 
        }
    }
};

// --- GLOBAL BRIDGE ---
function addPerkRow() { TaxController.addPerkRowWithData(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData() { return await TaxController.saveUserData(); }
function update80CTotal() { TaxController.calculateAll(); }

window.onload = TaxController.init;
