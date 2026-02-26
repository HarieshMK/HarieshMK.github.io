document.addEventListener('DOMContentLoaded', function() {
    const monthlyInput = document.getElementById('monthly-sip');
    const rateInput = document.getElementById('return-rate');
    const yearsInput = document.getElementById('years');
    const dateInput = document.getElementById('start-date');

    const investedDisplay = document.getElementById('total-invested');
    const returnsDisplay = document.getElementById('total-returns');
    const valueDisplay = document.getElementById('total-value');
    const tenureDisplay = document.getElementById('display-tenure');

    function calculateSIP() {
        let P = parseFloat(monthlyInput.value); 
        let annualRate = parseFloat(rateInput.value); 
        let i = annualRate / 100 / 12; 
        let n; // total months
        
        const startDateValue = dateInput.value;

        if (startDateValue) {
            // Calculate months based on Calendar
            let start = new Date(startDateValue);
            let today = new Date();
            let diffMonths = (today.getFullYear() - start.getFullYear()) * 12;
            diffMonths += today.getMonth() - start.getMonth();
            
            // If the date is today or in the future, fallback to 1 month or years input
            n = diffMonths > 0 ? diffMonths : parseFloat(yearsInput.value) * 12;
            
            // Update the Duration display text
            let displayY = Math.floor(n / 12);
            let displayM = n % 12;
            tenureDisplay.innerText = `${displayY}y ${displayM}m (${n} months)`;
        } else {
            // Use the Years input
            let years = parseFloat(yearsInput.value);
            n = years * 12;
            tenureDisplay.innerText = years + " Years";
        }

        if (isNaN(P) || isNaN(annualRate) || isNaN(n) || i === 0) return;

        // SIP Formula (Annuity Due to match Groww/Industry Standards)
        let totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        let totalInvested = P * n;
        let totalReturns = totalValue - totalInvested;

        // Formatting
        investedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        returnsDisplay.innerText = "₹" + Math.round(totalReturns).toLocaleString('en-IN');
        valueDisplay.innerText = "₹" + Math.round(totalValue).toLocaleString('en-IN');
    }

    // Listen to all inputs
    [monthlyInput, rateInput, yearsInput, dateInput].forEach(input => {
        input.addEventListener('input', calculateSIP);
    });

    calculateSIP();
});
