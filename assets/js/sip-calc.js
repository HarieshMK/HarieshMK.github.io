document.addEventListener('DOMContentLoaded', function() {
    const monthlyInput = document.getElementById('monthly-sip');
    const rateInput = document.getElementById('return-rate');
    const yearsInput = document.getElementById('years');
    const dateInput = document.getElementById('start-date');

    const investedDisplay = document.getElementById('total-invested');
    const returnsDisplay = document.getElementById('total-returns');
    const valueDisplay = document.getElementById('total-value');
    
    // Progress IDs
    const progressSection = document.getElementById('current-progress');
    const completedTenure = document.getElementById('completed-tenure');
    const valueTodayDisplay = document.getElementById('value-today');

    function calculateSIP() {
        let P = parseFloat(monthlyInput.value); 
        let annualRate = parseFloat(rateInput.value); 
        let yearsGoal = parseFloat(yearsInput.value);
        let i = annualRate / 100 / 12; 

        if (isNaN(P) || isNaN(annualRate) || isNaN(yearsGoal) || i === 0) return;

        // 1. FUTURE PROJECTION (Always calculated based on "Time Period")
        let nGoal = yearsGoal * 12;
        let finalValue = P * ((Math.pow(1 + i, nGoal) - 1) / i) * (1 + i);
        let totalInvested = P * nGoal;
        let totalReturns = finalValue - totalInvested;

        // 2. CURRENT PROGRESS (Only if Date is selected)
        const startDateValue = dateInput.value;
        if (startDateValue) {
            let start = new Date(startDateValue);
            let today = new Date();
            // Calculate total months difference
            let nPassed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());

            if (nPassed > 0) {
                progressSection.style.display = 'block';
                let valueToday = P * ((Math.pow(1 + i, nPassed) - 1) / i) * (1 + i);
                let yPassed = Math.floor(nPassed / 12);
                let mPassed = nPassed % 12;
                
                completedTenure.innerText = `${yPassed}y ${mPassed}m`;
                valueTodayDisplay.innerText = "₹" + Math.round(valueToday).toLocaleString('en-IN');
            } else {
                progressSection.style.display = 'none';
            }
        } else {
            progressSection.style.display = 'none';
        }

        // Update Future Results
        investedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        returnsDisplay.innerText = "₹" + Math.round(totalReturns).toLocaleString('en-IN');
        valueDisplay.innerText = "₹" + Math.round(finalValue).toLocaleString('en-IN');
    }

    [monthlyInput, rateInput, yearsInput, dateInput].forEach(input => {
        input.addEventListener('input', calculateSIP);
    });

    calculateSIP();
});
