document.addEventListener('DOMContentLoaded', function() {
    // 1. Element Mapping - Double check these IDs against your HTML!
    const elements = {
        monthlySIP: document.getElementById('monthly-sip'),
        monthlySlider: document.getElementById('monthly-sip-slider'),
        returnRate: document.getElementById('return-rate'),
        returnSlider: document.getElementById('return-rate-slider'),
        yearsInput: document.getElementById('years'),
        yearsSlider: document.getElementById('years-slider'),
        lumpSumInput: document.getElementById('initial-lump-sum') || document.getElementById('existing-corpus'),
        lumpSumSlider: document.getElementById('lump-sum-slider') || document.getElementById('existing-corpus-slider'),
        inflationInput: document.getElementById('inflation-rate'),
        inflationSlider: document.getElementById('inflation-slider'),
        dateInput: document.getElementById('start-date'),
        
        // Outputs
        totalInvested: document.getElementById('total-invested'),
        totalReturns: document.getElementById('total-returns'),
        totalValue: document.getElementById('total-value'),
        realFuture: document.getElementById('real-future-value')
    };

    function sync(input, slider) {
        if(!input || !slider) return;
        input.addEventListener('input', () => { slider.value = input.value; calculate(); });
        slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
    }

    function calculate() {
        // Grab values safely
        const P = parseFloat(elements.monthlySIP?.value) || 0;
        const L = parseFloat(elements.lumpSumInput?.value) || 0;
        const annualR = parseFloat(elements.returnRate?.value) || 0;
        const years = parseFloat(elements.yearsInput?.value) || 0;
        const inf = parseFloat(elements.inflationInput?.value) || 0;

        let totalInvested, totalValue, estimatedReturns, realValue;

        // Try using the Engine, fallback to local math if Engine is missing
        if (typeof FinanceEngine !== 'undefined') {
            const results = FinanceEngine.calculateFutureValue(P, L, annualR, years);
            totalInvested = results.totalInvested;
            totalValue = results.totalValue;
            estimatedReturns = results.estimatedReturns;
            realValue = FinanceEngine.adjustForInflation(totalValue, inf, years);
        } else {
            // Fallback Math (Manual)
            const r = (annualR / 100) / 12;
            const n = years * 12;
            const fvSIP = r > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : P * n;
            const fvLump = L * Math.pow(1 + r, n);
            totalValue = fvSIP + fvLump;
            totalInvested = (P * n) + L;
            estimatedReturns = totalValue - totalInvested;
            realValue = totalValue / Math.pow(1 + (inf/100), years);
        }

        // Helper to format
        const format = (num) => {
            if (typeof FinanceEngine !== 'undefined') return FinanceEngine.formatIndian(num);
            return Math.round(num).toLocaleString('en-IN');
        };

        // Push to UI
        if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(totalInvested);
        if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(estimatedReturns);
        if(elements.totalValue) elements.totalValue.innerText = "₹" + format(totalValue);
        if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);
        
        // Trigger autoScale if it exists in script.js
        if (typeof autoScaleNumbers === 'function') autoScaleNumbers();
    }

    // Initialize Syncing
    sync(elements.monthlySIP, elements.monthlySlider);
    sync(elements.returnRate, elements.returnSlider);
    sync(elements.yearsInput, elements.yearsSlider);
    sync(elements.lumpSumInput, elements.lumpSumSlider);
    sync(elements.inflationInput, elements.inflationSlider);
    if(elements.dateInput) elements.dateInput.addEventListener('change', calculate);

    calculate(); // Run once on load
});
