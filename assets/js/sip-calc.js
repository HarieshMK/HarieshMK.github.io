document.addEventListener('DOMContentLoaded', function() {
    // 1. Element Mapping
    const elements = {
        monthlySIP: document.getElementById('monthly-sip'),
        monthlySlider: document.getElementById('monthly-sip-slider'),
        returnRate: document.getElementById('return-rate'),
        returnSlider: document.getElementById('return-rate-slider'),
        yearsInput: document.getElementById('years'),
        yearsSlider: document.getElementById('years-slider'),
        invToday: document.getElementById('inv-today'),
        gainToday: document.getElementById('gain-today'),
        // Note: Using your sip.md ID 'initial-lump-sum'
        lumpSumInput: document.getElementById('initial-lump-sum'),
        lumpSumSlider: document.getElementById('lump-sum-slider'),
        inflationInput: document.getElementById('inflation-rate'),
        inflationSlider: document.getElementById('inflation-slider'),
        dateInput: document.getElementById('start-date'),
        
        // Output Displays
        totalInvested: document.getElementById('total-invested'),
        totalReturns: document.getElementById('total-returns'),
        totalValue: document.getElementById('total-value'),
        realFuture: document.getElementById('real-future-value'),
        
        // Progress Section Elements
        progressSection: document.getElementById('current-progress'),
        completedTenure: document.getElementById('completed-tenure'),
        valueTodayDisplay: document.getElementById('value-today')
    };

    function sync(input, slider) {
        if(!input || !slider) return;
        input.addEventListener('input', () => { slider.value = input.value; calculate(); });
        slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
    }

    function calculate() {
    const P = parseFloat(elements.monthlySIP?.value) || 0;
    const L = parseFloat(elements.lumpSumInput?.value) || 0;
    const annualR = parseFloat(elements.returnRate?.value) || 0;
    const years = parseFloat(elements.yearsInput?.value) || 0;
    const inf = parseFloat(elements.inflationInput?.value) || 0;

    // 1. MAIN CALCULATION (Maturity Value)
    // We only use the FinanceEngine now. No fallback.
    const results = FinanceEngine.calculateFutureValue(P, L, annualR, years);
    const realValue = FinanceEngine.adjustForInflation(results.totalValue, inf, years);

    // Update UI for Maturity
    const format = (num) => Math.round(num).toLocaleString('en-IN');
    
    if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(results.totalInvested);
    if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(results.estimatedReturns);
    if(elements.totalValue) elements.totalValue.innerText = "₹" + format(results.totalValue);
    if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);

    // 2. PROGRESS LOGIC (Current Value)
    // This section handles the "As on today" numbers based on Start Date
    if (elements.dateInput && elements.dateInput.value) {
        const startDate = new Date(elements.dateInput.value);
        const today = new Date();
        
        let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
        const totalMonths = years * 12;
        const effectiveMonths = Math.max(0, Math.min(monthsPassed, totalMonths));

        if (effectiveMonths > 0 && elements.progressSection) {
            elements.progressSection.style.display = 'block';
            
            // We use the same engine but with "months passed" instead of "total years"
            const progressResults = FinanceEngine.calculateFutureValue(P, L, annualR, effectiveMonths / 12);
            
            const investedToday = (P * effectiveMonths) + L;
            const gainToday = progressResults.totalValue - investedToday;

            if (elements.completedTenure) elements.completedTenure.innerText = `${Math.floor(effectiveMonths / 12)}y ${effectiveMonths % 12}m`;
            
            // CRITICAL: Ensure 'valueTodayDisplay' is NOT the same ID as 'totalValue'
            if (elements.valueTodayDisplay) elements.valueTodayDisplay.innerText = "₹" + format(progressResults.totalValue);
            if (elements.invToday) elements.invToday.innerText = "₹" + format(investedToday);
            if (elements.gainToday) elements.gainToday.innerText = "₹" + format(gainToday);

        } else if (elements.progressSection) {
            elements.progressSection.style.display = 'none';
        }
    }
}

        // --- AUTO-SCALE TRIGGER ---
        // We look for autoScaleNumbers in the global window object (defined in script.js)
        if (typeof window.autoScaleNumbers === 'function') {
            window.autoScaleNumbers();
        } else if (typeof autoScaleNumbers === 'function') {
            autoScaleNumbers();
        }
    }

    // Initialize
    sync(elements.monthlySIP, elements.monthlySlider);
    sync(elements.returnRate, elements.returnSlider);
    sync(elements.yearsInput, elements.yearsSlider);
    sync(elements.lumpSumInput, elements.lumpSumSlider);
    sync(elements.inflationInput, elements.inflationSlider);
    
    if(elements.dateInput) {
        elements.dateInput.addEventListener('change', calculate);
    }

    calculate();
});
