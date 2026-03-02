document.addEventListener('DOMContentLoaded', function() {
    // Inputs
    const monthlySIP = document.getElementById('monthly-sip');
    const monthlySlider = document.getElementById('monthly-sip-slider');
    const returnRate = document.getElementById('return-rate');
    const returnSlider = document.getElementById('return-rate-slider');
    const yearsInput = document.getElementById('years');
    const yearsSlider = document.getElementById('years-slider');
    const lumpSumInput = document.getElementById('initial-lump-sum');
    const lumpSumSlider = document.getElementById('lump-sum-slider');
    const inflationInput = document.getElementById('inflation-rate');
    const inflationSlider = document.getElementById('inflation-slider');
    const dateInput = document.getElementById('start-date');

    // Outputs
    const totalInvestedDisplay = document.getElementById('total-invested');
    const totalReturnsDisplay = document.getElementById('total-returns');
    const totalValueDisplay = document.getElementById('total-value');
    const realFutureDisplay = document.getElementById('real-future-value');
    
    const progressSection = document.getElementById('current-progress');
    const completedTenure = document.getElementById('completed-tenure');
    const valueTodayDisplay = document.getElementById('value-today');
    const realValueTodayDisplay = document.getElementById('real-value-today');

    function syncInputs(input, slider) {
        input.addEventListener('input', () => { 
            slider.value = input.value; 
            calculateSIP(); 
        });
        slider.addEventListener('input', () => { 
            input.value = slider.value; 
            calculateSIP(); 
        });
    }

    // Initialize Sync
    syncInputs(monthlySIP, monthlySlider);
    syncInputs(returnRate, returnSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(lumpSumInput, lumpSumSlider);
    syncInputs(inflationInput, inflationSlider);
    if(dateInput) dateInput.addEventListener('change', calculateSIP);

    // --- FONT SIZE ADJUSTMENT LOGIC ---
    function autoScaleNumbers() {
        const numbersToScale = document.querySelectorAll('.result-item strong');
        numbersToScale.forEach(num => {
            const parent = num.parentElement;
            const parentWidth = parent.clientWidth - 20; // Subtract padding
            const isHighlight = num.closest('.highlight');
            let currentSize = isHighlight ? 1.6 : 1.35; // Matches CSS base
            
            num.style.fontSize = currentSize + 'rem';
            
            // Shrink loop
            while (num.scrollWidth > parentWidth && currentSize > 0.7) {
                currentSize -= 0.05;
                num.style.fontSize = currentSize + 'rem';
            }
        });
    }

    function calculateSIP() {
        const P = parseFloat(monthlySIP.value) || 0;
        const L = parseFloat(lumpSumInput.value) || 0;
        const r = (parseFloat(returnRate.value) / 100) / 12;
        const n = parseFloat(yearsInput.value) * 12;
        const inf = parseFloat(inflationInput.value) / 100;

        // Formula for SIP: P × ({[1 + r]^n – 1} / r) × (1 + r)
        const futureValueSIP = r > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : P * n;
        const futureValueLump = L * Math.pow(1 + r, n);
        
        const totalValue = futureValueSIP + futureValueLump;
        const totalInvested = (P * n) + L;
        const estimatedReturns = totalValue - totalInvested;
        
        // Adjust for Inflation (Real Value)
        const realFutureValue = totalValue / Math.pow(1 + inf, parseFloat(yearsInput.value));

        // Update UI with en-IN formatting
        totalInvestedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        totalReturnsDisplay.innerText = "₹" + Math.round(estimatedReturns).toLocaleString('en-IN');
        totalValueDisplay.innerText = "₹" + Math.round(totalValue).toLocaleString('en-IN');
        
        if (realFutureDisplay) {
            realFutureDisplay.innerText = "₹" + Math.round(realFutureValue).toLocaleString('en-IN');
        }

        // --- Progress Calculation (If Start Date exists) ---
        if (dateInput && dateInput.value) {
            let start = new Date(dateInput.value);
            let today = new Date();
            let nPassed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
            let effectivePassed = Math.max(0, Math.min(nPassed, n));

            if (effectivePassed > 0) {
                if (progressSection) progressSection.style.display = 'block';
                
                let valTodaySIP = r > 0 ? P * ((Math.pow(1 + r, effectivePassed) - 1) / r) * (1 + r) : P * effectivePassed;
                let valTodayLump = L * Math.pow(1 + r, effectivePassed);
                let totalToday = valTodaySIP + valTodayLump;
                let realValToday = totalToday / Math.pow(1 + inf, effectivePassed / 12);

                if (completedTenure) completedTenure.innerText = `${Math.floor(effectivePassed / 12)}y ${effectivePassed % 12}m`;
                if (valueTodayDisplay) valueTodayDisplay.innerText = "₹" + Math.round(totalToday).toLocaleString('en-IN');
                if (realValueTodayDisplay) realValueTodayDisplay.innerText = "₹" + Math.round(realValToday).toLocaleString('en-IN');
            } else {
                if (progressSection) progressSection.style.display = 'none';
            }
        }

        // Run the auto-scaler after numbers update
        autoScaleNumbers();
    }

    // Initial calculation
    calculateSIP();
    
    // Recalculate if window is resized (important for responsive font scaling)
    window.addEventListener('resize', autoScaleNumbers);
});
