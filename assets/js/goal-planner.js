console.log("PLANNER LOADED");
// goal-planner.js
(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        // 1. Element Mapping
        const els = {
            name: getEl('goal-name'),
            price: getEl('current-price'),
            priceSlider: getEl('current-price-slider'),
            years: getEl('goal-years'),
            yearsSlider: getEl('goal-years-slider'),
            inflation: getEl('goal-inflation'),
            inflationSlider: getEl('goal-inflation-slider'),
            corpus: getEl('existing-corpus'),
            corpusSlider: getEl('existing-corpus-slider'),
            returns: getEl('goal-returns'),
            returnsSlider: getEl('goal-returns-slider'),
            outCost: getEl('future-cost'),
            outGap: getEl('corpus-gap'),
            outSIP: getEl('required-sip'),
            nudge: getEl('goal-nudge')
        };

        // Check if essential elements are missing
        if (!els.price || !els.outSIP) return;

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

        function updateWordLabel(value, elementId) {
            const el = getEl(elementId);
            if (!el) return;
            let num = parseFloat(value) || 0;
            if (num >= 10000000) el.innerText = "₹" + (num / 10000000).toFixed(2) + " Cr";
            else if (num >= 100000) el.innerText = "₹" + (num / 100000).toFixed(2) + " L";
            else el.innerText = "₹" + num.toLocaleString('en-IN');
        }

        function calculate() {
            updateWordLabel(els.price.value, 'current-price-words');
            updateWordLabel(els.corpus.value, 'existing-corpus-words');

            const goalName = els.name.value || "this dream";
            if (els.nudge) els.nudge.innerHTML = `Don’t just look at the numbers, start BOSS! Your <strong>${goalName}</strong> isn't getting any cheaper. :P`;

            const price = parseFloat(els.price.value) || 0;
            const years = parseFloat(els.years.value) || 0;
            const infl = (parseFloat(els.inflation.value) || 0) / 100;
            const corp = parseFloat(els.corpus.value) || 0;
            const ret = (parseFloat(els.returns.value) || 0) / 100;
            
            const totalMonths = years * 12;
            const futureCost = price * Math.pow(1 + infl, years);
            const fvExisting = corp * Math.pow(1 + ret, years);
            const gap = Math.max(0, futureCost - fvExisting);

            let sip = 0;
            if (gap > 0 && totalMonths > 0) {
                const mRet = ret / 12;
                if (mRet > 0) sip = (gap * mRet) / ((Math.pow(1 + mRet, totalMonths) - 1) * (1 + mRet));
                else sip = gap / totalMonths;
            } else if (gap > 0 && totalMonths === 0) {
                sip = gap;
            }

            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outGap.innerText = "₹" + Math.round(gap).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        // Event Listeners
        const sync = (input, slider) => {
            input.addEventListener('input', () => { slider.value = input.value; calculate(); });
            slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
        };

        sync(els.price, els.priceSlider);
        sync(els.years, els.yearsSlider);
        sync(els.inflation, els.inflationSlider);
        sync(els.corpus, els.corpusSlider);
        sync(els.returns, els.returnsSlider);

        els.name.addEventListener('input', function() {
            const s = presets[this.value];
            if (s) {
                els.price.value = els.priceSlider.value = s.price;
                els.years.value = els.yearsSlider.value = s.years;
                els.returns.value = els.returnsSlider.value = s.returns;
                els.inflation.value = els.inflationSlider.value = s.inflation;
                calculate();
            }
        });

        calculate();
    };

    // Run on load and on Turbo-load (for Jekyll themes)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener("turbo:load", init);
})();
