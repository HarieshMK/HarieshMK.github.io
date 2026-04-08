/**
 * Controller for the Tax Calculator UI
 */

const TaxController = {
    init: () => { console.log("Tax Controller Initialized"); },

    calculateAll: () => {
        console.log("--- Calculation Started ---");
        // A. Inputs
        const basic = parseFloat(document.getElementById('basic-salary').value) || 0;
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const rentPaid = parseFloat(document.getElementById('rent-paid').value) || 0;
        const isMetro = document.getElementById('is-metro').value === 'true';
        const homeLoanInterest = document.getElementById('has-home-loan').checked ? 
                                 (parseFloat(document.getElementById('home-interest').value) || 0) : 0;
        console.log("Inputs Collected:", { basic, hraReceived, otherIncome });

        const grossSalary = basic + hraReceived + otherIncome;
        console.log("Gross Salary:", grossSalary);
        // 2. Check if Engine exists
        if (!window.FinanceEngine || !window.FinanceEngine.TaxEngine) {
            console.error("Engine Missing!", window.FinanceEngine);
            return;
        }

        // B. HRA Calculation (Only for Old Regime)
        const exemptHRA = FinanceEngine.TaxEngine.calculateExemptHRA(basic, hraReceived, rentPaid, isMetro);

        // C. 80C Totals
        let total80C = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80C += parseFloat(input.value) || 0;
        });

        // D. Calculate
        const newRegimeTax = FinanceEngine.TaxEngine.calculateNewRegime(grossSalary);
        const oldRegimeTax = FinanceEngine.TaxEngine.calculateOldRegime(grossSalary, {
            section80C: total80C,
            homeLoanInterest: homeLoanInterest,
            exemptHRA: exemptHRA
        });
        console.log("Results:", { newRegimeTax, oldRegimeTax });

        TaxController.updateSummary(newRegimeTax, oldRegimeTax);
    },

    updateSummary: (newTax, oldTax) => {
        document.getElementById('new-regime-tax').innerText = `₹ ${Math.round(newTax).toLocaleString('en-IN')}`;
        document.getElementById('old-regime-tax').innerText = `₹ ${Math.round(oldTax).toLocaleString('en-IN')}`;
        
        // Recommendation Box Logic
        const recBox = document.getElementById('recommendation-box');
        if (recBox) {
            const diff = Math.abs(newTax - oldTax);
            if (newTax < oldTax) {
                recBox.innerHTML = `<strong>New Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
            } else {
                recBox.innerHTML = `<strong>Old Regime</strong> is better. You save <strong>₹${Math.round(diff).toLocaleString('en-IN')}</strong>`;
            }
        }
    }
};

// Start the engine
window.onload = TaxController.init;
