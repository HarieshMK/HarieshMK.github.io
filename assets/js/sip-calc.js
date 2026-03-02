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

    // --- ENHANCED FONT SIZE ADJUSTMENT LOGIC ---
function autoScaleNumbers() {
    const numbersToScale = document.querySelectorAll('.result-item strong');
    // Reference the stable container to get the absolute maximum width allowed
    const resultsContainer = document.querySelector('.calc-results');
    if (!resultsContainer) return;

    // Use the main sidebar width minus padding as the ultimate limit
    const maxAllowedWidth = resultsContainer.getBoundingClientRect().width - 40; 

    numbersToScale.forEach(num => {
        // Reset to default starting point
        let maxFontSize = num.closest('.highlight') ? 32 : 24; 
        let fontSize = maxFontSize;
        
        num.style.display = 'inline-block';
        num.style.whiteSpace = 'nowrap';
        num.style.fontSize = maxFontSize + 'px';

        // Shrink loop: Use a while loop for absolute reliability with giant numbers
        // This forces the number to fit inside the results column, no matter what
        if (num.scrollWidth > maxAllowedWidth) {
            while (num.scrollWidth > maxAllowedWidth && fontSize > 6) {
                fontSize -= 0.5; // Fine-tuned scaling
                num.style.fontSize = fontSize + 'px';
            }
        }
        
        // Ensure the parent doesn't hide our measurement by clipping
        num.parentElement.style.overflow = 'visible';
    });
}
    function calculateSIP() {
        const P = parseFloat(monthlySIP.value) || 0;
        const L = parseFloat(lumpSumInput.value) || 0;
        const r = (parseFloat(returnRate.value) / 100) / 12;
        const n = parseFloat(yearsInput.value) * 12;
        const inf = parseFloat(inflationInput.value) / 100;

        const futureValueSIP = r > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : P * n;
        const futureValueLump = L * Math.pow(1 + r, n);
        
        const totalValue = futureValueSIP + futureValueLump;
        const totalInvested = (P * n) + L;
        const estimatedReturns = totalValue - totalInvested;
        
        const realFutureValue = totalValue / Math.pow(1 + inf, parseFloat(yearsInput.value));

        totalInvestedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        totalReturnsDisplay.innerText = "₹" + Math.round(estimatedReturns).toLocaleString('en-IN');
        totalValueDisplay.innerText = "₹" + Math.round(totalValue).toLocaleString('en-IN');
        
        if (realFutureDisplay) {
            realFutureDisplay.innerText = "₹" + Math.round(realFutureValue).toLocaleString('en-IN');
        }

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

        autoScaleNumbers();
    }

    calculateSIP();
    window.addEventListener('resize', autoScaleNumbers);
});
