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
    const returnRateSlider = document.getElementById('goal-returns-slider');

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

    // --- NEW UTILITY: WORD LABEL (Moved outside of syncInputs) ---
    function updateWordLabel(value, elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let num = parseFloat(value) || 0;
        if (num >= 10000000) {
            el.innerText = "₹" + (num / 10000000).toFixed(2) + " Cr";
        } else if (num >= 100000) {
            el.innerText = "₹" + (num / 100000).toFixed(2) + " L";
        } else {
            el.innerText = "₹" + num.toLocaleString('en-IN');
        }
    }

    // Initialize Sync for all pairs
    syncInputs(currentPriceInput, currentPriceSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(inflationInput, inflationSlider);
    syncInputs(existingCorpusInput, existingCorpusSlider);
    syncInputs(returnRateInput, returnRateSlider);

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
        // 1. Update Word Labels
        updateWordLabel(currentPriceInput.value, 'current-price-words');
        updateWordLabel(existingCorpusInput.value, 'existing-corpus-words');

        // 2. Get Values
        const currentPrice = parseFloat(currentPriceInput.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;
        const inflation = (parseFloat(inflationInput.value) || 0) / 100;
        const existingCorpus = parseFloat(existingCorpusInput.value) || 0;
        const annualReturn = (parseFloat(returnRateInput.value) || 0) / 100;
        
        const monthlyReturn = annualReturn / 12;
        const totalMonths = years * 12;

        // 3. Calculate Future Cost (Adjusted for Inflation)
        const futureCost = currentPrice * Math.pow(1 + inflation, years);

        // 4. Calculate Future Value of Existing Corpus
        const fvExisting = existingCorpus * Math.pow(1 + annualReturn, years);

        // 5. Calculate the Gap
        const gap = Math.max(0, futureCost - fvExisting);

        // 6. Calculate Required Monthly SIP
        let requiredSIP = 0;
        if (gap > 0 && totalMonths > 0) {
            if (monthlyReturn > 0) {
                requiredSIP = (gap * monthlyReturn) / ((Math.pow(1 + monthlyReturn, totalMonths) - 1) * (1 + monthlyReturn));
            } else {
                requiredSIP = gap / totalMonths;
            }
        }

        // 7. Display Results
        futureCostDisplay.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
        corpusGapDisplay.innerText = "₹" + Math.round(gap).toLocaleString('en-IN');
        requiredSIPDisplay.innerText = "₹" + Math.round(requiredSIP).toLocaleString('en-IN');

        autoScaleNumbers();
    }

    // Initial calculation and resize listener
    calculateGoal();
    window.addEventListener('resize', autoScaleNumbers);
});
