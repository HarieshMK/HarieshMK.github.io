document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: PROPERTY ASSET MANAGER ---
    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');

    function updateBasicCost() {
        const cost = (parseFloat(superArea.value) || 0) * (parseFloat(pricePerSqft.value) || 0);
        basicCost.value = cost;
        runCalculation(); // Recalculate everything when property cost changes
    }
    [superArea, pricePerSqft].forEach(el => el.addEventListener('input', updateBasicCost));

    document.getElementById('addChargeBtn').addEventListener('click', () => {
        const container = document.getElementById('extraChargesContainer');
        const div = document.createElement('div');
        div.className = 'input-grid';
        div.innerHTML = `<input type="text" placeholder="Charge Name"><input type="number" class="extra-charge-val" oninput="runCalculation()">`;
        container.appendChild(div);
    });

    // --- PART 2: LEDGER & FINANCE ENGINE ---
    const tableBody = document.getElementById('transactionBody');
    const addBtn = document.getElementById('addRowBtn');

    function addRow(date = '', type = 'payment', amount = '') {
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
        const rows = document.querySelectorAll('#transactionBody tr');
        const transactions = Array.from(rows).map(row => ({
            date: row.querySelector('.trans-date').value,
            type: row.querySelector('.trans-type').value,
            amount: parseFloat(row.querySelector('.trans-amount').value) || 0
        })).filter(t => t.date && t.amount > 0);

        const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
        
        // Only run if we have valid engine data
        if (transactions.length > 0 && annualRate > 0 && typeof FinanceEngine !== 'undefined') {
            const results = FinanceEngine.LoanEngine.calculateCLHL(transactions, annualRate);
            const last = results[results.length - 1];
            
            // These IDs need to exist in your HTML results card
            if(document.getElementById('closingPrincipal')) {
                document.getElementById('closingPrincipal').innerText = `₹${Math.round(last.principal).toLocaleString()}`;
                document.getElementById('unpaidInterest').innerText = `₹${Math.round(last.interest).toLocaleString()}`;
            }
        }
    }

    // --- PART 3: LISTENERS ---
    addBtn.addEventListener('click', () => addRow());
    ['loanAmount', 'interestRate', 'tenureYears', 'emiDate'].forEach(id => {
        document.getElementById(id).addEventListener('input', runCalculation);
    });
});
