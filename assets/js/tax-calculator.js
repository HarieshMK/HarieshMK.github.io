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
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'SELECT') {
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
            throw new Error("AUTH_REQUIRED");
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

        // Collect Perks - Fixed selector to match the .md row IDs
        document.querySelectorAll('[id^="perk-"]').forEach(row => {
            const typeSelect = row.querySelector('.perk-type');
            const amtInput = row.querySelector('.perk-amount'); // Matches .md class
            if (typeSelect && typeSelect.value) {
                formData.perks.push({
                    type: typeSelect.value,
                    value: amtInput.value
                });
            }
        });

        // Collect 80C - Fixed selection logic
        document.querySelectorAll('[id^="row-"]').forEach(row => {
            const select = row.querySelector('.row-select-80c');
            const amtInput = row.querySelector('.row-amount-80c');
            if (select && select.value && amtInput.value) {
                formData.deductions80C.push({ 
                    type: select.value, 
                    amount: amtInput.value 
                });
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

            // Toggle visibility for CLP note if needed
            if(inputs.isUnderConstruction) {
                document.getElementById('clp-note').style.display = 'block';
            }

            // Clear and Rebuild Perks using the .md globally available function
            const perksContainer = document.getElementById('perks-rows-container');
            perksContainer.innerHTML = '';
            if (inputs.perks && inputs.perks.length > 0) {
                inputs.perks.forEach(p => {
                    // Use the function defined in your HTML script
                    if (typeof window.addPerkRow === 'function') {
                        addPerkRow(); 
                        const lastRow = perksContainer.lastElementChild;
                        lastRow.querySelector('.perk-type').value = p.type;
                        lastRow.querySelector('.perk-amount').value = p.value;
                    }
                });
            } else {
                addPerkRow(); // Add one empty row if none saved
            }

            // Clear and Rebuild 80C
            const rows80c = document.getElementById('80c-rows-container');
            rows80c.innerHTML = '';
            if (inputs.deductions80C && inputs.deductions80C.length > 0) {
                inputs.deductions80C.forEach(item => {
                    if (typeof window.add80CRow === 'function') {
                        add80CRow();
                        const lastRow = rows80c.lastElementChild;
                        lastRow.querySelector('.row-select-80c').value = item.type;
                        lastRow.querySelector('.row-amount-80c').value = item.amount;
                    }
                });
            } else {
                add80CRow(); // Add one empty row if none saved
            }
            
            // Calculate everything after loading
            setTimeout(() => {
                TaxController.calculateAll();
                if(typeof update80CTotal === 'function') update80CTotal();
            }, 100);
        }
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
        
        // Update floating bar if function exists
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

// --- GLOBAL BRIDGE FUNCTIONS ---
// These are called by the inline 'onclick' handlers in your Markdown
function runCalculator() { TaxController.calculateAll(); }

async function saveTaxData() { 
    return await TaxController.saveUserData(); 
}

// Ensure 80C total label updates
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
