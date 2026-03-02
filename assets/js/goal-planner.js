document.addEventListener('DOMContentLoaded', function() {
    // Inputs
    const currentPriceInput = document.getElementById('current-price');
    const currentPriceSlider = document.getElementById('current-price-slider');
    const yearsInput = document.getElementById('goal-years');
    const yearsSlider = document.getElementById('goal-years-slider');
    const inflationInput = document.getElementById('goal-inflation');
    const inflationSlider = document.getElementById('goal-inflation-slider');
    const existingCorpusInput = document.getElementById('existing-corpus');
    const existingCorpusSlider = document.getElementById('existing-corpus-slider');
    const returnRateInput = document.getElementById('goal-returns');
    const returnRateSlider = document.getElementById('return-rate-slider'); // Note: ensure ID match in HTML

    // Outputs
    const futureCostDisplay = document.getElementById('future-cost');
    const corpusGapDisplay = document.getElementById('corpus-gap');
    const requiredSIPDisplay = document.getElementById('required-sip');

    // --- SHARED UTILITY: INPUT SYNC ---
    function syncInputs(input, slider) {
        if(!input || !slider) return;
        input.addEventListener('input', () => { 
            slider.value = input.value; 
            calculateGoal(); 
        });
        slider.addEventListener('input', () => { 
            input.value = slider.value; 
            calculateGoal(); 
        });
    }

    // Initialize Sync for all pairs
    syncInputs(currentPriceInput, currentPriceSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(inflationInput, inflationSlider);
    syncInputs(existingCorpusInput, existingCorpusSlider);
    syncInputs(document.getElementById('goal-returns'), document.getElementById('goal-returns-slider'));

    // --- SHARED UTILITY: FONT SCALING ---
    function autoScaleNumbers() {
        const numbersToScale = document.querySelectorAll('.result-item strong');
        const resultsContainer = document.querySelector('.calc-results');
        if (!resultsContainer) return;

        const maxAllowedWidth = resultsContainer.getBoundingClientRect().width - 40; 

        numbersToScale.forEach(num => {
            let maxFontSize = num.closest('.highlight') ? 32 : 24; 
            let fontSize = maxFontSize;
            num.style.fontSize = fontSize + 'px';

            if (num.scrollWidth > maxAllowedWidth) {
                while (num.scrollWidth > maxAllowedWidth && fontSize > 8) {
                    fontSize -= 0.5;
                    num.style.fontSize = fontSize + 'px';
                }
            }
        });
    }

    // --- THE CORE MATH ---
    function calculateGoal() {
        // 1. Get Values
        const currentPrice = parseFloat(currentPriceInput.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;
        const inflation = (parseFloat(inflationInput.value) || 0) / 100;
        const existingCorpus = parseFloat(existingCorpusInput.value) || 0;
        const annualReturn = (parseFloat(document.getElementById('goal-returns').value) || 0) / 100;
        
        const monthlyReturn = annualReturn / 12;
        const totalMonths = years * 12;

        // 2. Calculate Future Cost (Adjusted for Inflation)
        // Formula: FV = PV * (1 + r)^n
        const futureCost = currentPrice * Math.pow(1 + inflation, years);

        // 3. Calculate Future Value of Existing Corpus
        const fvExisting = existingCorpus * Math.pow(1 + annualReturn, years);

        // 4. Calculate the Gap
        const gap = Math.max(0, futureCost - fvExisting);

        // 5. Calculate Required Monthly SIP
        // Formula: P = (Gap * r) / [((1 + r)^n - 1) * (1 + r)]
        let requiredSIP = 0;
        if (gap > 0 && totalMonths > 0) {
            if (monthlyReturn > 0) {
                requiredSIP = (gap * monthlyReturn) / ((Math.pow(1 + monthlyReturn, totalMonths) - 1) * (1 + monthlyReturn));
            } else {
                requiredSIP = gap / totalMonths;
            }
        }

        // 6. Display Results
        futureCostDisplay.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
        corpusGapDisplay.innerText = "₹" + Math.round(gap).toLocaleString('en-IN');
        requiredSIPDisplay.innerText = "₹" + Math.round(requiredSIP).toLocaleString('en-IN');

        autoScaleNumbers();
    }

    // Initial calculation and resize listener
    calculateGoal();
    window.addEventListener('resize', autoScaleNumbers);
});
