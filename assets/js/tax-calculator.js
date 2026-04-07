/**
 * Controller for the Tax Calculator UI
 */

const TaxController = {
    init: () => {
        // Any setup logic can go here
        TaxController.updateMode(); 
    },

    // 1. Handle the Planning vs Actuals Toggle
    updateMode: () => {
        const isActualMode = document.getElementById('calc-mode').checked;
        const label = document.getElementById('mode-label');
        
        if (isActualMode) {
            label.innerHTML = "Mode: <strong>Actuals (Filing)</strong>";
            // Logic to show/hide extra fields if needed
        } else {
            label.innerHTML = "Mode: <strong>Planning (Projections)</strong>";
        }
        TaxController.calculateAll();
    },

    // 2. The Master Calculation Function
    calculateAll: () => {
        // A. Grab Income Inputs
        const basic = parseFloat(document.getElementById('basic-pay').value) || 0;
        const hraRec = parseFloat(document.getElementById('hra-received').value) || 0;
        const special = parseFloat(document.getElementById('special-allowance').value) || 0;
        const bonus = parseFloat(document.getElementById('bonus').value) || 0;

        const grossSalary = basic + hraRec + special + bonus;

        // B. Update Income Card UI
        document.getElementById('display-gross').innerText = `₹ ${FinanceEngine.formatIndian(grossSalary)}`;

        // C. Calculate Tax (Using our FinanceEngine)
        const newRegimeTax = FinanceEngine.TaxEngine.calculateNewRegime(grossSalary);
        
        // Note: For now, we are passing 0 deductions for Old Regime until we build the next cards
        const oldRegimeTax = FinanceEngine.TaxEngine.calculateOldRegime(grossSalary, {
            section80C: 0,
            section80D: 0,
            homeLoanInterest: 0,
            npsIndividual: 0,
            exemptHRA: 0,
            otherExemptions: 0
        });

        // D. Update Summary Sidebar
        TaxController.updateSummary(newRegimeTax, oldRegimeTax);
    },

    updateSummary: (newTax, oldTax) => {
        // We'll map these to the HTML elements in your Summary Sidebar
        const newElem = document.getElementById('summary-new-tax');
        const oldElem = document.getElementById('summary-old-tax');
        
        if(newElem) newElem.innerText = `₹ ${FinanceEngine.formatIndian(newTax)}`;
        if(oldElem) oldElem.innerText = `₹ ${FinanceEngine.formatIndian(oldTax)}`;

        // Highlight the winner
        const winnerText = document.getElementById('tax-winner');
        if(winnerText) {
            const diff = Math.abs(newTax - oldTax);
            if (newTax < oldTax) {
                winnerText.innerHTML = `New Regime saves you <strong>₹${FinanceEngine.formatIndian(diff)}</strong>`;
            } else {
                winnerText.innerHTML = `Old Regime saves you <strong>₹${FinanceEngine.formatIndian(diff)}</strong>`;
            }
        }
    }
};

// Start the engine
window.onload = TaxController.init;
