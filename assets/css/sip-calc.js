document.addEventListener('DOMContentLoaded', function() {
    const monthlyInput = document.getElementById('monthly-sip');
    const rateInput = document.getElementById('return-rate');
    const yearsInput = document.getElementById('years');

    const investedDisplay = document.getElementById('total-invested');
    const returnsDisplay = document.getElementById('total-returns');
    const valueDisplay = document.getElementById('total-value');

    function calculateSIP() {
        let P = parseFloat(monthlyInput.value); // Monthly amount
        let annualRate = parseFloat(rateInput.value); // Annual rate
        let n = parseFloat(yearsInput.value) * 12; // Total months
        let i = annualRate / 100 / 12; // Monthly rate

        if (isNaN(P) || isNaN(annualRate) || isNaN(n)) return;

        // SIP Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
        let totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        let totalInvested = P * n;
        let totalReturns = totalValue - totalInvested;

        // Format to Indian Currency Style
        investedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        returnsDisplay.innerText = "₹" + Math.round(totalReturns).toLocaleString('en-IN');
        valueDisplay.innerText = "₹" + Math.round(totalValue).toLocaleString('en-IN');
    }

    // Listen for any input changes
    [monthlyInput, rateInput, yearsInput].forEach(input => {
        input.addEventListener('input', calculateSIP);
    });

    // Initial calculation
    calculateSIP();
});
