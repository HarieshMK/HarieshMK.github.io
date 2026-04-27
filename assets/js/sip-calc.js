// 1. Global State Tracker (Place this at the very top)
let currentFrequency = 'monthly'; 

// 2. The Toggle Handler (Needs to be window-scoped for the onclick in HTML)
window.setFrequency = function(freq) {
    if (currentFrequency === freq) return;
    
    currentFrequency = freq;
    
    // UI: Update active states of buttons
    const btnMonthly = document.getElementById('btn-monthly');
    const btnYearly = document.getElementById('btn-yearly');
    if(btnMonthly) btnMonthly.classList.toggle('active', freq === 'monthly');
    if(btnYearly) btnYearly.classList.toggle('active', freq === 'yearly');

    // UI: Update Labels and Sliders
    const label = document.getElementById('investment-label');
    const slider = document.getElementById('monthly-sip-slider');
    const input = document.getElementById('monthly-sip');

    if (freq === 'yearly') {
        if(label) label.innerText = "Yearly Amount (₹)";
        if(slider) {
            slider.max = 1200000; // 12 Lakhs
            slider.step = 5000;
        }
        if(input) input.value = input.value * 12; // Auto-scale up
    } else {
        if(label) label.innerText = "Monthly Amount (₹)";
        if(slider) {
            slider.max = 100000; // 1 Lakh
            slider.step = 500;
        }
        if(input) input.value = Math.round(input.value / 12); // Auto-scale down
    }

    if(slider && input) slider.value = input.value;
    
    // Trigger calculation (since calculate is defined inside the DOM listener, 
    // we manually dispatch an event to the input to trigger the sync logic)
    if(input) input.dispatchEvent(new Event('input'));
};

document.addEventListener('DOMContentLoaded', function() {
    // 1. Element Mapping
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

    // Make calculate available globally so setFrequency can call it directly if needed
    window.calculate = function() {
        // --- DEBUG: INITIAL INPUTS ---
        console.group("--- [SIP-CALC] NEW CALCULATION ---");
        
        const P = parseFloat(elements.monthlySIP?.value) || 0;
        const L = parseFloat(elements.lumpSumInput?.value) || 0;
        const annualR = parseFloat(elements.returnRate?.value) || 0;
        const years = parseFloat(elements.yearsInput?.value) || 0;
        const inf = parseFloat(elements.inflationInput?.value) || 0;

        console.log("Inputs:", { mode: currentFrequency, amount: P, lumpSum: L, rate: annualR, years: years });

        if (typeof FinanceEngine !== 'undefined') {
            try {
                // 3. UPDATED MAIN CALCULATION (Added currentFrequency)
                // 1. Main Calculation:
                const results = FinanceEngine.calculateFutureValue(P, L, annualR, years, currentFrequency);
                const realValue = FinanceEngine.adjustForInflation(results.totalValue, inf, years);
                // 2. Formatting (Using your L/Cr format for the "as on today" part)
                const format = (num) => FinanceEngine.formatIndian(num);
                const fullMaturity = format(results.totalValue);
                const todayEquivalent = format(realValue);
                
                // 3. The "Real Wealth" Insight Message
                const insightElement = document.getElementById('inflation-insight');
                const insightContainer = document.getElementById('inflation-insight-container');
                
                // Logic for the message
                if (insightElement && inf > 0) {
                    // Show the box by setting display to block
                    insightContainer.style.display = 'block';
                    
                    // Set the dynamic content
                    insightElement.innerHTML = `Note: <strong>₹${fullMaturity}</strong> in ${year} will buy you the same things that <strong>₹${todayEquivalent}</strong> can buy today, due to inflation.`;
                } else {
                    insightContainer.style.display = 'none';
                }

                console.log("Calculation Results:", results);

                const format = (num) => FinanceEngine.formatIndian(num);
                
                if(elements.totalInvested) elements.totalInvested.innerText = "₹" + format(results.totalInvested);
                if(elements.totalReturns) elements.totalReturns.innerText = "₹" + format(results.estimatedReturns);
                if(elements.totalValue) elements.totalValue.innerText = "₹" + format(results.totalValue);
                if(elements.realFuture) elements.realFuture.innerText = "₹" + format(realValue);

                // 2. PROGRESS LOGIC
                if (elements.dateInput && elements.dateInput.value) {
                    const startDate = new Date(elements.dateInput.value);
                    const today = new Date();
                    
                    let monthsPassed = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
                    const totalMonths = years * 12;
                    const effectiveMonths = Math.max(0, Math.min(monthsPassed, totalMonths));

                    if (effectiveMonths > 0 && elements.progressSection) {
                        elements.progressSection.style.display = 'block';
                        // Use years (effectiveMonths/12) for the engine
                        const progressResults = FinanceEngine.calculateFutureValue(P, L, annualR, effectiveMonths / 12, currentFrequency);
                        
                        // Invested Today Calculation needs frequency check
                        let investedToday = L;
                        if (currentFrequency === 'monthly') {
                            investedToday += (P * effectiveMonths);
                        } else {
                            investedToday += (P * Math.floor(effectiveMonths / 12));
                        }
                        
                        const gainToday = progressResults.totalValue - investedToday;

                        if (elements.completedTenure) elements.completedTenure.innerText = `${Math.floor(effectiveMonths / 12)}y ${effectiveMonths % 12}m`;
                        if (elements.valueTodayDisplay) elements.valueTodayDisplay.innerText = "₹" + format(progressResults.totalValue);
                        if (elements.invToday) elements.invToday.innerText = "₹" + format(investedToday);
                        if (elements.gainToday) elements.gainToday.innerText = "₹" + format(gainToday);
                    } else if (elements.progressSection) {
                        elements.progressSection.style.display = 'none';
                    }
                }

                // 3. AUTO-SCALE TRIGGER
                if (typeof window.autoScaleNumbers === 'function') {
                    window.autoScaleNumbers();
                }

                // 4. THE INTERACTIVE MESSAGE
                if (elements.totalValue) {
                    const baseDate = (elements.dateInput && elements.dateInput.value) 
                        ? new Date(elements.dateInput.value) 
                        : new Date();

                    const futureDate = new Date(baseDate);
                    const totalMonths = Math.round(years * 12);
                    futureDate.setMonth(futureDate.getMonth() + totalMonths);
                    
                    const day = futureDate.getDate();
                    const month = futureDate.toLocaleDateString('en-IN', { month: 'long' });
                    const year = futureDate.getFullYear();
                    const exactAmount = Math.round(results.totalValue).toLocaleString('en-IN');

                    const getOrdinal = (d) => {
                        if (d > 3 && d < 21) return 'th';
                        switch (d % 10) {
                            case 1:  return "st";
                            case 2:  return "nd";
                            case 3:  return "rd";
                            default: return "th";
                        }
                    };

                    const messageElement = document.getElementById('future-message');
                    if (messageElement) {
                        messageElement.innerHTML = `Set a reminder! Approximately <strong>₹${exactAmount}</strong> is expected to land in your bank account on <strong>${month} ${day}${getOrdinal(day)}, ${year}</strong>. 🚀`;
                    }
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

    // Initialize Syncing
    sync(elements.monthlySIP, elements.monthlySlider);
    sync(elements.returnRate, elements.returnSlider);
    sync(elements.yearsInput, elements.yearsSlider);
    sync(elements.lumpSumInput, elements.lumpSumSlider);
    sync(elements.inflationInput, elements.inflationSlider);
    
    if(elements.dateInput) elements.dateInput.addEventListener('change', window.calculate);

    window.calculate();
});
