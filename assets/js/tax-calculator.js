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

        await TaxController.loadUserData();
        // If it's a fresh load (no data), pre-fill PT
        const perksContainer = document.getElementById('perks-rows-container');
        if (perksContainer && perksContainer.children.length === 0) {
            TaxController.addPerkRowWithData("Professional Tax", 2500);
        }
    },

    // --- PERSISTENCE METHODS ---
    saveUserData: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("AUTH_REQUIRED");

            // 1. Get the year from the dropdown
            const selectedYear = document.getElementById('fy-selector').value;

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

            // 2. Save with the Year column (onConflict updated)
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
            return true;
        } catch (err) {
            console.error("Save process failed:", err);
            throw err;
        }
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

        // Check if we actually got data
        if (data && data.calculator_inputs) {
            const inputs = data.calculator_inputs;
            
            // Map inputs to DOM elements
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

            // Restore Perks
            const perksContainer = document.getElementById('perks-rows-container');
            perksContainer.innerHTML = '';
            if (inputs.perks?.length > 0) {
                inputs.perks.forEach(p => TaxController.addPerkRowWithData(p.type, p.value));
            }

            // Restore 80C Rows
            const rows80c = document.getElementById('80c-rows-container');
            rows80c.innerHTML = '';
            if (inputs.deductions80C?.length > 0) {
                inputs.deductions80C.forEach(item => {
                    if (typeof window.add80CRow === 'function') {
                        add80CRow();
                        const lastRow = rows80c.lastElementChild;
                        lastRow.querySelector('.row-select-80c').value = item.type;
                        lastRow.querySelector('.row-amount-80c').value = item.amount;
                    }
                });
            }
            
            setTimeout(() => {
                TaxController.calculateAll();
                if(typeof update80CTotal === 'function') update80CTotal();
            }, 100);

        } else {
            // No data for this year? Reset form to blank state
            TaxController.resetForm();
        }
    },

    resetForm: () => {
        // Clear all standard number inputs
        document.querySelectorAll('input[type="number"], input[type="text"]').forEach(i => i.value = "");
        // Clear checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
        // Empty the dynamic containers
        document.getElementById('perks-rows-container').innerHTML = '';
        document.getElementById('80c-rows-container').innerHTML = '';
        // Set standard select values
        if(document.getElementById('is-metro')) document.getElementById('is-metro').value = "false";
        
        TaxController.calculateAll();
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
        // 0. Get the selected Year
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

        // 1. Gather 80C
        let total80CInput = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80CInput += parseFloat(input.value) || 0;
        });

        // Handle Automatic EPF Row
        let epfRow = Array.from(rows80c.querySelectorAll('.row-80c, .perk-row'))
                          .find(row => row.querySelector('.row-select-80c')?.value === "EPF");

        if (!epfRow && basic > 0) {
            if (typeof window.add80CRow === 'function') {
                add80CRow();
                epfRow = rows80c.lastElementChild;
                const select = epfRow.querySelector('.row-select-80c');
                select.value = "EPF";
                select.disabled = true; 
            }
        }

        if (epfRow) {
            const amtInput = epfRow.querySelector('.row-amount-80c');
            amtInput.value = epfAmount;
            amtInput.readOnly = true; 
            amtInput.style.opacity = "0.7";
        }

        // 2. Process Perks & Update UI Labels
