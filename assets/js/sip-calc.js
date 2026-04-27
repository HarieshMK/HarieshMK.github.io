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
        console.log("Input Years:", elements.yearsInput.value);
        console.log("Calculated Months (n):", parseFloat(elements.yearsInput.value) * 12);
        const P = parseFloat(elements.monthlySIP?.value) || 0;
        const L = parseFloat(elements.lumpSumInput?.value) || 0;
        const annualR = parseFloat(elements.returnRate?.value) || 0;
        const years = parseFloat(elements.yearsInput?.value) || 0;
        const inf = parseFloat(elements.inflationInput?.value) || 0;
    
        // PRECISE MATH (9.99L Logic)
        const r = (annualR / 100) / 12;
        const n = years * 12;
        
        let totalValue;
        if (r > 0) {
            // This is the specific "Annuity Due" formula for 9.99L
            totalValue = P * ((Math.pow(1 + r, n) - 1) / r);
            totalValue += L * Math.pow(1 + r, n);
        } else {
            totalValue = (P * n) + L;
        }
    
        const totalInvested = (P * n) + L;
        const estimatedReturns = totalValue - totalInvested;
        const realValue = totalValue / Math.pow(1 + (inf / 100), years);
    
        // UI UPDATES (Using standard formatting since Engine might be blocked)
        const format = (num) => Math.round(num).toLocaleString('en-IN');
    
        if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(totalInvested);
        if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(estimatedReturns);
        if(elements.totalValue) elements.totalValue.innerText = "₹" + format(totalValue);
        if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);

        // --- PROGRESS LOGIC ---
        if (elements.dateInput && elements.dateInput.value) {
            const startDate = new Date(elements.dateInput.value);
            const today = new Date();
            let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
            const totalMonths = years * 12;
            const effectiveMonths = Math.max(0, Math.min(monthsPassed, totalMonths));

            if (effectiveMonths > 0 && elements.progressSection) {
                elements.progressSection.style.display = 'block';
                const progressResults = (typeof FinanceEngine !== 'undefined') ? 
                    FinanceEngine.calculateFutureValue(P, L, annualR, effectiveMonths / 12) : 
                    { totalValue: ( (annualR/1200 > 0) ? P * ((Math.pow(1 + annualR/1200, effectiveMonths) - 1) / (annualR/1200)) * (1 + annualR/1200) : P * effectiveMonths) + (L * Math.pow(1 + annualR/1200, effectiveMonths)) };
                
                // New logic to calculate split
                const investedToday = (P * effectiveMonths) + L;
                const gainToday = progressResults.totalValue - investedToday;

                if (elements.completedTenure) elements.completedTenure.innerText = `${Math.floor(effectiveMonths / 12)}y ${effectiveMonths % 12}m`;
                if (elements.valueTodayDisplay) elements.valueTodayDisplay.innerText = "₹" + format(progressResults.totalValue);
                
                // Update new fields
                if (elements.invToday) elements.invToday.innerText = "₹" + format(investedToday);
                if (elements.gainToday) elements.gainToday.innerText = "₹" + format(gainToday);

            } else if (elements.progressSection) {
                elements.progressSection.style.display = 'none';
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
