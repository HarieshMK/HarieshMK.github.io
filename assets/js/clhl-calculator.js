document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('clhl-calculator-container');
    let transactions = []; // The "Source of Truth" array

    // 1. Initial UI Setup
    container.innerHTML = `
        <div class="calc-section">
            <h3>Loan Parameters</h3>
            <input type="number" id="loanAmount" placeholder="Loan Amount">
            <input type="number" id="interestRate" placeholder="Interest Rate (%)">
            <input type="date" id="emiDate" placeholder="Full EMI Start Date">
        </div>
        <div class="calc-section">
            <h3>Transaction Ledger</h3>
            <div id="transactionRows"></div>
            <button id="addRowBtn">+ Add Transaction</button>
        </div>
        <div id="resultsView"></div>
    `;

    // 2. Add Row Logic
    document.getElementById('addRowBtn').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'trans-row';
        row.innerHTML = `
            <input type="date" class="trans-date">
            <select class="trans-type">
                <option value="disbursement">Disbursement</option>
                <option value="payment">Loan Payment</option>
            </select>
            <input type="number" class="trans-amount" placeholder="Amount">
        `;
        document.getElementById('transactionRows').appendChild(row);
    });

    // 3. Calculation Trigger (The "Bridge" to your Engine)
    function runCalculation() {
        // Collect data from DOM
        const rows = document.querySelectorAll('.trans-row');
        transactions = Array.from(rows).map(row => ({
            date: row.querySelector('.trans-date').value,
            type: row.querySelector('.trans-type').value,
            amount: parseFloat(row.querySelector('.trans-amount').value) || 0
        })).filter(t => t.date && t.amount > 0);

        const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
        
        // Call your LedgerEngine
        const schedule = FinanceEngine.LoanEngine.calculateCLHL(transactions, annualRate);
        
        // Render Output
        displayResults(schedule);
    }

    function displayResults(schedule) {
        const view = document.getElementById('resultsView');
        view.innerHTML = `<table>
            <tr><th>Date</th><th>Principal</th><th>Unpaid Interest</th></tr>
            ${schedule.map(s => `<tr>
                <td>${s.date}</td>
                <td>${FinanceEngine.Formatters.formatIndianCurrency(s.principal.toFixed(0))}</td>
                <td>${FinanceEngine.Formatters.formatIndianCurrency(s.interest.toFixed(0))}</td>
            </tr>`).join('')}
        </table>`;
    }

    // Attach event listeners for auto-calc
    container.addEventListener('input', runCalculation);
});
