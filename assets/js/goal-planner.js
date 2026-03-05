(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        // 1. Mapped all elements (Dates, Numbers, Sliders)
        const els = {
            goal: getEl('goal-name'),
            startD: getEl('start-date'),
            targetD: getEl('target-date'),
            price: getEl('current-price'),
            priceS: getEl('current-price-slider'),
            corpus: getEl('existing-corpus'),
            corpusS: getEl('existing-corpus-slider'),
            corpRet: getEl('corpus-returns'),
            corpRetS: getEl('corpus-returns-slider'),
            sipRet: getEl('goal-returns'),
            sipRetS: getEl('goal-returns-slider'),
            infl: getEl('goal-inflation'),
            inflS: getEl('goal-inflation-slider'),
            // Outputs
            outCost: getEl('future-cost'),
            outSIP: getEl('required-sip'),
            nudge: getEl('goal-nudge'),
            deadlineD: getEl('deadline-date'),
            timeLeft: getEl('time-left'),
            totalDur: getEl('total-duration'),
            riskL: getEl('risk-label')
        };

        // Initialize Dates (Start: Today, Target: Today + 5 years)
        const today = new Date();
        const defaultFuture = new Date();
        defaultFuture.setFullYear(today.getFullYear() + 5);
        if(els.startD) els.startD.value = today.toISOString().split('T')[0];
        if(els.targetD) els.targetD.value = defaultFuture.toISOString().split('T')[0];

        const formatIndian = (num) => {
            if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
            if (num >= 100000) return (num / 100000).toFixed(2) + " L";
            return Math.round(num).toLocaleString('en-IN');
        };

        const config = {
    // Family & Life
    "Own Wedding": { p: 1500000, r: 12, i: 8, m: "Your big day, funded by smart decisions. 💍" },
    "Siblings Wedding": { p: 500000, r: 10, i: 8, m: "Celebrate their happiness stress-free. 🥂" },
    "Emergency Fund": { p: 600000, r: 8, i: 6, m: "Your financial shock-absorber. 🛡️" },
    "Jewelry Purchase": { p: 300000, r: 8, i: 10, m: "Beat the gold price hike! ✨" },
    "Home Renovation": { p: 1000000, r: 12, i: 7, m: "Modernize your sanctuary. 🔨" },
    "Home Appliances": { p: 200000, r: 9, i: 5, m: "Smart gadgets for a smart home. 📺" },

    // Education
    "School Admission": { p: 300000, r: 10, i: 12, m: "Education inflation is high—start early! 🏫" },
    "Yearly School Fees": { p: 150000, r: 8, i: 10, m: "Peace of mind for the whole year. 📚" },
    "Child UG India": { p: 2500000, r: 12, i: 10, m: "Quality education is the best legacy. 🎓" },
    "Child UG Foreign": { p: 8000000, r: 13, i: 12, m: "Global dreams need global capital. 🌍" },
    "Child PG India": { p: 2000000, r: 12, i: 10, m: "Specialization funded today. 🏛️" },
    "Child PG Foreign": { p: 6000000, r: 13, i: 12, m: "Fly high with a global degree. ✈️" },
    "My Own PG": { p: 2500000, r: 11, i: 10, m: "Invest in yourself. You're the best asset. 📖" },

    // Assets & Business
    "Dream House": { p: 10000000, r: 12, i: 7, m: "The address of your dreams is calling. 🏰" },
    "House Downpayment": { p: 2000000, r: 12, i: 7, m: "Skip the heavy interest. 💰" },
    "New Car": { p: 1200000, r: 10, i: 5, m: "Drive home your dream ride. 🚗" },
    "Car Downpayment": { p: 400000, r: 9, i: 5, m: "Save the downpayment, BOSS style. 🏎️" },
    "Business Start": { p: 2000000, r: 13, i: 8, m: "Be your own BOSS. Build your capital. 💼" },
    "Retirement Fund": { p: 10000000, r: 12, i: 6, m: "Retire like a King/Queen. 🏝️" },

    // Travel & Recurring
    "Health Insurance": { p: 30000, r: 7, i: 15, m: "Health is wealth. Stay protected. 🏥" },
    "Car Insurance": { p: 20000, r: 7, i: 5, m: "Drive protected. 🚗" },
    "Local Vacation": { p: 100000, r: 8, i: 8, m: "Refresh and recharge. 🏔️" },
    "Foreign Vacation": { p: 700000, r: 9, i: 10, m: "Stamp that passport! 🗽" }
};

        function calculate(isManualCorpRet = false) {
            if (!els.startD || !els.targetD || !els.price) return;

            const d1 = new Date(els.startD.value);
            const d2 = new Date(els.targetD.value);
            const now = new Date();

            // 1. Time Calculations
            let totalYears = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
            totalYears = Math.max(0.1, totalYears);

            let remainingMs = d2 - now;
            let daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
            let yearsRemaining = Math.max(0.08, daysLeft / 365.25); // Min 1 month

            // 2. Countdown UI
            if (els.deadlineD) {
                els.deadlineD.innerText = d2.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' });
                if (daysLeft > 0) {
                    const monthsLeft = Math.floor(daysLeft / 30.44);
                    const remDays = daysLeft % 30;
                    els.timeLeft.innerText = `${monthsLeft} Months, ${remDays} Days left`;
                    els.totalDur.innerText = `Total Journey: ${totalYears.toFixed(1)} Years`;
                } else {
                    els.timeLeft.innerText = "Goal Date Reached! 🏁";
                }
            }

            // 3. Financial Inputs
            const p = parseFloat(els.price.value) || 0;
            const existing = parseFloat(els.corpus.value) || 0;
            const inflation = (parseFloat(els.infl.value) || 0) / 100;
            const rSIP = (parseFloat(els.sipRet.value) || 0) / 100;

            // Auto-adjust Corpus Return based on time remaining
            if (!isManualCorpRet) {
                let rate = 10; let label = "(Aggressive)";
                if (yearsRemaining < 4) { rate = 6; label = "(Safe)"; }
                else if (yearsRemaining <= 7) { rate = 8; label = "(Moderate)"; }
                els.corpRet.value = els.corpRetS.value = rate;
                if(els.riskL) els.riskL.innerText = label;
            }
            const rCorp = (parseFloat(els.corpRet.value) || 0) / 100;

            // 4. THE MATH
            const futureCost = p * Math.pow(1 + inflation, totalYears);
            const grownSavings = existing * Math.pow(1 + rCorp, totalYears);
            const gap = Math.max(0, futureCost - grownSavings);

            const mRate = rSIP / 12;
            const monthsRemaining = yearsRemaining * 12;
            let sip = 0;

            if (gap > 0 && mRate > 0) {
                sip = (gap * mRate) / (Math.pow(1 + mRate, monthsRemaining) - 1);
            }

            // 5. Results UI
            els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
            
            getEl('current-price-text').innerText = "(" + formatIndian(p) + ")";
            getEl('existing-corpus-text').innerText = "(" + formatIndian(existing) + ")";
        }

        // Sync Helper
        const setupSync = (input, slider, isCorp = false) => {
            if(!input || !slider) return;
            input.addEventListener('input', () => { slider.value = input.value; calculate(isCorp); });
            slider.addEventListener('input', () => { input.value = slider.value; calculate(isCorp); });
        };

        // Link everything
        setupSync(els.price, els.priceS);
        setupSync(els.corpus, els.corpusS);
        setupSync(els.corpRet, els.corpRetS, true);
        setupSync(els.sipRet, els.sipRetS);
        setupSync(els.infl, els.inflS);

        els.startD.addEventListener('change', () => calculate(false));
        els.targetD.addEventListener('change', () => calculate(false));

        if(els.goal) {
            els.goal.addEventListener('change', function() {
                const target = config[this.value];
                if (target) {
                    els.price.value = els.priceS.value = target.p;
                    els.sipRet.value = els.sipRetS.value = target.r;
                    els.infl.value = els.inflS.value = target.i;
                    if(els.nudge) els.nudge.innerText = target.m;
                    calculate(false);
                }
            });
        }

        calculate();
    };

    init();
})();
