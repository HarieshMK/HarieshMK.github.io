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
    const resultsContainer = document.querySelector('.calc-results');
    if (!resultsContainer) return;

    // Use the sidebar's actual width minus a safety margin for padding
    const maxAllowedWidth = resultsContainer.getBoundingClientRect().width - 30; 

    numbersToScale.forEach(num => {
        // Start at the maximum allowed size
        let maxFontSize = num.closest('.highlight') ? 32 : 24; 
        let fontSize = maxFontSize;
        
        num.style.fontSize = fontSize + 'px';
        num.style.display = 'inline-block';
        num.style.whiteSpace = 'nowrap';

        // Aggressive shrink loop for those massive numbers
        if (num.scrollWidth > maxAllowedWidth) {
            while (num.scrollWidth > maxAllowedWidth && fontSize > 6) {
                fontSize -= 0.5; // Fine-tuning for a perfect fit
                num.style.fontSize = fontSize + 'px';
            }
        }
        
        // Ensure the container doesn't clip the numbers while scaling
        num.parentElement.style.overflow = 'visible';
    });
}
    
    function calculateSIP() {
        // Ensure the engine is loaded
        if (typeof FinanceEngine === 'undefined') {
            console.error("FinanceEngine is not loaded! Check your script tags.");
            return;
        }

        const P = parseFloat(monthlySIP.value) || 0;
        const L = parseFloat(lumpSumInput.value) || 0;
        const annualR = parseFloat(returnRate.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;
        const inf = parseFloat(inflationInput.value) || 0;

        // Debugging: Right-click your page -> Inspect -> Console to see these
        console.log("Inputs:", {P, L, annualR, years});

        // 1. Core Future Value
        const results = FinanceEngine.calculateFutureValue(P, L, annualR, years);
        
        // 2. Real Value (Inflation adjusted)
        const realFutureValue = FinanceEngine.adjustForInflation(results.totalValue, inf, years);

        // UI UPDATES
        totalInvestedDisplay.innerText = "₹" + FinanceEngine.formatIndian(results.totalInvested);
        totalReturnsDisplay.innerText = "₹" + FinanceEngine.formatIndian(results.estimatedReturns);
        totalValueDisplay.innerText = "₹" + FinanceEngine.formatIndian(results.totalValue);
        
        if (realFutureDisplay) {
            realFutureDisplay.innerText = "₹" + FinanceEngine.formatIndian(realFutureValue);
        }

        // 3. Progress Section Logic
        if (dateInput && dateInput.value && progressSection) {
            let start = new Date(dateInput.value);
            let today = new Date();
            let nPassed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
            let monthsTotal = years * 12;
            let effectivePassed = Math.max(0, Math.min(nPassed, monthsTotal));

            if (effectivePassed > 0) {
                progressSection.style.display = 'block';
                const progressResults = FinanceEngine.calculateFutureValue(P, L, annualR, effectivePassed / 12);
                const realValToday = FinanceEngine.adjustForInflation(progressResults.totalValue, inf, effectivePassed / 12);

                if (completedTenure) completedTenure.innerText = `${Math.floor(effectivePassed / 12)}y ${effectivePassed % 12}m`;
                if (valueTodayDisplay) valueTodayDisplay.innerText = "₹" + FinanceEngine.formatIndian(progressResults.totalValue);
                if (realValueTodayDisplay) realValueTodayDisplay.innerText = "₹" + FinanceEngine.formatIndian(realValToday);
            } else {
                progressSection.style.display = 'none';
            }
        }

        autoScaleNumbers();
    }
