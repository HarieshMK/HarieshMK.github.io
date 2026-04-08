/**
 * Controller for the Tax Calculator UI
 */

const TaxController = {
    init: () => {
        // Any setup logic can go here
        console.log("Tax Controller Initialized");
    },

    // 1. The Master Calculation Function
    calculateAll: () => {
        // A. Collect Core Salary Inputs
        const inputs = {
            basic: parseFloat(document.getElementById('basic-salary').value) || 0,
            hraReceived: parseFloat(document.getElementById('hra-received').value) || 0,
            otherIncome: parseFloat(document.getElementById('other-income').value) || 0,
            rentPaid: parseFloat(document.getElementById('rent-paid').value) || 0,
            isMetro: document.getElementById('is-metro').value === 'true',
            homeLoanInterest: document.getElementById('has-home-loan').checked ? 
                             (parseFloat(document.getElementById('home-interest').value) || 0) : 0
        };

        const grossSalary = inputs.basic + inputs.hraReceived + inputs.otherIncome;

        // B. Collect Dynamic 80C Deductions
        let total80C = 0;
        document.querySelectorAll('.row-amount-80c').forEach(input => {
            total80C += parseFloat(input.value) || 0;
        });

        // C. Calculate Tax (Using FinanceEngine)
        // 1. New Regime (Simple)
        const newRegimeTax = FinanceEngine.TaxEngine.calculateNewRegime(grossSalary);
        
        // 2. Old Regime (Complex - needs deductions)
        // Note: We cap 80C at 1.5L inside the Engine, but we pass the total here.
        const oldRegimeTax = FinanceEngine.TaxEngine.calculateOldRegime(grossSalary, {
            section80C: total80C,
            section80D: 0, // We will build this card next
            homeLoanInterest: inputs.homeLoanInterest,
            exemptHRA: 0, // We need to add HRA calculation logic in the engine
            otherExemptions: 0
        });

        // D. Update UI Summary Sidebar
        TaxController.updateSummary(newRegimeTax, oldRegimeTax);
    },

    updateSummary: (newTax, oldTax) => {
        const newElem = document.getElementById('new-regime-tax');
        const oldElem = document.getElementById('old-regime-tax');
        const recommendationBox = document.getElementById('recommendation-box');
        
        if(newElem) newElem.innerText = `₹ ${newTax.toLocaleString('en-IN')}`;
        if(oldElem) oldElem.innerText = `₹ ${oldTax.toLocaleString('en-IN')}`;

        if(recommendationBox) {
            const diff = Math.abs(newTax - oldTax);
            if (newTax < oldTax) {
                recommendationBox.style.background = "rgba(74, 222, 128, 0.1)";
                recommendationBox.style.color = "#4ade80";
                recommendationBox.innerHTML = `<strong>New Regime</strong> is better. You save <strong>₹${diff.toLocaleString('en-IN')}</strong>`;
            } else if (oldTax < newTax) {
                recommendationBox.style.background = "rgba(56, 189, 248, 0.1)";
                recommendationBox.style.color = "#38bdf8";
                recommendationBox.innerHTML = `<strong>Old Regime</strong> is better. You save <strong>₹${diff.toLocaleString('en-IN')}</strong>`;
            } else {
                recommendationBox.innerHTML = `Both regimes result in the same tax.`;
            }
        }
    }
};

// Start the engine
window.onload = TaxController.init;
