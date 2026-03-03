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
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "A big house needs a solid plan! 🏠" },
            "New Car": { p: 1500000, y: 5, i: 5, r: 10, m: "Time to get those wheels rolling! 🚗" },
            "Child Education": { p: 2500000, y: 12, i: 10, r: 12, m: "Investing in their future is the best ROI. 🎓" },
            "Foreign Vacation": { p: 700000, y: 3, i: 8, r: 8, m: "Pack your bags, the world is waiting! ✈️" },
            "Retirement Fund": { p: 50000000, y: 25, i: 6, r: 12, m: "Future you will thank current you! 🏝️" }
        };

        function calculate() {
            const p = parseFloat(els.price.value) || 0;
            const y = parseFloat(els.years.value) || 0;
            const i = (parseFloat(els.infl.value) || 0) / 100;
            const r = (parseFloat(els.ret.value) || 0) / 100;

            const futureCost = p * Math.pow(1 + i, y);
            
            let sip = 0;
            const months = y * 12;
            const monthlyRate = r / 12;

            if (futureCost > 0 && months > 0) {
                // Sinking Fund Formula
                sip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        const setupSync = (val, slide) => {
            val.addEventListener('input', () => { slide.value = val.value; calculate(); });
            slide.addEventListener('input', () => { val.value = slide.value; calculate(); });
        };

        setupSync(els.price, els.priceSlider);
        setupSync(els.years, els.yearsSlider);
        setupSync(els.infl, els.inflSlider);
        setupSync(els.ret, els.retSlider);

        // HYBRID LOGIC: Detects selection or typing
        els.goal.addEventListener('input', function() {
            const val = this.value;
            const target = config[val];
            
            if (target) {
                // If it matches a list item, update everything
                els.price.value = els.priceSlider.value = target.p;
                els.years.value = els.yearsSlider.value = target.y;
                els.infl.value = els.inflSlider.value = target.i;
                els.ret.value = els.retSlider.value = target.r;
                els.nudge.innerText = target.m;
            } else {
                // If user is typing a custom goal
                els.nudge.innerText = "Your goal won't start itself. Start BOSS! 🚀";
            }
            calculate();
        });

        calculate();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    document.addEventListener("turbo:load", init);
})();
