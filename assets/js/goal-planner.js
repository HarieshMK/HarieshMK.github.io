(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        const els = {
            goal: getEl('goal-name'),
            price: getEl('current-price'),
            priceSlider: getEl('current-price-slider'),
            yearsSlider: getEl('goal-years-slider'),
            inflSlider: getEl('goal-inflation-slider'),
            retSlider: getEl('goal-returns-slider'),
            outCost: getEl('future-cost'),
            outSIP: getEl('required-sip'),
            nudge: getEl('goal-nudge'),
            priceText: getEl('current-price-text'),
            yVal: getEl('years-val'),
            iVal: getEl('infl-val'),
            rVal: getEl('ret-val')
        };

        const formatIndianWords = (num) => {
            if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
            if (num >= 100000) return (num / 100000).toFixed(2) + " L";
            if (num >= 1000) return (num / 1000).toFixed(2) + " K";
            return num;
        };

        const config = {
            "Own Wedding": { p: 1500000, y: 5, i: 8, r: 10, m: "Your big day, funded by smart decisions. 💍" },
            "Siblings Wedding": { p: 500000, y: 3, i: 8, r: 9, m: "Celebrate their happiness stress-free. 🥂" },
            "Emergency Fund": { p: 600000, y: 2, i: 6, r: 7, m: "Your financial shock-absorber. 🛡️" },
            "Jewelry Purchase": { p: 300000, y: 2, i: 10, r: 7, m: "Beat the gold price hike! ✨" },
            "Home Renovation": { p: 1000000, y: 4, i: 7, r: 10, m: "Modernize your sanctuary. 🔨" },
            "Home Appliances": { p: 200000, y: 2, i: 5, r: 8, m: "Smart gadgets for a smart home. 📺" },
            "School Admission": { p: 300000, y: 3, i: 12, r: 8, m: "Education inflation is high—start early! 🏫" },
            "Yearly School Fees": { p: 150000, y: 1, i: 10, r: 6, m: "Peace of mind for the whole year. 📚" },
            "Child UG India": { p: 2500000, y: 15, i: 10, r: 12, m: "Quality education is the best legacy. 🎓" },
            "Child UG Foreign": { p: 8000000, y: 15, i: 12, r: 12, m: "Global dreams need global capital. 🌍" },
            "Child PG India": { p: 2000000, y: 18, i: 10, r: 12, m: "Specialization funded today. 🏛️" },
            "Child PG Foreign": { p: 6000000, y: 18, i: 12, r: 12, m: "Fly high with a global degree. ✈️" },
            "My Own PG": { p: 2500000, y: 3, i: 10, r: 11, m: "Invest in yourself. You're the best asset. 📖" },
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "The address of your dreams is calling. 🏰" },
            "House Downpayment": { p: 2000000, y: 5, i: 7, r: 12, m: "Skip the heavy interest. 💰" },
            "New Car": { p: 1200000, y: 5, i: 5, r: 10, m: "Drive home your dream ride. 🚗" },
            "Car Downpayment": { p: 400000, y: 3, i: 5, r: 9, m: "Save the downpayment, BOSS style. 🏎️" },
            "Business Start": { p: 2000000, y: 5, i: 8, r: 12, m: "Be your own BOSS. Build your capital. 💼" },
            "Retirement Fund": { p: 50000000, y: 25, i: 6, r: 12, m: "Retire like a King/Queen. 🏝️" },
            "Health Insurance": { p: 30000, y: 1, i: 15, r: 6, m: "Health is wealth. Stay protected. 🏥" },
            "Car Insurance": { p: 20000, y: 1, i: 5, r: 6, m: "Drive protected. 🚗" },
            "Local Vacation": { p: 100000, y: 1, i: 8, r: 7, m: "Refresh and recharge. 🏔️" },
            "Foreign Vacation": { p: 700000, y: 2, i: 10, r: 8, m: "Stamp that passport! 🗽" }
        };

        function calculate() {
            if (!els.price || !els.yearsSlider) return;

            const p = parseFloat(els.price.value) || 0;
            const y = parseFloat(els.yearsSlider.value) || 0;
            const i = (parseFloat(els.inflSlider.value) || 0) / 100;
            const r = (parseFloat(els.retSlider.value) || 0) / 100;

            // Update Labels
            if(els.priceText) els.priceText.innerText = "(" + formatIndianWords(p) + ")";
            if(els.yVal) els.yVal.innerText = y;
            if(els.iVal) els.iVal.innerText = (i * 100).toFixed(1);
            if(els.rVal) els.rVal.innerText = (r * 100).toFixed(1);

            const futureCost = p * Math.pow(1 + i, y);
            const months = y * 12;
            const monthlyRate = r / 12;
            let sip = 0;

            if (futureCost > 0 && months > 0 && monthlyRate > 0) {
                sip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            if(els.outCost) els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            if(els.outSIP) els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        // Event Listeners
        if(els.price && els.priceSlider) {
            els.price.addEventListener('input', () => { els.priceSlider.value = els.price.value; calculate(); });
            els.priceSlider.addEventListener('input', () => { els.price.value = els.priceSlider.value; calculate(); });
        }
        
        [els.yearsSlider, els.inflSlider, els.retSlider].forEach(slider => {
            if(slider) slider.addEventListener('input', calculate);
        });

        if(els.goal) {
            els.goal.addEventListener('change', function() {
                const target = config[this.value];
                if (target) {
                    if(els.price) els.price.value = els.priceSlider.value = target.p;
                    if(els.yearsSlider) els.yearsSlider.value = target.y;
                    if(els.inflSlider) els.inflSlider.value = target.i;
                    if(els.retSlider) els.retSlider.value = target.r;
                    if(els.nudge) els.nudge.innerText = target.m;
                    calculate();
                }
            });
        }

        calculate();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    document.addEventListener("turbo:load", init);
})();
