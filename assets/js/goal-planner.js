(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        // Element Mapping
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

        // Comprehensive Goal Configuration
        const config = {
            // Family & Life Events
            "Own Wedding": { p: 1500000, y: 5, i: 8, r: 10, m: "Your big day, funded by smart decisions. 🤵💍" },
            "Siblings Wedding": { p: 500000, y: 3, i: 8, r: 9, m: "Celebrate their happiness without financial stress. 🥂" },
            "Emergency Fund": { p: 600000, y: 2, i: 6, r: 7, m: "Sleep better at night knowing you're covered. 🛡️" },
            "Jewelry Purchase": { p: 300000, y: 2, i: 10, r: 7, m: "Sparkle more with an inflation-beating plan. ✨" },
            "Home Renovation": { p: 1000000, y: 4, i: 7, r: 10, m: "Luxury living starts with a plan. 🔨" },
            "Home Appliances": { p: 200000, y: 2, i: 5, r: 8, m: "Smart gadgets for a smart home. 📺" },

            // Education
            "School Admission": { p: 300000, y: 3, i: 12, r: 8, m: "Education inflation is high—start early! 🏫" },
            "Yearly School Fees": { p: 150000, y: 1, i: 10, r: 6, m: "The peace of mind of a paid-up year. 📚" },
            "Child UG India": { p: 2500000, y: 15, i: 10, r: 12, m: "Building the foundation for their success. 🎓" },
            "Child UG Foreign": { p: 8000000, y: 15, i: 12, r: 12, m: "Global exposure, global capital. 🌍" },
            "Child PG India": { p: 2000000, y: 18, i: 10, r: 12, m: "Mastery in India, funded today. 🏛️" },
            "Child PG Foreign": { p: 6000000, y: 18, i: 12, r: 12, m: "World-class education for your superstar. ✈️" },
            "My Own PG": { p: 2500000, y: 3, i: 10, r: 11, m: "Invest in your most valuable asset: Yourself. 📖" },

            // Assets & Business
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "A sanctuary built on a solid SIP. 🏰" },
            "House Downpayment": { p: 2000000, y: 5, i: 7, r: 12, m: "Your key to a low-interest home loan. 💰" },
            "New Car": { p: 1200000, y: 5, i: 5, r: 10, m: "Full payment for your dream ride. Drive BOSS! 🚗" },
            "Car Downpayment": { p: 400000, y: 3, i: 5, r: 9, m: "Skip the heavy EMI. Save the downpayment first! 🏎️" },
            "Business Start": { p: 2000000, y: 5, i: 8, r: 12, m: "Be the BOSS of your own venture. 💼" },
            "Retirement Fund": { p: 50000000, y: 25, i: 6, r: 12, m: "Make work optional, life intentional. 🏝️" },

            // Travel & Recurring
            "Health Insurance": { p: 30000, y: 1, i: 15, r: 6, m: "Your health is your real wealth. 🏥" },
            "Car Insurance": { p: 20000, y: 1, i: 5, r: 6, m: "Stay covered and worry-free. 🚗" },
            "Local Vacation": { p: 100000, y: 1, i: 8, r: 7, m: "Refresh and recharge. 🏔️" },
            "Foreign Vacation": { p: 700000, y: 2, i: 10, r: 8, m: "Life is short, the world is wide! 🗽" }
        };

        function calculate() {
            // Get inputs as numbers
            const p = parseFloat(els.price.value) || 0;
            const y = parseFloat(els.years.value) || 0;
            const i = (parseFloat(els.infl.value) || 0) / 100;
            const r = (parseFloat(els.ret.value) || 0) / 100;

            // 1. Calculate Future Cost (FV)
            // FV = P * (1 + i)^n
            const futureCost = p * Math.pow(1 + i, y);

            // 2. Calculate Monthly SIP
            // SIP = [FV * r] / [(1 + r)^n - 1]
            let sip = 0;
            const months = y * 12;
            const monthlyRate = r / 12;

            if (futureCost > 0 && months > 0) {
                if (monthlyRate > 0) {
                    sip = (futureCost * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
                } else {
                    sip = futureCost / months;
                }
            }

            // Update UI with Indian Formatting
            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        // Synchronize Number Inputs and Sliders
        const sync = (v, s) => {
            if(!v || !s) return;
            v.addEventListener('input', () => { s.value = v.value; calculate(); });
            s.addEventListener('input', () => { v.value = s.value; calculate(); });
        };

        sync(els.price, els.priceSlider);
        sync(els.years, els.yearsSlider);
        sync(els.infl, els.inflSlider);
        sync(els.ret, els.retSlider);

        // Handle Goal Selection
        els.goal.addEventListener('change', function() {
            const target = config[this.value];
            if (target) {
                // Update Values
                els.price.value = els.priceSlider.value = target.p;
                els.years.value = els.yearsSlider.value = target.y;
                els.infl.value = els.inflSlider.value = target.i;
                els.ret.value = els.retSlider.value = target.r;
                
                // Update Nudge Text
                els.nudge.innerText = target.m;
                
                // Trigger recalc
                calculate();
            }
        });

        // Initial Calculation on Load
        calculate();
    };

    // Standard DOM Load Handlers
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    // Support for Jekyll/Turbo themes
    document.addEventListener("turbo:load", init);
})();
