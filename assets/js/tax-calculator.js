/**
 * Controller for the Tax Calculator UI with Supabase Persistence
 */
const TaxController = {
    isDirty: false,

    init: async () => { 
        console.log("Tax Controller Initialized"); 
        
        // 1. Setup Exit Warning
        window.addEventListener('beforeunload', (e) => {
            if (TaxController.isDirty) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        });

        // 2. Track changes on all inputs to set 'isDirty'
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                TaxController.isDirty = true;
            }
        });

        // 3. Load existing data from Supabase
        await TaxController.loadUserData();
    },

    // --- PERSISTENCE METHODS ---
    saveUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert("Please login to save your details!");
            return;
        }

        // Gather All Data
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

        // Collect Perks
        document.querySelectorAll('.perk-row').forEach(row => {
            formData.perks.push({
                type: row.querySelector('.perk-type').value,
                value: row.querySelector('.perk-declaration').value
            });
        });

        // Collect 80C
        document.querySelectorAll('.row-select-80c').forEach((select, index) => {
            const amtInput = document.querySelectorAll('.row-amount-80c')[index];
            if (select.value && amtInput.value) {
                formData.deductions80C.push({ type: select.value, amount: amtInput.value });
            }
        });

        const { error } = await supabase
            .from('tax_user_data')
            .upsert({ 
                id: user.id, 
                calculator_inputs: formData, 
                updated_at: new Date() 
            });

        if (error) {
            console.error("Save Error:", error);
            alert("Error saving data.");
        } else {
            TaxController.isDirty = false;
            alert("Data saved successfully!");
        }
    },

    loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('tax_user_data')
            .select('calculator_inputs')
            .eq('id', user.id)
            .single();

        if (data && data.calculator_inputs) {
            const inputs = data.calculator_inputs;
            
            // Fill core fields
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

            // Clear and Rebuild Perks
            document.getElementById('perks-rows-container').innerHTML = '';
            if (inputs.perks) {
                inputs.perks.forEach(p => TaxController.addPerkRowWithData(p.type, p.value));
            }

            // Clear and Rebuild 80C (Logic in .md file usually handles UI, but we trigger it here)
            if (inputs.deductions80C && typeof add80CRow === 'function') {
                document.getElementById('80c-rows-container').innerHTML = '';
                inputs.deductions80C.forEach(item => {
                    // Logic to add 80C row and set values (handled in bridge)
                    if(window.add80CRowWithData) window.add80CRowWithData(item.type, item.amount);
                });
            }
            
            TaxController.calculateAll();
        }
    },

    // --- UI METHODS ---
    addPerkRowWithData: (type = "", value = "") => {
        const rowId = Date.now() + Math.random();
        const container = document.getElementById('perks-rows-container');
        const row = document.createElement('div');
        row.id = `perk-${rowId}`;
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1fr 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";

        const perkOptions = ["Meal Coupons", "Corporate NPS", "VPF", "Mobile & Internet", "LTA", "Books & Periodicals", "Professional Tax", "Other Flexi-Pay"];
        let selectOptions = perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('');
        
        row.innerHTML = `
            <select class="perk-type" onchange="TaxController.calculatePerkExemption('${rowId}')" style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                ${selectOptions}
            </select>
            <input type="text" class="perk-declaration" value="${value}" placeholder="Amt or %" oninput="TaxController.calculatePerkExemption('${rowId}')"
                   style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff; text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.85rem; font-weight: bold;">₹ 0</div>
            <button onclick="document.getElementById('perk-${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
        TaxController.calculatePerkExemption(rowId);
    },

    // Original addPerkRow wrapper
    addPerkRow: () => TaxController.addPerkRowWithData(),

    calculatePerkExemption: (rowId) => {
        const row = document.getElementById(`perk-${rowId}`);
        if(!row) return;
        const type = row.querySelector('.perk-type').value;
        const declValue = row.querySelector('.perk-declaration').value;
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const rules = (typeof TAX_CONFIG !== 'undefined' && TAX_CONFIG.perkRules) ? TAX_CONFIG.perkRules[type] : { maxExempt: Infinity };
        
        let amount = declValue.includes('%') 
            ? (parseFloat(declValue.replace('%', '')) / 100) * basic 
            : parseFloat(declValue) || 0;

        let eligible = amount;
        if (type === "Corporate NPS") {
            const maxPercent = (rules.oldLimit && rules.newLimit) ? Math.max(rules.oldLimit, rules.newLimit) : 0.14;
            eligible = Math.min(amount, basic * maxPercent);
        } else if (rules && rules.maxExempt) {
            eligible = Math.min(amount, rules.maxExempt);
        }

        row.querySelector('.perk-eligible').innerText = `₹ ${Math.round(eligible).toLocaleString('en-IN')}`;
    },

    calculateAll: () => {
        // ... (Keep your existing calculateAll logic here)
        // Ensure you call updateSummary at the end
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid')?.value) || 0; 
        const isMetro = document.getElementById('is-metro')?.value === 'true';

        const isUnderConstruction = document.getElementById('is-under-construction')?.checked;
        const homeLoanInterest = isUnderConstruction ? 0 : (parseFloat(document.getElementById('home-interest')?.value) || 0);
        
        const premSelf = parseFloat(document.getElementById('80d-self')?.value) || 0;
        const premParents = parseFloat(document.getElementById('80d-parents')?.value) || 0;
        const isSr = document.getElementById('parents-senior')?.checked;
        const total80D = Math.min(premSelf, 25000) + Math.min(premParents, isSr ? 50000 : 25000);

        const grossSalary = basic + hraReceived + otherIncome;
        const npsExtra = parseFloat(document.getElementById('nps-extra')?.value) || 0;

        let total80C = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80C += parseFloat(input.value) || 0;
        });

        let perksData = [];
        document.querySelectorAll('.perk-row').forEach(row => {
            const type = row.querySelector('.perk-type').value;
            const declValue = row.querySelector('.perk-declaration').value;
            let amt = declValue.includes('%') 
                ? (parseFloat(declValue.replace('%', '')) / 100) * basic 
                : parseFloat(declValue) || 0;
            perksData.push({ type: type, amount: amt });
        });

        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) return;

        const exemptHRA = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);
        const newRegimeTax = FinanceEngine.TaxEngine.calculateNewRegime(grossSalary, perksData, basic);
        const oldRegimeTax = FinanceEngine.TaxEngine.calculateOldRegime(grossSalary, {
            section80C: total80C,
            npsSelf: npsExtra, 
            section80D: total80D,
            homeLoanInterest: homeLoanInterest,
            exemptHRA: exemptHRA
        }, perksData, basic);

        TaxController.updateSummary(newRegimeTax, oldRegimeTax);
    },

    updateSummary: (newTax, oldTax) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            const diff = Math.abs(newTax - oldTax);
            if (newTax < oldTax) {
                recBox.innerHTML = `<strong>New Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = "#4ade80";
            } else {
                recBox.innerHTML = `<strong>Old Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = "#38bdf8";
            }
        }
    }
};

// --- GLOBAL BRIDGE ---
function addPerkRow() { TaxController.addPerkRow(); }
function runCalculator() { TaxController.calculateAll(); }

window.onload = TaxController.init;
