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
        const inflation = parseFloat(els.infl.value) || 0;
        const rSIP = parseFloat(els.sipRet.value) || 0;

        // Risk Logic
        if (!isManualCorpRet) {
            let rate = yearsRemaining < 4 ? 6 : (yearsRemaining <= 7 ? 8 : 10);
            els.corpRet.value = els.corpRetS.value = rate;
            if(els.riskL) els.riskL.innerText = rate === 6 ? "(Safe)" : (rate === 8 ? "(Moderate)" : "(Aggressive)");
        }
        
        // INTEGRATION WITH FINANCE ENGINE
        const gapData = FinanceEngine.calculateGoalGap(p, existing, inflation, parseFloat(els.corpRet.value), totalYears);
        const requiredSIP = FinanceEngine.calculateRequiredSIP(gapData.gap, rSIP, yearsRemaining);

        // UI Updates
        if(els.outCost) els.outCost.innerText = "₹" + FinanceEngine.formatIndian(gapData.futureCost);
        if(els.outSIP) els.outSIP.innerText = "₹" + FinanceEngine.formatIndian(requiredSIP);
        
        const daysLeft = Math.floor((d2 - now) / 86400000);
        if (els.timeLeft) els.timeLeft.innerText = daysLeft > 0 ? `${Math.floor(daysLeft/30)} Months, ${daysLeft%30} Days left` : "Goal Date Reached! 🏁";
    }

    // Sync helpers remain the same...
    function sync(input, slider, isCorp = false) {
        input.addEventListener('input', () => { slider.value = input.value; calculate(isCorp); });
        slider.addEventListener('input', () => { input.value = slider.value; calculate(isCorp); });
    }

    sync(els.price, els.priceS); sync(els.sipRet, els.sipRetS); sync(els.corpus, els.corpusS); 
    sync(els.corpRet, els.corpRetS, true); sync(els.infl, els.inflS);
    els.startD.addEventListener('change', () => calculate(false));
    els.targetD.addEventListener('change', () => calculate(false));
    calculate();
});
