(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
        const els = {
            goal: getEl('goal-name'),
            price: getEl('current-price'),
            priceSlider: getEl('current-price-slider'),
            corpus: getEl('existing-corpus'),
            corpusSlider: getEl('existing-corpus-slider'),
            corpusRetSlider: getEl('corpus-returns-slider'),
            yearsSlider: getEl('goal-years-slider'),
            inflSlider: getEl('goal-inflation-slider'),
            retSlider: getEl('goal-returns-slider'),
            outCost: getEl('future-cost'),
            outSIP: getEl('required-sip'),
            nudge: getEl('goal-nudge'),
            priceText: getEl('current-price-text'),
            corpusText: getEl('existing-corpus-text'),
            yVal: getEl('years-val'),
            iVal: getEl('infl-val'),
            rVal: getEl('ret-val'),
            crVal: getEl('corpus-ret-val'),
            riskLabel: getEl('risk-label')
        };

        const formatIndianWords = (num) => {
            if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
            if (num >= 100000) return (num / 100000).toFixed(2) + " L";
            // Indian Comma system for everything else
            return Math.round(num).toLocaleString('en-IN');
        };

        const getAutoReturn = (years) => {
            if (years < 4) return { rate: 6, label: "(Low Risk)" };
            if (years <= 7) return { rate: 8, label: "(Moderate)" };
            return { rate: 10, label: "(Aggressive)" };
        };

        const config = {
            "Own Wedding": { p: 1500000, y: 5, i: 8, r: 10, m: "Your big day, funded by smart decisions. 💍" },
            "Siblings Wedding": { p: 500000, y: 3, i: 8, r: 9, m: "Celebrate their happiness stress-free. 🥂" },
            "Emergency Fund": { p: 600000, y: 2, i: 6, r: 7, m: "Your financial shock-absorber. 🛡️" },
            "Jewelry Purchase": { p: 300000, y: 2, i: 10, r: 7, m: "Beat the gold price hike! ✨" },
            "Home Renovation": { p: 1000000, y: 4, i: 7, r: 10, m: "Modernize your sanctuary. 🔨" },
            "Home Appliances": { p: 200000, y: 2, i: 5, r: 8, m: "Smart gadgets for a smart home. 📺" },
            "School Admission": { p: 300000, y: 3, i: 12, r: 8, m: "Education inflation is high! 🏫" },
            "Yearly School Fees": { p: 150000, y: 1, i: 10, r: 6, m: "Peace of mind for the year. 📚" },
            "Child UG India": { p: 2500000, y: 15, i: 10, r: 12, m: "Quality education foundation. 🎓" },
            "Child UG Foreign": { p: 8000000, y: 15, i: 12, r: 12, m: "Global dreams need capital. 🌍" },
            "Child PG India": { p: 2000000, y: 18, i: 10, r: 12, m: "Specialization funded today. 🏛️" },
            "Child PG Foreign": { p: 6000000, y: 18, i: 12, r: 12, m: "Fly high with a global degree. ✈️" },
            "My Own PG": { p: 2500000, y: 3, i: 10, r: 11, m: "Invest in yourself. 📖" },
            "Dream House": { p: 10000000, y: 15, i: 7, r: 12, m: "Your dream home is calling. 🏰" },
            "House Downpayment": { p: 2000000, y: 5, i: 7, r: 12, m: "Skip the heavy interest. 💰" },
            "New Car": { p: 1200000, y: 5, i: 5, r: 10, m: "Drive home your dream ride. 🚗" },
            "Car Downpayment": { p: 400000, y: 3, i: 5, r: 9, m: "Save the downpayment, BOSS style. 🏎️" },
            "Business Start": { p: 2000000, y: 5, i: 8, r: 12, m: "Be your own BOSS. 💼" },
            "Retirement Fund": { p: 10000000, y: 25, i: 6, r: 12, m: "Retire like a King/Queen. 🏝️" },
            "Health Insurance": { p: 30000, y: 1, i: 15, r: 6, m: "Health is wealth. 🏥" },
            "Car Insurance": { p: 20000, y: 1, i: 5, r: 6, m: "Stay covered. 🚗" },
            "Local Vacation": { p: 100000, y: 1, i: 8, r: 7, m: "Refresh and recharge. 🏔️" },
            "Foreign Vacation": { p: 700000, y: 2, i: 10, r: 8, m: "Stamp that passport! 🗽" }
        };

        function calculate(isManualCorpusReturn = false) {
            // Safety Check: if elements are missing, don't crash the script
            if (!els.price || !els.yearsSlider || !els.inflSlider || !els.retSlider) return;

            const p = parseFloat(els.price.value) || 0;
            const existing = parseFloat(els.corpus.value) || 0;
            const y = parseFloat(els.yearsSlider.value) || 0;
            const i = (parseFloat(els.inflSlider.value) || 0) / 100;
            const r = (parseFloat(els.retSlider.value) || 0) / 100;

            // Handle Dynamic Corpus Returns
            if (!isManualCorpusReturn) {
                const suggested = getAutoReturn(y);
                if (els.corpusRetSlider) els.corpusRetSlider.value = suggested.rate;
                if (els.riskLabel) els.riskLabel.innerText = suggested.label;
            }
            const cr = (parseFloat(els.corpusRetSlider.value) || 0) / 100;

            // Update Labels
            if(els.priceText) els.priceText.innerText = "(" + formatIndianWords(p) + ")";
            if(els.corpusText) els.corpusText.innerText = "(" + formatIndianWords(existing) + ")";
            if(els.yVal) els.yVal.innerText = y;
            if(els.iVal) els.iVal.innerText = (i * 100).toFixed(1);
            if(els.rVal) els.rVal.innerText = (r * 100).toFixed(1);
            if(els.crVal) els.crVal.innerText = (cr * 100).toFixed(1);

            // Math
            const futureCost = p * Math.pow(1 + i, y);
            const futureCorpusValue = existing * Math.pow(1 + cr, y);
            const netGap = Math.max(0, futureCost - futureCorpusValue);

            const months = y * 12;
            const monthlyRate = r / 12;
            let sip = 0;

            if (netGap > 0 && months > 0 && monthlyRate > 0) {
                sip = (netGap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
            }

            // UI Update
            if(els.outCost) els.outCost.innerText = "₹" + Math.round(futureCost).toLocaleString('en-IN');
            if(els.outSIP) els.outSIP.innerText = "₹" + Math.round(sip).toLocaleString('en-IN');
        }

        // Sync Helper
        const setupSync = (num, slider) => {
            if(!num || !slider) return;
            num.addEventListener('input', () => { slider.value = num.value; calculate(); });
            slider.addEventListener('input', () => { num.value = slider.value; calculate(); });
        };

        setupSync(els.price, els.priceSlider);
        setupSync(els.corpus, els.corpusSlider);

        // Add Listeners
        [els.yearsSlider, els.inflSlider, els.retSlider].forEach(s => {
            if(s) s.addEventListener('input', () => calculate(false));
        });
        
        if(els.corpusRetSlider) {
            els.corpusRetSlider.addEventListener('input', () => calculate(true));
        }

        if(els.goal) {
            els.goal.addEventListener('change', function() {
                const target = config[this.value];
                if (target) {
                    els.price.value = els.priceSlider.value = target.p;
                    els.yearsSlider.value = target.y;
                    els.inflSlider.value = target.i;
                    els.retSlider.value = target.r;
                    if(els.nudge) els.nudge.innerText = target.m;
                    calculate(false);
                }
            });
        }

        calculate();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
