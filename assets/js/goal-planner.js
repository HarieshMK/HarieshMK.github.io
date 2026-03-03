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
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "A big house needs a big plan! 🏠" },
            "New Car": { p: 1500000, y: 5, i: 5, r: 10, m: "Time to get those wheels rolling! 🚗" },
            "Child Education": { p: 3000000, y: 12, i: 10, r: 12, m: "The best investment is their future. 🎓" },
            "Foreign Vacation": { p: 800000, y: 3, i: 8, r: 8, m: "The world is waiting for you! ✈️" },
            "Retirement Fund": { p: 50000000, y: 25, i: 6, r: 12, m: "Future you will thank current you! 🏝️" },
            "Custom": { p: 500000, y: 5, i: 6, r: 12, m: "Your goal won't start itself. Start BOSS! 🚀" }
        };

        function calculate() {
            const p = parseFloat(els.price.value) || 0;
            const y = parseFloat(els.years.value) || 0;
            const i = (parseFloat(els.infl.value) || 0) / 100;
            const r = (parseFloat(els.ret.value) || 0) / 100;

            const futureCost = p * Math.pow(1 + i, y);
            const months = y * 12;
            const monthlyRate = r / 12;
            let sip = 0;

            if (futureCost > 0 && months > 0) {
                sip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        const sync = (v, s) => {
            v.addEventListener('input', () => { s.value = v.value; calculate(); });
            s.addEventListener('input', () => { v.value = s.value; calculate(); });
        };

        sync(els.price, els.priceSlider);
        sync(els.years, els.yearsSlider);
        sync(els.infl, els.inflSlider);
        sync(els.ret, els.retSlider);

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