let perksData = []; // This MUST be populated to pass to the Engine
document.querySelectorAll('[id^="perk-"]').forEach(row => {
    const typeSelect = row.querySelector('.perk-type');
    const amtInput = row.querySelector('.perk-amount');
    const label = row.querySelector('.perk-eligible');

    if (typeSelect && amtInput && typeSelect.value) {
        const type = typeSelect.value;
        const amtVal = amtInput.value;
        
        // Calculate numeric value (handle %)
        let amt = amtVal.includes('%') 
            ? (parseFloat(amtVal.replace('%', '')) / 100) * basic 
            : parseFloat(amtVal) || 0;

        // Push to perksData so calculations actually use these values
        perksData.push({ type: type, amount: amt });

        const yearData = TAX_CONFIG[selectedYear];
        const rule = yearData.perkRules ? yearData.perkRules[type] : null;
        
        // NPS Specific UI Feedback
        if (type === "Corporate NPS") {
            const npsLimitPercent = 0.14; 
            const allowedAmt = basic * npsLimitPercent;
            
            if (amt > allowedAmt) {
                label.innerText = `Capped at ₹${Math.round(allowedAmt).toLocaleString('en-IN')} (14%)`;
                label.style.color = "#fbbf24"; 
            } else {
                label.innerText = `₹ ${Math.round(amt).toLocaleString('en-IN')}`;
                label.style.color = "#4ade80";
            }
        } else {
            // Check if allowed in New Regime for other perks
            const isAllowedInNew = rule && (rule.regime === "both" || rule.regime === "new");
            if (isAllowedInNew) {
                label.innerText = `₹ ${Math.round(amt).toLocaleString('en-IN')}`;
                label.style.color = "#4ade80";
            } else {
                label.innerText = `Not in New Regime`;
                label.style.color = "#ef4444";
            }
        }
    }
});

        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) return;

        // 3. RUN CALCULATIONS
        const hraResult = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);
        
        const hraEligibleLabel = document.getElementById('hra-eligible-display');
        if(hraEligibleLabel) {
            hraEligibleLabel.innerText = `Eligible: ₹ ${Math.round(hraResult.actualExemption).toLocaleString('en-IN')}`;
        }

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

        // 4. UPDATE MAIN UI
        TaxController.updateSummary(newRegimeObj.tax, oldRegimeObj.tax);
        
        // 5. UPDATE 80C COUNTER
        const display80C = Math.min(total80CInput, 150000); // UI reflects current total vs cap
        const counterEl = document.getElementById('display-80c-total');
        if (counterEl) {
            counterEl.innerText = `₹ ${display80C.toLocaleString('en-IN')} / 1,50,000`;
            counterEl.style.color = total80CInput > 150000 ? "#fbbf24" : "#4ade80";
        }

        if(window.syncFloatingBar) syncFloatingBar(oldRegimeObj.tax, newRegimeObj.tax);
    },

        updateSummary: (newTax, oldTax) => {
            // 1. Get DOM Elements
            const newEl = document.getElementById('new-regime-tax');
            const oldEl = document.getElementById('old-regime-tax');
            const newBox = document.getElementById('new-regime-box');
            const oldBox = document.getElementById('old-regime-box');
            const recBox = document.getElementById('recommendation-box');
    
            // 2. Set the text for the numbers
            newEl.innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
            oldEl.innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
    
            // 3. Reset Styles to "Neutral" before applying the highlight
            [newBox, oldBox].forEach(box => {
                box.style.borderColor = "var(--calc-input-border)";
                box.style.borderWidth = "1px";
                box.style.boxShadow = "none";
            });
            newEl.style.color = "var(--calc-text-main)";
            oldEl.style.color = "var(--calc-text-main)";
    
            // 4. Handle Equal Tax Case
            if (newTax === oldTax) {
                if (recBox) {
                    recBox.innerHTML = `Both regimes result in the same tax.`;
                    recBox.style.borderColor = "var(--calc-input-border)";
                }
                return;
            }
    
            // 5. Determine the winner and apply highlight
            const isNewBetter = newTax < oldTax;
            const winnerBox = isNewBetter ? newBox : oldBox;
            const winnerText = isNewBetter ? newEl : oldEl;
            const diff = Math.abs(newTax - oldTax);
    
            // Apply Green Highlight to the Winner
            winnerBox.style.borderColor = "#4ade80"; // Green border
            winnerBox.style.borderWidth = "2px";
            winnerBox.style.boxShadow = "0 0 15px rgba(74, 222, 128, 0.1)"; // Subtle green glow
            winnerText.style.color = "#4ade80"; // Green text for the winning number
    
            // 6. Update the Recommendation Text Box
            if (recBox) {
                recBox.innerHTML = `<strong>${isNewBetter ? 'New' : 'Old'} Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
                recBox.style.borderColor = isNewBetter ? "#4ade80" : "#38bdf8"; 
            }
        }

// --- GLOBAL BRIDGE ---
function addPerkRow() { TaxController.addPerkRowWithData(); }
function runCalculator() { TaxController.calculateAll(); }
async function saveTaxData() { return await TaxController.saveUserData(); }

function update80CTotal() {
    TaxController.calculateAll();
}

window.onload = TaxController.init;
