document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('transactionBody');
    const addBtn = document.getElementById('addRowBtn');

    function addRow(date = '', type = 'payment', amount = '') {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="date" class="trans-date" value="${date}"></td>
            <td>
                <select class="trans-type">
                    <option value="disbursement" ${type === 'disbursement' ? 'selected' : ''}>Disbursement</option>
                    <option value="payment" ${type === 'payment' ? 'selected' : ''}>Payment</option>
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
        
        if (transactions.length > 0 && annualRate > 0) {
            const results = FinanceEngine.LoanEngine.calculateCLHL(transactions, annualRate);
            const last = results[results.length - 1];
            
            document.getElementById('closingPrincipal').innerText = `₹${Math.round(last.principal).toLocaleString()}`;
            document.getElementById('unpaidInterest').innerText = `₹${Math.round(last.interest).toLocaleString()}`;
        }
    }

    addBtn.addEventListener('click', () => addRow());
    document.getElementById('loanAmount').addEventListener('input', runCalculation);
    document.getElementById('interestRate').addEventListener('input', runCalculation);
});
