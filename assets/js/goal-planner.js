window.addEventListener('DOMContentLoaded', function() {
    const getEl = (id) => document.getElementById(id);
    
    const els = {
        goal: getEl('goal-name'), startD: getEl('start-date'), targetD: getEl('target-date'),
        price: getEl('current-price'), priceS: getEl('current-price-slider'),
        corpus: getEl('existing-corpus'), corpusS: getEl('existing-corpus-slider'),
        corpRet: getEl('corpus-returns'), corpRetS: getEl('corpus-returns-slider'),
        sipRet: getEl('goal-returns'), sipRetS: getEl('goal-returns-slider'),
        infl: getEl('goal-inflation'), inflS: getEl('goal-inflation-slider'),
        outCost: getEl('future-cost'), outSIP: getEl('required-sip'),
        yText: getEl('years-val'), riskL: getEl('risk-label'),
        deadlineD: getEl('deadline-date'), timeLeft: getEl('time-left'),
        nudge: getEl('goal-nudge'), downloadBtn: getEl('download-btn')
    };

    const config = {
        "Custom Plan": { p: 500000, r: 10, i: 6, y: 5, m: "Your money, your rules. Let's start with a blank slate. 🎯" },
        "Own Wedding": { p: 1500000, r: 12, i: 8, y: 3, m: "It's one day, not a lifestyle. 💍" },
        "Siblings Wedding": { p: 500000, r: 10, i: 8, y: 2, m: "Be generous, but keep your sanity. 🥂" },
        "Emergency Fund": { p: 600000, r: 8, i: 6, y: 1, m: "Things break, jobs get lost. 🛡️" },
        "Jewelry Purchase": { p: 300000, r: 8, i: 10, y: 2, m: "Buy it when you've planned for it. ✨" },
        "Home Renovation": { p: 1000000, r: 12, i: 7, y: 3, m: "Plan the upgrade to enjoy the space. 🔨" },
        "Home Appliances": { p: 200000, r: 9, i: 5, y: 1, m: "Save up, buy it, watch without guilt. 📺" },
        "School Admission": { p: 300000, r: 10, i: 12, y: 1, m: "Start moving money now. 🏫" },
        "Yearly School Fees": { p: 150000, r: 8, i: 10, y: 1, m: "Treat it like a utility bill. 📚" },
        "Child UG India": { p: 2500000, r: 12, i: 10, y: 10, m: "A solid degree is a foundation. 🎓" },
        "Child UG Foreign": { p: 8000000, r: 13, i: 12, y: 10, m: "It's a big ticket. Plan early. 🌍" },
        "Child PG India": { p: 2000000, r: 12, i: 10, y: 15, m: "Let's match the ambition. 🏛️" },
        "Child PG Foreign": { p: 6000000, r: 13, i: 12, y: 15, m: "Start planning now. ✈️" },
        "My Own PG": { p: 2500000, r: 11, i: 10, y: 3, m: "Investing in skills pays off. 📖" },
        "Dream House": { p: 10000000, r: 12, i: 7, y: 10, m: "The dream house is a long game. 🏰" },
        "House Downpayment": { p: 2000000, r: 12, i: 7, y: 5, m: "A smaller mortgage means options. 💰" },
        "New Car": { p: 1200000, r: 10, i: 5, y: 5, m: "Buy it after securing the important stuff. 🚗" },
        "Car Downpayment": { p: 400000, r: 9, i: 5, y: 2, m: "Keeping the loan small is key. 🏎️" },
        "Business Start": { p: 2000000, r: 13, i: 8, y: 3, m: "Make sure the business has fuel. 💼" },
        "Retirement Fund": { p: 10000000, r: 12, i: 6, y: 25, m: "Don't leave it to chance. 🏝️" },
        "Health Insurance": { p: 30000, r: 7, i: 15, y: 1, m: "Boring, necessary, non-negotiable. 🏥" },
        "Car Insurance": { p: 20000, r: 7, i: 5, y: 1, m: "Insurance is just common sense. 🚗" },
        "Local Vacation": { p: 100000, r: 8, i: 8, y: 1, m: "Save for the downtime. 🏔️" },
        "Foreign Vacation": { p: 700000, r: 9, i: 10, y: 2, m: "Don't pay for it after returning. 🗽" }
    };

    function calculate(isManualCorpRet = false) {
        if (!els.startD.value || !els.targetD.value) return;

        const d1 = new Date(els.startD.value);
        const d2 = new Date(els.targetD.value);
        const now = new Date();
        const totalYears = Math.max(0.1, (d2 - d1) / 31557600000);
        const yearsRemaining = Math.max(0.08, (d2 - now) / 31557600000);
        
        // Update Deadline Date
        if (els.deadlineD) {
            els.deadlineD.innerText = d2.toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'short', year: 'numeric' 
            });
        }
        
        if(els.yText) els.yText.innerText = totalYears.toFixed(1);

        const p = parseFloat(els.price.value) || 0;
        const existing = parseFloat(els.corpus.value) || 0;
        const inflation = parseFloat(els.infl.value) || 0;
        const rSIP = parseFloat(els.sipRet.value) || 0;

        if (!isManualCorpRet) {
            let rate = yearsRemaining < 4 ? 6 : (yearsRemaining <= 7 ? 8 : 10);
            els.corpRet.value = els.corpRetS.value = rate;
            if(els.riskL) els.riskL.innerText = rate === 6 ? "(Safe)" : (rate === 8 ? "(Moderate)" : "(Aggressive)");
        }
        
        const gapData = FinanceEngine.calculateGoalGap(p, existing, inflation, parseFloat(els.corpRet.value), totalYears);
        const requiredSIP = FinanceEngine.calculateRequiredSIP(gapData.gap, rSIP, yearsRemaining);

        if(els.outCost) els.outCost.innerText = "₹" + FinanceEngine.formatIndian(gapData.futureCost);
        if(els.outSIP) els.outSIP.innerText = "₹" + FinanceEngine.formatIndian(requiredSIP);
        
        const daysLeft = Math.floor((d2 - now) / 86400000);
        if (els.timeLeft) els.timeLeft.innerText = daysLeft > 0 ? `${Math.floor(daysLeft/30)} Months, ${daysLeft%30} Days left` : "Goal Date Reached! 🏁";
    }

    if(els.goal) {
        els.goal.addEventListener('change', function() {
            const t = config[this.value];
            if (t) {
                els.price.value = els.priceS.value = t.p;
                els.sipRet.value = els.sipRetS.value = t.r;
                els.infl.value = els.inflS.value = t.i;
                if(els.nudge) els.nudge.innerText = t.m;

                const start = new Date();
                const end = new Date();
                end.setFullYear(end.getFullYear() + t.y);

                els.startD.valueAsDate = start;
                els.targetD.valueAsDate = end;

                calculate(false);
            }
        });
    }

    function sync(input, slider, isCorp = false) {
        input.addEventListener('input', () => { slider.value = input.value; calculate(isCorp); });
        slider.addEventListener('input', () => { input.value = slider.value; calculate(isCorp); });
    }

    sync(els.price, els.priceS); sync(els.sipRet, els.sipRetS); sync(els.corpus, els.corpusS); 
    sync(els.corpRet, els.corpRetS, true); sync(els.infl, els.inflS);
    
    els.startD.addEventListener('change', () => calculate(false));
    els.targetD.addEventListener('change', () => calculate(false));
    
    els.goal.value = "Custom Plan";
    els.goal.dispatchEvent(new Event('change'));
});
