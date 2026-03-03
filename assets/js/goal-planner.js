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
            // Family & Life
            "Own Wedding": { p: 1500000, y: 5, i: 8, r: 10, m: "Plan the perfect day without any debt! 💍" },
            "Siblings Wedding": { p: 500000, y: 3, i: 8, r: 9, m: "The best sibling needs the best-funded plan! 🥂" },
            "Emergency Fund": { p: 600000, y: 2, i: 6, r: 7, m: "Your financial shock-absorber. Safe & secure. 🛡️" },
            "Jewelry Purchase": { p: 300000, y: 2, i: 10, r: 7, m: "Beat the gold price hike before it happens! ✨" },
            "Home Renovation": { p: 1000000, y: 4, i: 7, r: 10, m: "Modernize your sanctuary. 🔨" },
            "Home Appliances": { p: 200000, y: 2, i: 5, r: 8, m: "Upgrade to the latest tech, cash-rich! 📺" },

            // Education
            "School Admission": { p: 300000, y: 3, i: 12, r: 8, m: "First steps are big steps. Plan ahead. 🏫" },
            "Yearly School Fees": { p: 150000, y: 1, i: 10, r: 6, m: "Beat the school fee hike with ease. 📚" },
            "Child UG India": { p: 2500000, y: 15, i: 10, r: 12, m: "Quality education is the best legacy. 🎓" },
            "Child UG Foreign": { p: 8000000, y: 15, i: 12, r: 12, m: "Global dreams need global-sized savings! 🌍" },
            "Child PG India": { p: 2000000, y: 18, i: 10, r: 12, m: "Specialization in India. Built with a plan. 🏛️" },
            "Child PG Foreign": { p: 6000000, y: 18, i: 12, r: 12, m: "Fly high with a world-class degree. ✈️" },
            "My Own PG": { p: 1500000, y: 4, i: 10, r: 11, m: "Invest in yourself. You are the best asset. 📖" },

            // Assets
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "The address of your dreams is calling. 🏰" },
            "House Downpayment": { p: 2000000, y: 5, i: 7, r: 12, m: "Save the downpayment, skip the heavy interest! 💰" },
            "Car Downpayment": { p: 500000, y: 3, i: 6, r: 9, m: "Drive home your dream car, BOSS style. 🏎️" },
            "Business Start": { p: 2000000, y: 5, i: 8, r: 12, m: "Be your own BOSS. Build your seed capital. 💼" },
            "Retirement Fund": { p: 50000000, y: 25, i: 6, r: 12, m: "Freedom is the goal. Retirement is just the date. 🏝️" },

            // Travel & Recurring
            "Health Insurance": { p: 30000, y: 1, i: 15, r: 6, m: "Health is wealth. Don't let bills eat your life. 🏥" },
            "Car Insurance": { p: 20000, y: 1, i: 5, r: 6, m: "Stay covered and worry-free. 🚗" },
            "Local Vacation": { p: 100000, y: 1, i: 8, r: 7, m: "Explore the beauty around you. 🏔️" },
            "Foreign Vacation": { p: 700000, y: 2, i: 10, r: 8, m: "Collect moments, not things. Stamp that passport! 🗽" }
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
            if(!v || !s) return;
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
