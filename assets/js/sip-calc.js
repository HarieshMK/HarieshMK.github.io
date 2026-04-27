// 1. Global State Tracker
let currentFrequency = 'monthly'; 

// 2. The Toggle Handler
window.setFrequency = function(freq) {
    if (currentFrequency === freq) return;
    currentFrequency = freq;
    
    const btnMonthly = document.getElementById('btn-monthly');
    const btnYearly = document.getElementById('btn-yearly');
    if(btnMonthly) btnMonthly.classList.toggle('active', freq === 'monthly');
    if(btnYearly) btnYearly.classList.toggle('active', freq === 'yearly');

    const label = document.getElementById('investment-label');
    const slider = document.getElementById('monthly-sip-slider');
    const input = document.getElementById('monthly-sip');

    if (freq === 'yearly') {
        if(label) label.innerText = "Yearly Amount (₹)";
        if(slider) { slider.max = 1200000; slider.step = 5000; }
        if(input) input.value = input.value * 12;
    } else {
        if(label) label.innerText = "Monthly Amount (₹)";
        if(slider) { slider.max = 100000; slider.step = 500; }
        if(input) input.value = Math.round(input.value / 12);
    }

    if(slider && input) slider.value = input.value;
    if(input) input.dispatchEvent(new Event('input'));
};

document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        monthlySIP: document.getElementById('monthly-sip'),
        monthlySlider: document.getElementById('monthly-sip-slider'),
        returnRate: document.getElementById('return-rate'),
        returnSlider: document.getElementById('return-rate-slider'),
        yearsInput: document.getElementById('years'),
        yearsSlider: document.getElementById('years-slider'),
        invToday: document.getElementById('inv-today'),
        gainToday: document.getElementById('gain-today'),
        lumpSumInput: document.getElementById('initial-lump-sum'),
        lumpSumSlider: document.getElementById('lump-sum-slider'),
        inflationInput: document.getElementById('inflation-rate'),
        inflationSlider: document.getElementById('inflation-slider'),
        dateInput: document.getElementById('start-date'),
        totalInvested: document.getElementById('total-invested'),
        totalReturns: document.getElementById('total-returns'),
        totalValue: document.getElementById('total-value'),
        realFuture: document.getElementById('real-future-value'),
        progressSection: document.getElementById('current-progress'),
        completedTenure: document.getElementById('completed-tenure'),
        valueTodayDisplay: document.getElementById('value-today')
    };

    window.calculate = function() {
        console.group("--- [SIP-CALC] NEW CALCULATION ---");
        
        const P = parseFloat(elements.monthlySIP?.value) || 0;
        const L = parseFloat(elements.lumpSumInput?.value) || 0;
        const annualR = parseFloat(elements.returnRate?.value) || 0;
        const years = parseFloat(elements.yearsInput?.value) || 0;
        const inf = parseFloat(elements.inflationInput?.value) || 0;

        if (typeof FinanceEngine !== 'undefined') {
            try {
                // 1. Calculations
                const results = FinanceEngine.calculateFutureValue(P, L, annualR, years, currentFrequency);
                const realValue = FinanceEngine.adjustForInflation(results.totalValue, inf, years);
                const format = (num) => FinanceEngine.formatIndian(num);

                // 2. Date Setup (Moved up so Insight Message can use it!)
                const baseDate = (elements.dateInput && elements.dateInput.value) ? new Date(elements.dateInput.value) : new Date();
                const futureDate = new Date(baseDate);
                futureDate.setMonth(futureDate.getMonth() + Math.round(years * 12));
                const year = futureDate.getFullYear();

                // 3. Update Text Results
                if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(results.totalInvested);
                if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(results.estimatedReturns);
                if(elements.totalValue) elements.totalValue.innerText = "₹" + format(results.totalValue);
                if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);

                // 4. The "Real Wealth" Insight Message
                const insightElement = document.getElementById('inflation-insight');
                const insightContainer = document.getElementById('inflation-insight-container');
                if (insightElement && inf > 0) {
                    insightContainer.style.display = 'block';
                    insightElement.innerHTML = `Note: <strong>₹${format(results.totalValue)}</strong> in ${year} will buy you the same things that <strong>₹${format(realValue)}</strong> can buy today, due to inflation.`;
                } else if (insightContainer) {
                    insightContainer.style.display = 'none';
                }

                // 5. Progress Tracking Logic
                if (elements.dateInput && elements.dateInput.value) {
                    const today = new Date();
                    let monthsPassed = (today.getFullYear() - baseDate.getFullYear()) * 12 + (today.getMonth() - baseDate.getMonth());
                    const effectiveMonths = Math.max(0, Math.min(monthsPassed, years * 12));

                    if (effectiveMonths > 0 && elements.progressSection) {
                        elements.progressSection.style.display = 'block';
                        const progressResults = FinanceEngine.calculateFutureValue(P, L, annualR, effectiveMonths / 12, currentFrequency);
                        let investedToday = L + (currentFrequency === 'monthly' ? (P * effectiveMonths) : (P * Math.floor(effectiveMonths / 12)));
                        
                        if (elements.completedTenure) elements.completedTenure.innerText = `${Math.floor(effectiveMonths / 12)}y ${effectiveMonths % 12}m`;
                        if (elements.valueTodayDisplay) elements.valueTodayDisplay.innerText = "₹" + format(progressResults.totalValue);
                        if (elements.invToday) elements.invToday.innerText = "₹" + format(investedToday);
                        if (elements.gainToday) elements.gainToday.innerText = "₹" + format(progressResults.totalValue - investedToday);
                    } else if (elements.progressSection) {
                        elements.progressSection.style.display = 'none';
                    }
                }

                if (typeof window.autoScaleNumbers === 'function') window.autoScaleNumbers();

                // 6. The Interactive Message
                const messageElement = document.getElementById('future-message');
                if (messageElement && elements.totalValue) {
                    const day = futureDate.getDate();
                    const monthName = futureDate.toLocaleDateString('en-IN', { month: 'long' });
                    const fullAmount = Math.round(results.totalValue).toLocaleString('en-IN');
                    const getOrdinal = (d) => {
                        if (d > 3 && d < 21) return 'th';
                        switch (d % 10) {
                            case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th";
                        }
                    };
                    messageElement.innerHTML = `Set a reminder! Approximately <strong>₹${fullAmount}</strong> is expected to land in your bank account on <strong>${monthName} ${day}${getOrdinal(day)}, ${year}</strong>. 🚀`;
                }
            } catch (err) {
                console.error("[SIP-CALC] Error during calculation:", err);
            }
        }
        console.groupEnd();
    };

    function sync(input, slider) {
        if(!input || !slider) return;
        input.addEventListener('input', () => { slider.value = input.value; window.calculate(); });
        slider.addEventListener('input', () => { input.value = slider.value; window.calculate(); });
    }

    sync(elements.monthlySIP, elements.monthlySlider);
    sync(elements.returnRate, elements.returnSlider);
    sync(elements.yearsInput, elements.yearsSlider);
    sync(elements.lumpSumInput, elements.lumpSumSlider);
    sync(elements.inflationInput, elements.inflationSlider);
    if(elements.dateInput) elements.dateInput.addEventListener('change', window.calculate);

    window.calculate();
});
