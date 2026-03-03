// goal-planner.js
(function() {
    const init = function() {
        // Remove the alert once you see it works!
        console.log("Deep Scan Initialized");

        const getEl = (id) => document.getElementById(id);
        
        // Element Mapping with fallbacks
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

        // If even the results are missing, the HTML is likely not rendered correctly
        if (!els.outSIP) {
            console.error("Calculator results container not found in HTML");
            return;
        }

        const presets = {
            "Dream House": { price: 10000000, years: 15, returns: 12, inflation: 7 },
            "Retirement Fund": { price: 50000000, years: 25, returns: 12, inflation: 6 },
            "New Car": { price: 1500000, years: 5, returns: 10, inflation: 5 },
            "House Downpayment": { price: 2000000, years: 5, returns: 12, inflation: 6 }
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
            // Safety check: ensure we have numbers
            const price = els.price ? (parseFloat(els.price.value) || 0) : 0;
            const years = els.years ? (parseFloat(els.years.value) || 0) : 0;
            const infl = els.inflation ? ((parseFloat(els.inflation.value) || 0) / 100) : 0.06;
            const corp = els.corpus ? (parseFloat(els.corpus.value) || 0) : 0;
            const ret = els.returns ? ((parseFloat(els.returns.value) || 0) / 100) : 0.12;
            
            updateWordLabel(price, 'current-price-words');
            updateWordLabel(corp, 'existing-corpus-words');

            const totalMonths = years * 12;
            const futureCost = price * Math.pow(1 + infl, years);
            const fvExisting = corp * Math.pow(1 + ret, years);
            const gap = Math.max(0, futureCost - fvExisting);

            let sip = 0;
            if (gap > 0 && totalMonths > 0) {
                const mRet = ret / 12;
                if (mRet > 0) sip = (gap * mRet) / ((Math.pow(1 + mRet, totalMonths) - 1) * (1 + mRet));
                else sip = gap / totalMonths;
            }

            // Push results to UI
            if (els.outCost) els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            if (els.outGap) els.outGap.innerText = "₹" + Math.round(gap).toLocaleString('en-IN');
            if (els.outSIP) els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
            
            if (els.nudge && els.name) {
                els.nudge.innerHTML = `Your <strong>${els.name.value || 'goal'}</strong> is waiting. Start BOSS!`;
            }
        }

        // Helper to sync Inputs and Sliders
        const sync = (input, slider) => {
            if (!input || !slider) return;
            input.addEventListener('input', () => { slider.value = input.value; calculate(); });
            slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
        };

        sync(els.price, els.priceSlider);
        sync(els.years, els.yearsSlider);
        sync(els.inflation, els.inflationSlider);
        sync(els.corpus, els.corpusSlider);
        sync(els.returns, els.returnsSlider);

        if (els.name) {
            els.name.addEventListener('change', function() {
                const s = presets[this.value];
                if (s) {
                    if (els.price) { els.price.value = s.price; if (els.priceSlider) els.priceSlider.value = s.price; }
                    if (els.years) { els.years.value = s.years; if (els.yearsSlider) els.yearsSlider.value = s.years; }
                    if (els.inflation) { els.inflation.value = s.inflation; if (els.inflationSlider) els.inflationSlider.value = s.inflation; }
                    if (els.returns) { els.returns.value = s.returns; if (els.returnsSlider) els.returnsSlider.value = s.returns; }
                    calculate();
                }
            });
        }

        calculate(); // Initial run
    };

    // Standard DOM Load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    // For Jekyll/Turbo themes
    document.addEventListener("turbo:load", init);
})();
