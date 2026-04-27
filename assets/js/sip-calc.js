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
        console.log("SIP Calculation running...");

        const P = parseFloat(elements.monthlySIP?.value) || 0;
        const L = parseFloat(elements.lumpSumInput?.value) || 0;
        const annualR = parseFloat(elements.returnRate?.value) || 0;
        const years = parseFloat(elements.yearsInput?.value) || 0;
        const inf = parseFloat(elements.inflationInput?.value) || 0;

        if (typeof FinanceEngine !== 'undefined') {
            // 1. MAIN CALCULATION
            const results = FinanceEngine.calculateFutureValue(P, L, annualR, years);
            const realValue = FinanceEngine.adjustForInflation(results.totalValue, inf, years);

            const format = (num) => FinanceEngine.formatIndian(num);
            
            if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(results.totalInvested);
            if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(results.estimatedReturns);
            if(elements.totalValue) elements.totalValue.innerText = "₹" + format(results.totalValue);
            if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);

            // 2. PROGRESS LOGIC
            if (elements.dateInput && elements.dateInput.value) {
                const startDate = new Date(elements.dateInput.value);
                const today = new Date();
                
                let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
                const totalMonths = years * 12;
                const effectiveMonths = Math.max(0, Math.min(monthsPassed, totalMonths));

                if (effectiveMonths > 0 && elements.progressSection) {
                    elements.progressSection.style.display = 'block';
                    
                    const progressResults = FinanceEngine.calculateFutureValue(P, L, annualR, effectiveMonths / 12);
                    const investedToday = (P * effectiveMonths) + L;
                    const gainToday = progressResults.totalValue - investedToday;

                    if (elements.completedTenure) elements.completedTenure.innerText = `${Math.floor(effectiveMonths / 12)}y ${effectiveMonths % 12}m`;
                    if (elements.valueTodayDisplay) elements.valueTodayDisplay.innerText = "₹" + format(progressResults.totalValue);
                    if (elements.invToday) elements.invToday.innerText = "₹" + format(investedToday);
                    if (elements.gainToday) elements.gainToday.innerText = "₹" + format(gainToday);

                } else if (elements.progressSection) {
                    elements.progressSection.style.display = 'none';
                }
            }

            // --- AUTO-SCALE TRIGGER ---
            if (typeof window.autoScaleNumbers === 'function') {
                window.autoScaleNumbers();
            }
            // Near the end of your calculate() function
        if (elements.totalValue) {
            const years = elements.yearsInput.value;
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + parseInt(years));
            
            // Formatting the date to look nice (e.g., April 2051)
            const options = { month: 'long', year: 'numeric' };
            const dateString = futureDate.toLocaleDateString('en-IN', options);
        
            const messageElement = document.getElementById('future-message');
            if (messageElement) {
                messageElement.innerHTML = `Your estimated maturity of <strong>${elements.totalValue.innerText}</strong> is expected to be reached by <strong>${dateString}</strong>.`;
            }
        }
        } else {
            console.error("FinanceEngine not found.");
        }
    } // End of calculate function

    // Initialize Syncing
    sync(elements.monthlySIP, elements.monthlySlider);
    sync(elements.returnRate, elements.returnSlider);
    sync(elements.yearsInput, elements.yearsSlider);
    sync(elements.lumpSumInput, elements.lumpSumSlider);
    sync(elements.inflationInput, elements.inflationSlider);
    
    if(elements.dateInput) {
        elements.dateInput.addEventListener('change', calculate);
    }
    // Run once on load
    calculate();
}); // End of DOMContentLoaded
