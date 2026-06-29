document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: PROPERTY ASSET MANAGER ---
    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');

    function calculateTotalPropertyCost() {
        const basic = parseFloat(basicCost.value) || 0;
        const gstAmount = (typeof FinanceEngine !== 'undefined') ? FinanceEngine.GSTHelper.calculateGST(basic) : 0;
        const totalWithGST = basic + gstAmount;
    
        const gstDisplay = document.getElementById('gstDisplay');
        if (gstDisplay) gstDisplay.innerText = `₹${Math.round(gstAmount).toLocaleString()}`;
        
        const totalPropCost = document.getElementById('totalPropertyCost');
        if (totalPropCost) totalPropCost.innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
        
        return totalWithGST;
    }

    function updateBasicCost() {
        if(superArea && pricePerSqft && basicCost) {
            basicCost.value = (parseFloat(superArea.value) || 0) * (parseFloat(pricePerSqft.value) || 0);
        }
        calculateTotalPropertyCost();
        runCalculation();
    }

    // Initialize inputs
    if(superArea && pricePerSqft) {
        [superArea, pricePerSqft].forEach(el => el.addEventListener('input', updateBasicCost));
    }

    // --- FIX: BUTTON AND CONTAINER ---
    const addChargeBtn = document.getElementById('addChargeBtn');
    const container = document.getElementById('extraChargesContainer');

    if (addChargeBtn && container) {
        addChargeBtn.addEventListener('click', () => {
            const div = document.createElement('div');
            div.className = 'calc-custom-row'; 
            div.innerHTML = `
                <label>Extra Charge</label>
                <input type="text" placeholder="Charge Name">
                <input type="number" class="extra-charge-val" placeholder="Amount">
            `;
            
            // Add the listener for automatic calculation
            div.querySelector('.extra-charge-val').addEventListener('input', runCalculation);
            container.appendChild(div);
        });
    }

    // --- PART 2: LEDGER ---
    const tableBody = document.getElementById('transactionBody');
    const addBtn = document.getElementById('addRowBtn');

    function addRow(date = '', type = 'payment', amount = '') {
        if (!tableBody) return;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="date" class="trans-date" value="${date}"></td>
            <td>
                <select class="trans-type">
                    <option value="disbursement">Disbursement</option>
                    <option value="payment" selected>Payment</option>
                </select>
            </td>
            <td><input type="number" class="trans-amount" value="${amount}"></td>
        `;
        tableBody.appendChild(row);
        row.addEventListener('input', runCalculation);
    }

    function runCalculation() {
        if (!tableBody) return;
        
        const rows = document.querySelectorAll('#transactionBody tr');
        const transactions = Array.from(rows).map(row => ({
            date: row.querySelector('.trans-date').value,
            type: row.querySelector('.trans-type').value,
            amount: parseFloat(row.querySelector('.trans-amount').value) || 0
        })).filter(t => t.date && t.amount > 0);

        const interestEl = document.getElementById('interestRate');
        const annualRate = interestEl ? parseFloat(interestEl.value) || 0 : 0;
        
        if (transactions.length > 0 && annualRate > 0 && typeof FinanceEngine !== 'undefined') {
            const results = FinanceEngine.LoanEngine.calculateCLHL(transactions, annualRate);
            const last = results[results.length - 1];
            
            const closingPrincipal = document.getElementById('closingPrincipal');
            const unpaidInterest = document.getElementById('unpaidInterest');
            
            if(closingPrincipal) closingPrincipal.innerText = `₹${Math.round(last.principal).toLocaleString()}`;
            if(unpaidInterest) unpaidInterest.innerText = `₹${Math.round(last.interest).toLocaleString()}`;
        }
    }

    if(addBtn) addBtn.addEventListener('click', () => addRow());
    ['loanAmount', 'interestRate', 'tenureYears'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', runCalculation);
    });

    // --- CRITICAL FIX: TRIGGER ON LOAD ---
    updateBasicCost();
});
