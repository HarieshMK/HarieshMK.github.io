(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        const els = {
            goal: getEl('goal-name'),
            price: getEl('current-price'),
            priceSlider: getEl('current-price-slider'),
            years: getEl('goal-years'),
            yearsSlider: getEl('goal-years-slider'),
            infl: getEl('goal-inflation'),
            inflSlider: getEl('goal-inflation-slider'),
            ret: getEl('goal-returns'),
            retSlider: getEl('goal-returns-slider'),
            outCost: getEl('future-cost'),
            outSIP: getEl('required-sip'),
            nudge: getEl('goal-nudge')
        };

        const config = {
            "Dream House": { p: 8000000, y: 15, i: 7, r: 12, m: "A big house needs a big heart and a solid plan! 🏠" },
            "New Car": { p: 1200000, y: 5, i: 5, r: 10, m: "Time to get those wheels rolling! 🚗" },
            "Child Education": { p: 2500000, y: 12, i: 10, r: 12, m: "Investing in their future is the best ROI. 🎓" },
            "Foreign Vacation": { p: 600000, y: 3, i: 8, r: 8, m: "Pack your bags, the world is waiting! ✈️" },
            "Retirement": { p: 50000000, y: 25, i: 6, r: 12, m: "Future you will thank current you for this! 🏝️" }
        };

        function calculate() {
            const p = parseFloat(els.price.value) || 0;
            const y = parseFloat(els.years.value) || 0;
            const i = (parseFloat(els.infl.value) || 0) / 100;
            const r = (parseFloat(els.ret.value) || 0) / 100;

            // Future Cost = Current Price * (1 + inflation)^years
            const futureCost = p * Math.pow(1 + i, y);
            
            // SIP = (FV * monthlyRate) / ((1 + monthlyRate)^months - 1)
            let sip = 0;
            const months = y * 12;
            const monthlyRate = r / 12;

            if (futureCost > 0 && months > 0) {
                sip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        // Sync inputs and sliders
        const setupSync = (val, slide) => {
            val.addEventListener('input', () => { slide.value = val.value; calculate(); });
            slide.addEventListener('input', () => { val.value = slide.value; calculate(); });
        };

        setupSync(els.price, els.priceSlider);
        setupSync(els.years, els.yearsSlider);
        setupSync(els.infl, els.inflSlider);
        setupSync(els.ret, els.retSlider);

        // Goal Selection Logic
        els.goal.addEventListener('change', function() {
            const target = config[this.value];
            if (target) {
                els.price.value = els.priceSlider.value = target.p;
                els.years.value = els.yearsSlider.value = target.y;
                els.infl.value = els.inflSlider.value = target.i;
                els.ret.value = els.retSlider.value = target.r;
                els.nudge.innerText = target.m;
                calculate();
            }
        });

        calculate();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    document.addEventListener("turbo:load", init);
})();
