document.addEventListener('DOMContentLoaded', function() {
    // 1. SELECT ALL ELEMENTS
    const goalNameInput = document.getElementById('goal-name');
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

    const futureCostDisplay = document.getElementById('future-cost');
    const corpusGapDisplay = document.getElementById('corpus-gap');
    const requiredSIPDisplay = document.getElementById('required-sip');

    // 2. PRESETS DATA (Matches your MD list exactly)
    const presets = {
        "Dream House": { price: 10000000, years: 15, returns: 12, inflation: 7 },
        "House Downpayment": { price: 2000000, years: 5, returns: 12, inflation: 6 },
        "Home Renovation": { price: 800000, years: 3, returns: 10, inflation: 8 },
        "New Car": { price: 1500000, years: 5, returns: 10, inflation: 5 },
        "Car Downpayment": { price: 300000, years: 2, returns: 8, inflation: 5 },
        "Jewelry Purchase": { price: 500000, years: 4, returns: 12, inflation: 8 },
        "Own Wedding": { price: 2500000, years: 5, returns: 12, inflation: 8 },
        "Sibling's Wedding": { price: 1000000, years: 4, returns: 10, inflation: 8 },
        "Starting a Business": { price: 2000000, years: 5, returns: 12, inflation: 6 },
        "Child's School Admission": { price: 300000, years: 3, returns: 10, inflation: 12 },
        "Child's Yearly School Fees": { price: 200000, years: 1, returns: 7, inflation: 10 },
        "Child's UG (India)": { price: 2500000, years: 12, returns: 12, inflation: 10 },
        "Child's UG (Foreign)": { price: 8000000, years: 12, returns: 12, inflation: 12 },
        "Child's PG (India)": { price: 1500000, years: 15, returns: 12, inflation: 10 },
        "Child's PG (Foreign)": { price: 6000000, years: 15, returns: 12, inflation: 12 },
        "My Own PG/MBA (India)": { price: 2000000, years: 4, returns: 10, inflation: 10 },
        "My Own PG/MBA (Foreign)": { price: 5000000, years: 4, returns: 10, inflation: 12 },
        "Local Vacation": { price: 100000, years: 1, returns: 7, inflation: 8 },
        "Foreign Vacation": { price: 700000, years: 3, returns: 10, inflation: 10 },
        "Health Insurance (Yearly)": { price: 25000, years: 1, returns: 7, inflation: 15 },
        "Car Insurance (Yearly)": { price: 30000, years: 1, returns: 7, inflation: 5 },
        "Retirement Fund": { price: 50000000, years: 25, returns: 12, inflation: 6 }
    };

    // --- PRESET LISTENER ---
    goalNameInput.addEventListener('input', function() {
        const selected = presets[this.value];
        if (selected) {
            currentPriceInput.value = selected.price;
            currentPriceSlider.value = selected.price;
            yearsInput.value = selected.years;
            yearsSlider.value = selected.years;
            returnRateInput.value = selected.returns;
            returnRateSlider.value = selected.returns;
            inflationInput.value = selected.inflation;
            inflationSlider.value = selected.inflation;
            calculateGoal(); 
        }
    });

    // --- UTILITIES ---
    function syncInputs(input, slider) {
        if(!input || !slider) return;
        input.addEventListener('input', () => { slider.value = input.value; calculateGoal(); });
        slider.addEventListener('input', () => { input.value = slider.value; calculateGoal(); });
    }

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

    // --- CORE MATH ---
    function calculateGoal() {
        updateWordLabel(currentPriceInput.value, 'current-price-words');
        updateWordLabel(existingCorpusInput.value, 'existing-corpus-words');

        // Dynamic "Start BOSS" Nudge
        const goalName = goalNameInput.value || "this dream";
        const nudgeElement = document.querySelector('.calc-disclaimer p:nth-child(2)');
        if (nudgeElement) {
            nudgeElement.innerHTML = `Don’t just look at the numbers, start BOSS! Your <strong>${goalName}</strong> isn't getting any cheaper. :P`;
        }

        const currentPrice = parseFloat(currentPriceInput.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;
        const inflation = (parseFloat(inflationInput.value) || 0) / 100;
        const existingCorpus = parseFloat(existingCorpusInput.value) || 0;
        const annualReturn = (parseFloat(returnRateInput.value) || 0) / 100;
        
        const monthlyReturn = annualReturn / 12;
        const totalMonths = years * 12;

        const futureCost = currentPrice * Math.pow(1 + inflation, years);
        const fvExisting = existingCorpus * Math.pow(1 + annualReturn, years);
        const gap = Math.max(0, futureCost - fvExisting);

        let requiredSIP = 0;
        if (gap > 0 && totalMonths > 0) {
            if (monthlyReturn > 0) {
                requiredSIP = (gap * monthlyReturn) / ((Math.pow(1 + monthlyReturn, totalMonths) - 1) * (1 + monthlyReturn));
            } else {
                requiredSIP = gap / totalMonths;
            }
        }

        futureCostDisplay.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
        corpusGapDisplay.innerText = "₹" + Math.round(gap).toLocaleString('en-IN');
        requiredSIPDisplay.innerText = "₹" + Math.round(requiredSIP).toLocaleString('en-IN');

        autoScaleNumbers();
    }

    // Initialize
    syncInputs(currentPriceInput, currentPriceSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(inflationInput, inflationSlider);
    syncInputs(existingCorpusInput, existingCorpusSlider);
    syncInputs(returnRateInput, returnRateSlider);

    calculateGoal();
    window.addEventListener('resize', autoScaleNumbers);
});
