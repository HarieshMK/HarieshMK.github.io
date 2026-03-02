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
        input.addEventListener('input', () => { slider.value = input.value; calculateSIP(); });
        slider.addEventListener('input', () => { input.value = slider.value; calculateSIP(); });
    }

    syncInputs(monthlySIP, monthlySlider);
    syncInputs(returnRate, returnSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(lumpSumInput, lumpSumSlider);
    syncInputs(inflationInput, inflationSlider);
    dateInput.addEventListener('change', calculateSIP);

    function calculateSIP() {
        const P = parseFloat(monthlySIP.value) || 0;
        const L = parseFloat(lumpSumInput.value) || 0;
        const r = parseFloat(returnRate.value) / 100 / 12;
        const n = parseFloat(yearsInput.value) * 12;
        const inf = parseFloat(inflationInput.value) / 100;

        // Future Calculation
        const futureValueSIP = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const futureValueLump = L * Math.pow(1 + r, n);
        const totalValue = futureValueSIP + futureValueLump;
        const totalInvested = (P * n) + L;
        const realFutureValue = totalValue / Math.pow(1 + inf, parseFloat(yearsInput.value));

        // Update Future UI
        totalInvestedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        totalReturnsDisplay.innerText = "₹" + Math.round(totalValue - totalInvested).toLocaleString('en-IN');
        totalValueDisplay.innerText = "₹" + Math.round(totalValue).toLocaleString('en-IN');
        realFutureDisplay.innerText = "₹" + Math.round(realFutureValue).toLocaleString('en-IN');

        // Current Progress Logic
        const startDateValue = dateInput.value;
        if (startDateValue) {
            let start = new Date(startDateValue);
            let today = new Date();
            let nPassed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
            
            // Proposal Fix: Cap the calculation to selected Tenure
            let effectivePassed = Math.max(0, Math.min(nPassed, n));

            if (effectivePassed > 0) {
                progressSection.style.display = 'block';
                let valTodaySIP = P * ((Math.pow(1 + r, effectivePassed) - 1) / r) * (1 + r);
                let valTodayLump = L * Math.pow(1 + r, effectivePassed);
                let totalToday = valTodaySIP + valTodayLump;
                
                let realValToday = inf > 0 ? totalToday / Math.pow(1 + inf, effectivePassed / 12) : totalToday;

                completedTenure.innerText = `${Math.floor(effectivePassed / 12)}y ${effectivePassed % 12}m` + (nPassed > n ? " (Max)" : "");
                valueTodayDisplay.innerText = "₹" + Math.round(totalToday).toLocaleString('en-IN');
                realValueTodayDisplay.innerText = "₹" + Math.round(realValToday).toLocaleString('en-IN');
            } else {
                progressSection.style.display = 'none';
            }
        } else {
            progressSection.style.display = 'none';
        }
    }

    calculateSIP();
});

function adjustFontSize(element, originalSize) {
    const parentWidth = element.parentElement.clientWidth;
    let currentSize = originalSize;
    
    // Reset to original first to recalculate
    element.style.fontSize = originalSize + 'rem';
    
    // While the number is wider than the box, reduce font size
    while (element.scrollWidth > parentWidth && currentSize > 0.6) {
        currentSize -= 0.05;
        element.style.fontSize = currentSize + 'rem';
    }
}

// Update your existing updateResults() function to call this:
function updateUI() {
    // ... your existing calculation code ...

    const numbersToScale = document.querySelectorAll('.result-item strong');
    numbersToScale.forEach(num => {
        // Use 1.6rem for the highlight box, 1.35rem for others
        const baseSize = num.closest('.highlight') ? 1.6 : 1.35;
        adjustFontSize(num, baseSize);
    });
}
