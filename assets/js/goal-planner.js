(function() {
    const init = function() {
        const getEl = (id) => document.getElementById(id);
        
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
            outCost: getEl('future-cost'),
            outSIP: getEl('required-sip'),
            yText: getEl('years-val'),
            riskL: getEl('risk-label'),
            deadlineD: getEl('deadline-date'),
            timeLeft: getEl('time-left'),
            totalDur: getEl('total-duration'),
            nudge: getEl('goal-nudge'),
            downloadBtn: getEl('download-btn')
        };

        const format = (num) => (typeof FinanceEngine !== 'undefined') ? FinanceEngine.formatIndian(num) : Math.round(num).toLocaleString('en-IN');

        const config = {
            "Own Wedding": { p: 1500000, r: 12, i: 8, m: "It's one day, not a lifestyle. Keep the budget in check so you're not starting your marriage with an EMI. 💍" },
            "Siblings Wedding": { p: 500000, r: 10, i: 8, m: "They'll look great in the photos, but you're the one paying the bills. Be generous, but keep your sanity. 🥂" },
            "Emergency Fund": { p: 600000, r: 8, i: 6, m: "Things break, jobs get lost, and life happens. Having a cushion makes all that way less dramatic. 🛡️" },
            "Jewelry Purchase": { p: 300000, r: 8, i: 10, m: "Gold prices aren't waiting for your mood to strike. Buy it when you've actually planned for it. ✨" },
            "Home Renovation": { p: 1000000, r: 12, i: 7, m: "A fresh coat of paint won't fix your finances. Plan the upgrade so you can actually enjoy the space. 🔨" },
            "Home Appliances": { p: 200000, r: 9, i: 5, m: "It's just a TV. Save up, buy it, and watch your shows without feeling the guilt. 📺" },
            "School Admission": { p: 300000, r: 10, i: 12, m: "School costs are climbing faster than most things. Best to start moving money now instead of stressing later. 🏫" },
            "Yearly School Fees": { p: 150000, r: 8, i: 10, m: "It happens every year. Treat it like a recurring utility bill rather than a surprise. 📚" },
            "Child UG India": { p: 2500000, r: 12, i: 10, m: "A solid degree is a good foundation. Just make sure the funding is as solid as the curriculum. 🎓" },
            "Child UG Foreign": { p: 8000000, r: 13, i: 12, m: "Foreign education is a big ticket. You're either funding it early or relying on a lot of luck. 🌍" },
            "Child PG India": { p: 2000000, r: 12, i: 10, m: "Specialization is useful, but it isn't cheap. Let’s get the numbers to match the ambition. 🏛️" },
            "Child PG Foreign": { p: 6000000, r: 13, i: 12, m: "Global degrees are great, but the exchange rate is a reality check. Start planning. ✈️" },
            "My Own PG": { p: 2500000, r: 11, i: 10, m: "Investing in your own skill set is usually the highest return you'll ever get. 📖" },
            "Dream House": { p: 10000000, r: 12, i: 7, m: "The dream house is a long game. It builds one sip at a time, not through wishful thinking. 🏰" },
            "House Downpayment": { p: 2000000, r: 12, i: 7, m: "A smaller mortgage means more options later. Focus on the downpayment; it pays off. 💰" },
            "New Car": { p: 1200000, r: 10, i: 5, m: "It's a car, not a retirement plan. Buy it once you've secured the actual important stuff. 🚗" },
            "Car Downpayment": { p: 400000, r: 9, i: 5, m: "Keeping the loan small keeps the monthly stress low. Make it happen. 🏎️" },
            "Business Start": { p: 2000000, r: 13, i: 8, m: "Great ideas need runway. Make sure your business has the fuel to actually take off. 💼" },
            "Retirement Fund": { p: 10000000, r: 12, i: 6, m: "You don't need a golden palace, just a comfortable life. Don't leave it to chance. 🏝️" },
            "Health Insurance": { p: 30000, r: 7, i: 15, m: "It’s boring, it’s necessary, and it’s non-negotiable. Get it checked off the list. 🏥" },
            "Car Insurance": { p: 20000, r: 7, i: 5, m: "One small scratch can turn into a big bill. Insurance is just common sense. 🚗" },
            "Local Vacation": { p: 100000, r: 8, i: 8, m: "A break is fine, but don't come back to an empty bank account. Save for the downtime. 🏔️" },
            "Foreign Vacation": { p: 700000, r: 9, i: 10, m: "Enjoy the trip, but make sure the fun ends when the flight lands, not when the credit card statement arrives. 🗽" }
        };

        function calculate(isManualCorpRet = false) {
            if (!els.startD.value || !els.targetD.value) return;

            const d1 = new Date(els.startD.value);
            const d2 = new Date(els.targetD.value);
            const now = new Date();
            
            const totalYears = Math.max(0.1, (d2 - d1) / 31557600000);
            const yearsRemaining = Math.max(0.08, (d2 - now) / 31557600000);
            
            if(els.yText) els.yText.innerText = totalYears.toFixed(1);

            const p = parseFloat(els.price.value) || 0;
            const existing = parseFloat(els.corpus.value) || 0;
            const inflation = (parseFloat(els.infl.value) || 0) / 100;
            const rSIP = (parseFloat(els.sipRet.value) || 0) / 100;

            if (!isManualCorpRet) {
                let rate = 10; let label = "(Aggressive)";
                if (yearsRemaining < 4) { rate = 6; label = "(Safe)"; }
                else if (yearsRemaining <= 7) { rate = 8; label = "(Moderate)"; }
                els.corpRet.value = els.corpRetS.value = rate;
                if(els.riskL) els.riskL.innerText = label;
            }
            const rCorp = (parseFloat(els.corpRet.value) || 0) / 100;

            const futureCost = p * Math.pow(1 + inflation, totalYears);
            const grownSavings = existing * Math.pow(1 + rCorp, totalYears);
            const gap = Math.max(0, futureCost - grownSavings);

            const mRate = rSIP / 12;
            const months = yearsRemaining * 12;
            const sip = (mRate > 0) ? (gap * mRate) / (Math.pow(1 + mRate, months) - 1) : (gap / months);

            if(els.outCost) els.outCost.innerText = "₹" + format(futureCost);
            if(els.outSIP) els.outSIP.innerText = "₹" + format(sip);
            
            const daysLeft = Math.floor((d2 - now) / 86400000);
            if (els.timeLeft) {
                els.timeLeft.innerText = daysLeft > 0 ? `${Math.floor(daysLeft/30)} Months, ${daysLeft%30} Days left` : "Goal Date Reached! 🏁";
            }
        }

        function sync(input, slider, isCorp = false) {
            if(!input || !slider) return;
            input.addEventListener('input', () => { slider.value = input.value; calculate(isCorp); });
            slider.addEventListener('input', () => { input.value = slider.value; calculate(isCorp); });
        }

        sync(els.price, els.priceS); 
        sync(els.sipRet, els.sipRetS);
        sync(els.corpus, els.corpusS); 
        sync(els.corpRet, els.corpRetS, true);
        sync(els.infl, els.inflS);

        els.startD.addEventListener('change', () => calculate(false));
        els.targetD.addEventListener('change', () => calculate(false));
        
        if(els.goal) {
            els.goal.addEventListener('change', function() {
                const t = config[this.value];
                if (t) {
                    els.price.value = els.priceS.value = t.p;
                    els.sipRet.value = els.sipRetS.value = t.r;
                    els.infl.value = els.inflS.value = t.i;
                    if(els.nudge) els.nudge.innerText = t.m;
                    calculate(false);
                }
            });
        }

        if(els.downloadBtn) {
            els.downloadBtn.addEventListener('click', () => window.print());
        }

        calculate();
    };
    init();
})();
