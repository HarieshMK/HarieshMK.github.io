document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: PROPERTY ASSET MANAGER ---
    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');

    function calculateTotalPropertyCost() {
        const basic = parseFloat(basicCost.value) || 0;
        const gstRate = basic <= 4500000 ? 0.01 : 0.05;
        const gstAmount = basic * gstRate;
        const totalWithGST = basic + gstAmount;

        if (document.getElementById('gstDisplay')) {
            document.getElementById('gstDisplay').innerText = `₹${Math.round(gstAmount).toLocaleString()}`;
        }
        if (document.getElementById('totalPropertyCost')) {
            document.getElementById('totalPropertyCost').innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
        }
        return totalWithGST;
    }

    function updateBasicCost() {
        basicCost.value = (parseFloat(superArea.value) || 0) * (parseFloat(pricePerSqft.value) || 0);
        calculateTotalPropertyCost();
        runCalculation();
    }

    [superArea, pricePerSqft].forEach(el => el.addEventListener('input', updateBasicCost));

    document.getElementById('addChargeBtn').addEventListener('click', () => {
        const container = document.getElementById('extraChargesContainer');
        const div = document.createElement('div');
        div.className = 'input-grid';
        div.innerHTML = `<input type="text" placeholder="Charge Name"><input type="number" class="extra-charge-val">`;
        // Add event listener to the new input directly
        div.querySelector('.extra-charge-val').addEventListener('input', runCalculation);
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
        
        if (transactions.length > 0 && annualRate > 0 && typeof FinanceEngine !== 'undefined') {
            const results = FinanceEngine.LoanEngine.calculateCLHL(transactions, annualRate);
            const last = results[results.length - 1];
            
            if(document.getElementById('closingPrincipal')) {
                document.getElementById('closingPrincipal').innerText = `₹${Math.round(last.principal).toLocaleString()}`;
                document.getElementById('unpaidInterest').innerText = `₹${Math.round(last.interest).toLocaleString()}`;
            }
        }
    }

    // --- PART 3: LISTENERS ---
    addBtn.addEventListener('click', () => addRow());
    ['loanAmount', 'interestRate', 'tenureYears', 'emiDate'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', runCalculation);
    });
});
