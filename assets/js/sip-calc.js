document.addEventListener('DOMContentLoaded', function() {
    // Input Fields
    const monthlyInput = document.getElementById('monthly-sip');
    const monthlySlider = document.getElementById('monthly-sip-slider'); // Added
    const rateInput = document.getElementById('return-rate');
    const rateSlider = document.getElementById('return-rate-slider'); // Added
    const yearsInput = document.getElementById('years');
    const yearsSlider = document.getElementById('years-slider'); // Added
    const dateInput = document.getElementById('start-date');

    // Display Elements
    const investedDisplay = document.getElementById('total-invested');
    const returnsDisplay = document.getElementById('total-returns');
    const valueDisplay = document.getElementById('total-value');
    const progressSection = document.getElementById('current-progress');
    const completedTenure = document.getElementById('completed-tenure');
    const valueTodayDisplay = document.getElementById('value-today');

    // NEW: Helper function to sync Sliders and Inputs
    function sync(input, slider) {
        // When slider moves, update input and recalculate
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateSIP();
        });
        // When input text changes, update slider and recalculate
        input.addEventListener('input', () => {
            slider.value = input.value;
            calculateSIP();
        });
    }

    // Initialize Syncing
    sync(monthlyInput, monthlySlider);
    sync(rateInput, rateSlider);
    sync(yearsInput, yearsSlider);
    
    // Date doesn't have a slider, so just listen for change
    dateInput.addEventListener('input', calculateSIP);

    function calculateSIP() {
        let P = parseFloat(monthlyInput.value); 
        let annualRate = parseFloat(rateInput.value); 
        let yearsGoal = parseFloat(yearsInput.value);
        let i = annualRate / 100 / 12; 

        if (isNaN(P) || isNaN(annualRate) || isNaN(yearsGoal) || i === 0) return;

        // 1. FUTURE PROJECTION (Always calculated based on "Time Period")
        let nGoal = yearsGoal * 12;
        let finalValue = P * ((Math.pow(1 + i, nGoal) - 1) / i) * (1 + i);
        let totalInvested = P * nGoal;
        let totalReturns = finalValue - totalInvested;

   // 2. CURRENT PROGRESS (Only if Date is selected)
const startDateValue = dateInput.value;
if (startDateValue) {
    let start = new Date(startDateValue);
    let today = new Date();
    
    // Improved Month Calculation: total months from year 0 to now
    let nPassed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());

    // Only show if the date is actually in the past
    if (nPassed > 0) {
        progressSection.style.display = 'block';
        
        // Ensure i is not zero before power calculation to avoid "Infinity" errors
        let valueToday = P * ((Math.pow(1 + i, nPassed) - 1) / i) * (1 + i);
        
        let yPassed = Math.floor(nPassed / 12);
        let mPassed = nPassed % 12;
        
        // Update the UI
        completedTenure.innerText = `${yPassed}y ${mPassed}m`;
        // Explicitly target the ID to ensure it finds the element
        document.getElementById('value-today').innerText = "₹" + Math.round(valueToday).toLocaleString('en-IN');
    } else {
        progressSection.style.display = 'none';
    }
} else {
    progressSection.style.display = 'none';
}

        // Update Future Results
        investedDisplay.innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
        returnsDisplay.innerText = "₹" + Math.round(totalReturns).toLocaleString('en-IN');
        valueDisplay.innerText = "₹" + Math.round(finalValue).toLocaleString('en-IN');
    }

    // Run once on load
    calculateSIP();
});
