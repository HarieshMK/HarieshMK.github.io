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

    if(superArea && pricePerSqft) {
        [superArea, pricePerSqft].forEach(el => el.addEventListener('input', updateBasicCost));
    }

    // --- STANDARDIZED ROW CREATOR ---
    function createRow(name = '', amount = '', isDefault = false) {
        const row = document.createElement('div');
        row.className = 'charge-row'; 
        row.innerHTML = `
            <input type="text" value="${name}" class="charge-name" placeholder="e.g. Clubhouse, Parking...">
            <input type="number" value="${amount}" class="charge-amount" placeholder="Amount (₹)">
            <label class="action-col" style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" class="add-to-cost-check" checked ${isDefault ? 'disabled' : ''}>
                <span style="font-size: 0.75rem; color: #64748b;">Add to Cost</span>
            </label>
            <div class="action-col">${isDefault ? '🔒' : '<button type="button" class="btn-delete"><i class="fas fa-trash"></i></button>'}</div>
        `;
        
        row.querySelector('.charge-amount').addEventListener('input', runCalculation);
        row.querySelector('.add-to-cost-check').addEventListener('change', runCalculation);
            
        if (!isDefault) {
            row.querySelector('.btn-delete').addEventListener('click', () => {
                row.remove();
                runCalculation();
            });
        }
        return row;
    }

// --- MILESTONE ROW CREATOR ---
    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    const milestoneBody = document.getElementById('milestoneBody');

    function createMilestoneRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="milestone-name" placeholder="e.g. Plinth"></td>
            <td><input type="date" class="milestone-date"></td>
            <td class="milestone-actions" style="overflow: visible;">
                <button type="button" class="btn-dots">⋮</button>
                <div class="action-menu" style="display: none;">
                    <button type="button" class="btn-edit">Edit</button>
                    <button type="button" class="btn-duplicate">Duplicate</button>
                    <button type="button" class="btn-delete" style="color: red;">Delete</button>
                </div>
            </td>
        `;

        const dotsBtn = row.querySelector('.btn-dots');
        const menu = row.querySelector('.action-menu');

        // Toggle menu
        dotsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other menus first
            document.querySelectorAll('.action-menu').forEach(m => m.style.display = 'none');
            // Toggle current
            menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
        });

        // Delete Logic
        row.querySelector('.btn-delete').addEventListener('click', () => {
            row.remove();
            runCalculation();
        });

        // Duplicate Logic
        row.querySelector('.btn-duplicate').addEventListener('click', () => {
            const newRow = createMilestoneRow();
            newRow.querySelector('.milestone-name').value = row.querySelector('.milestone-name').value;
            newRow.querySelector('.milestone-date').value = row.querySelector('.milestone-date').value;
            milestoneBody.appendChild(newRow);
            menu.style.display = 'none';
            runCalculation();
        });

        row.addEventListener('input', runCalculation);
        milestoneBody.appendChild(row);
    }

    // --- BUTTON LOGIC ---
    const addChargeBtn = document.getElementById('addChargeBtn');
    const container = document.getElementById('extraChargesContainer');
    
    if (addChargeBtn && container) {
        addChargeBtn.addEventListener('click', () => {
            const newRow = createRow('', '', false);
            container.appendChild(newRow);
            runCalculation();
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
        if (!basicCost) return;

        let extraChargesTotal = 0;
        document.querySelectorAll('.charge-row').forEach(row => {
            const amountInput = row.querySelector('.charge-amount');
            const addToCost = row.querySelector('.add-to-cost-check');
            if (amountInput && addToCost && addToCost.checked) {
                extraChargesTotal += parseFloat(amountInput.value) || 0;
            }
        });

        const basic = parseFloat(basicCost.value) || 0;
        const finalBasic = basic + extraChargesTotal;
        
        // 1. Collect Milestones
        const milestoneRows = document.querySelectorAll('#milestoneBody tr');
        const milestones = Array.from(milestoneRows).map(row => ({
            name: row.querySelector('.milestone-name').value,
            date: row.querySelector('.milestone-date').value
        })).filter(m => m.date !== '');

        // 2. Call Engine for Moratorium (with proper closure)
        if (typeof FinanceEngine !== 'undefined') {
            const moroEndDate = FinanceEngine.LoanEngine.getMoratoriumEndDate(
                document.getElementById('loanStartDate').value,
                document.querySelector('input[name="moroType"]:checked').value,
                parseFloat(document.getElementById('customMoroMonths').value) || 0,
                milestones
            );
            // You can log or use moroEndDate here
        }

        // 3. Loan Data
        const loanData = {
            amount: parseFloat(document.getElementById('loanAmount').value) || 0,
            rate: parseFloat(document.getElementById('interestRate').value) || 0,
            tenure: parseFloat(document.getElementById('tenureYears').value) || 0,
            startDate: document.getElementById('loanStartDate').value,
            emiDate: document.getElementById('emiStartDate').value,
            moroType: document.querySelector('input[name="moroType"]:checked').value,
            customMoroMonths: parseFloat(document.getElementById('customMoroMonths').value) || 0
        };

        const gstAmount = (typeof FinanceEngine !== 'undefined') ? FinanceEngine.GSTHelper.calculateGST(finalBasic) : 0;
        const totalPropCost = document.getElementById('totalPropertyCost');
        if (totalPropCost) totalPropCost.innerText = `₹${Math.round(finalBasic + gstAmount).toLocaleString()}`;

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

            if (closingPrincipal) closingPrincipal.innerText = `₹${Math.round(last.principal).toLocaleString()}`;
            if (unpaidInterest) unpaidInterest.innerText = `₹${Math.round(last.interest).toLocaleString()}`;
        }
    }

    function handleMoratoriumUI() {
    const isCustom = document.querySelector('input[name="moroType"]:checked').value === 'custom';
    const customInput = document.getElementById('customMoroMonths');
    customInput.disabled = !isCustom;
    if (!isCustom) customInput.value = ''; // Clear if not selected
}
// Add this to the change listener for radios:
document.querySelectorAll('input[name="moroType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        handleMoratoriumUI();
        runCalculation();
    });
});
    // --- CONSOLIDATED LISTENERS ---
    
    // 1. Add listeners for all numeric and date inputs
    const allInputs = [
        'loanAmount', 'interestRate', 'tenureYears', 
        'loanStartDate', 'emiStartDate', 'customMoroMonths'
    ];

    allInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalculation);
    });

    // 2. Listener for radio buttons (updates UI and runs calculation)
    document.querySelectorAll('input[name="moroType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            handleMoratoriumUI();
            runCalculation();
        });
    });
    
    // 3. Button listeners
    if(addBtn) addBtn.addEventListener('click', () => addRow());
    if(addMilestoneBtn) addMilestoneBtn.addEventListener('click', () => createMilestoneRow());

    // 4. Initialize UI state on page load
    handleMoratoriumUI();
    updateBasicCost();

    // Close action menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.btn-dots')) {
            document.querySelectorAll('.action-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});
