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

        // 2. Real-time Calculation & Dirty State
        // Listens to every input/select change on the page
        document.addEventListener('input', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'SELECT') {
                TaxController.isDirty = true;
                TaxController.calculateAll();
            }
        });

        // 3. Load existing data from Supabase
        await TaxController.loadUserData();
    },

    // --- PERSISTENCE METHODS ---
    saveUserData: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("AUTH_REQUIRED");

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

            // Gather Perks
            document.querySelectorAll('[id^="perk-"]').forEach(row => {
                const typeSelect = row.querySelector('.perk-type');
                const amtInput = row.querySelector('.perk-amount'); 
                if (typeSelect && typeSelect.value) {
                    formData.perks.push({ type: typeSelect.value, value: amtInput.value });
                }
            });

            // Gather 80C
            document.querySelectorAll('[id^="row-"]').forEach(row => {
                const select = row.querySelector('.row-select-80c');
                const amtInput = row.querySelector('.row-amount-80c');
                if (select && select.value && amtInput.value) {
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

            if (error) throw error;
            
            TaxController.isDirty = false;
            return true;
        } catch (err) {
            console.error("Save process failed:", err);
            throw err;
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
            
            // Core fields
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

            // Visibility logic for Home Loan Note
            if (document.getElementById('clp-note')) {
                document.getElementById('clp-note').style.display = inputs.isUnderConstruction ? 'block' : 'none';
            }

            // Perks Rebuild
            const perksContainer = document.getElementById('perks-rows-container');
            perksContainer.innerHTML = '';
            if (inputs.perks?.length > 0) {
                inputs.perks.forEach(p => TaxController.addPerkRowWithData(p.type, p.value));
            }

            // 80C Rebuild
            const rows80c = document.getElementById('80c-rows-container');
            rows80c.innerHTML = '';
            if (inputs.deductions80C?.length > 0) {
                inputs.deductions80C.forEach(item => {
                    if (typeof window.add80CRow === 'function') {
                        add80CRow(); // Call the .md global function
                        const lastRow = rows80c.lastElementChild;
                        lastRow.querySelector('.row-select-80c').value = item.type;
                        lastRow.querySelector('.row-amount-80c').value = item.amount;
                    }
                });
            }
            
            // Post-load calculation
            setTimeout(() => {
                TaxController.calculateAll();
                if(typeof update80CTotal === 'function') update80CTotal();
            }, 100);
        }
    },

    // --- UI METHODS ---
    addPerkRowWithData: (type = "", value = "") => {
        const rowId = Date.now() + Math.random();
        const container = document.getElementById('perks-rows-container');
        if (!container) return;

        const row = document.createElement('div');
        row.id = `perk-${rowId}`;
        row.className = "perk-row";
        row.style = "display: grid; grid-template-columns: 2fr 1fr 1fr 30px; gap: 10px; margin-bottom: 10px; align-items: center;";

        const perkOptions = ["Meal Coupons", "Corporate NPS", "VPF", "Mobile & Internet", "LTA", "Books & Periodicals", "Professional Tax", "Other Flexi-Pay"];
        let selectOptions = perkOptions.map(opt => `<option value="${opt}" ${opt === type ? 'selected' : ''}>${opt}</option>`).join('');
        
        row.innerHTML = `
            <select class="perk-type" onchange="TaxController.calculatePerkExemption('${rowId}'); TaxController.calculateAll();" style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff;">
                ${selectOptions}
            </select>
            <input type="text" class="perk-amount" value="${value}" placeholder="Amt or %" 
                   oninput="TaxController.calculatePerkExemption('${rowId}'); TaxController.calculateAll();"
                   style="padding: 10px; border-radius: 6px; border: 1px solid #333; background: #000; color: #fff; text-align: right;">
            <div class="perk-eligible" style="text-align: right; color: #4ade80; font-size: 0.85rem; font-weight: bold;">₹ 0</div>
            <button onclick="document.getElementById('perk-${rowId}').remove(); TaxController.calculateAll();" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
        TaxController.calculatePerkExemption(rowId);
    },

    calculatePerkExemption: (rowId) => {
        const row = document.getElementById(`perk-${rowId}`);
        if(!row) return;
        const type = row.querySelector('.perk-type').value;
        const declValue = row.querySelector('.perk-amount').value;
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        
        // Use global TAX_CONFIG if available, else default to no limit
        const rules = (window.TAX_CONFIG && TAX_CONFIG.perkRules) ? TAX_CONFIG.perkRules[type] : { maxExempt: Infinity };
        
        let amount = declValue.includes('%') 
            ? (parseFloat(declValue.replace('%', '')) / 100) * basic 
            : parseFloat(declValue) || 0;

        let eligible = amount;
        if (type === "Corporate NPS") {
            const maxPercent = rules.oldLimit || 0.14; 
            eligible = Math.min(amount, basic * maxPercent);
        } else if (rules && rules.maxExempt) {
            eligible = Math.min(amount, rules.maxExempt);
        }

        row.querySelector('.perk-eligible').innerText = `₹ ${Math.round(eligible).toLocaleString('en-IN')}`;
    },

    calculateAll: () => {
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
        document.querySelectorAll('[id^="perk-"]').forEach(row => {
            const type = row.querySelector('.perk-type').value;
            const amtVal = row.querySelector('.perk-amount').value;
            if (type && amtVal) {
                let amt = amtVal.includes('%') 
                    ? (parseFloat(amtVal.replace('%', '')) / 100) * basic 
                    : parseFloat(amtVal) || 0;
                perksData.push({ type: type, amount: amt });
            }
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
        if(window.syncFloatingBar) syncFloatingBar(oldRegimeTax, newRegimeTax);
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
            } else if (oldTax < newTax) {
                recBox.innerHTML = `<strong>Old Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = "#38bdf8";
            } else {
                recBox.innerHTML = `Both regimes result in the same tax.`;
                recBox.style.borderColor = "var(--calc-input-border)";
            }
        }
    }
};

// --- GLOBAL BRIDGE ---
function addPerkRow() { TaxController.addPerkRowWithData(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData() { return await TaxController.saveUserData(); }

function update80CTotal() {
    let total = 0;
    document.querySelectorAll('.row-amount-80c').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    const display = document.getElementById('display-80c-total');
    if(display) display.innerText = `₹ ${total.toLocaleString('en-IN')}`;
    TaxController.calculateAll();
}

window.onload = TaxController.init;
