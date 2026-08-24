document.addEventListener('DOMContentLoaded', () => {

    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');
    const loanAmountInput = document.getElementById('loanAmount');
    const ltvRatioInput = document.getElementById('ltvRatio');
    const customMonthsInput = document.getElementById('customMoroMonths');
    const customRadio = document.querySelector('input[name="moroType"][value="custom"]');
    const fromInput = document.getElementById('fillStartMonth');
    const toInput = document.getElementById('fillEndMonth');
    const amtInput = document.getElementById('fillEmiAmount');

    [fromInput, toInput, amtInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateToolbarButtonStates);
        }
    });

    updateToolbarButtonStates();

    if (customMonthsInput && customRadio) {
        customMonthsInput.addEventListener('focus', () => {
            customRadio.checked = true;
            customRadio.dispatchEvent(new Event('change'));
        });
        
        customMonthsInput.addEventListener('input', () => {
            customRadio.checked = true;
        });
    }

    if(superArea && pricePerSqft) {
        [superArea, pricePerSqft].forEach(el => el.addEventListener('input', updateBasicCost));
    }

    if(ltvRatioInput) {
        ltvRatioInput.addEventListener('input', () => {
            updateOverallLoanAmount();
            runCalculation();
        });
    }

    if(loanAmountInput) {
        loanAmountInput.addEventListener('input', () => {
            loanAmountInput.dataset.manual = 'true';
            runCalculation();
        });
    }

    const addChargeBtn = document.getElementById('addChargeBtn');
    const container = document.getElementById('extraChargesContainer');
    
    if (addChargeBtn && container) {
        addChargeBtn.addEventListener('click', () => {
            const newRow = createRow('', '', false);
            container.appendChild(newRow);
            calculateTotalPropertyCost();
            runCalculation();
        });
    }
    
// --- HOOK RANGE TOOLBAR BUTTONS ---
const applyRangeBtn = document.getElementById('applyRangeBtn');
const copyAccruedRangeBtn = document.getElementById('copyAccruedRangeBtn');
const clearRangeBtn = document.getElementById('clearRangeBtn');

if (applyRangeBtn) {
    applyRangeBtn.addEventListener('click', handleApplyRange);
}

if (copyAccruedRangeBtn) {
    copyAccruedRangeBtn.addEventListener('click', handleCopyAccrued);
}

if (clearRangeBtn) {
    clearRangeBtn.addEventListener('click', handleClearRange);
}
    const addBtn = document.getElementById('addRowBtn');
    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    document.querySelectorAll('input[name="moroType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            handleMoratoriumUI();
            runCalculation();
        });
    });

    const allInputs = [
        'interestRate', 'tenureYears', 
        'loanStartDate', 'emiStartDate', 'customMoroMonths'
    ];

    allInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalculation);
    });
    
    if(addBtn) addBtn.addEventListener('click', () => addRow());
    if(addMilestoneBtn) addMilestoneBtn.addEventListener('click', () => createMilestoneRow());
    

    

    // 1. Hook Undo Button Click
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (undoStack.length === 0) return;

            const previousState = undoStack.pop();
            window.loadedPlannedEmis = { ...previousState };

            const rows = document.querySelectorAll('#loanPlanBody tr');
            rows.forEach((row, idx) => {
                const monthIdx = idx + 1;
                const inputEl = row.querySelector('.planned-emi-input');
                if (inputEl) {
                    inputEl.value = previousState[monthIdx] !== undefined ? previousState[monthIdx] : '';
                }
            });

            updateUndoButtonUI();
            runCalculation();
        });
    }

    // 2. Track individual manual inputs in the table for Undo
    const loanPlanBody = document.getElementById('loanPlanBody');
    if (loanPlanBody) {
        loanPlanBody.addEventListener('focusin', (e) => {
            if (e.target.matches('.planned-emi-input')) {
                saveStateToUndoStack();
            }
        });
        loanPlanBody.addEventListener('input', (e) => {
            if (e.target.matches('.planned-emi-input')) {
                if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};
                const row = e.target.closest('tr');
                const monthIdx = parseInt(row.dataset.month, 10);
                
                window.loadedPlannedEmis[monthIdx] = parseFloat(e.target.value) || 0;
                if (typeof runCalculation === 'function') {
                    runCalculation();
                }
            }
        });
    }

    if (typeof handleMoratoriumUI === 'function') handleMoratoriumUI();
    if (typeof updateBasicCost === 'function') updateBasicCost();
    if (typeof loadCalculatorDataFromSupabase === 'function') loadCalculatorDataFromSupabase();

    document.addEventListener('click', (e) => {
        if (!e.target.matches('.btn-dots')) {
            document.querySelectorAll('.action-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    let hasUnsavedChanges = false;

    document.addEventListener('input', (e) => {
        if (e.target.matches('input, select')) {
            hasUnsavedChanges = true;
            const dot = document.getElementById('unsavedDot');
            if (dot) dot.style.display = 'block';
        }
    });

    const floatingSaveBtn = document.getElementById('floatingSaveBtn');
    if (floatingSaveBtn) {
        floatingSaveBtn.addEventListener('click', async () => {
            const activeSupabase = window.supabaseClient || window.supabase;
            if (!activeSupabase) {
                alert("Supabase client not found!");
                return;
            }

            const { data: { user }, error: userError } = await activeSupabase.auth.getUser();
            
            if (userError || !user) {
                alert("Oops, we don't know who you are, can you please sign in with your account so that we know where to put your numbers? 🏠✍️");
                return;
            }

            floatingSaveBtn.disabled = true;
            const originalText = floatingSaveBtn.innerText;
            floatingSaveBtn.innerText = "Saving...";

            try {
                if (typeof saveCalculatorDataToSupabase === 'function') {
                    await saveCalculatorDataToSupabase();
                }
                hasUnsavedChanges = false;
                const dot = document.getElementById('unsavedDot');
                if (dot) dot.style.display = 'none';
            } finally {
                floatingSaveBtn.disabled = false;
                floatingSaveBtn.innerText = originalText;
            }
        });
    }

    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Hold on! You have typed in some brilliant numbers but haven’t saved them to your database yet. Do you want to leave and lose them?';
            return e.returnValue;
        }
    });
});

function auditLoanMath(scheduleData, initialLoanAmount, annualInterestRate) {
    let totalPrincipalPaidSum = 0;
    let hasAnomalies = false;
    
    console.group('%c🔍 DEEP-DIVE LOAN MATH AUDIT', 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');
    console.log(`Target Initial Loan: ₹${initialLoanAmount}`);

    scheduleData.forEach((row, index) => {
        const monthNum = index + 1;
        const opening = row.openingBalance || 0; // We will track opening if available
        const interest = row.interest;
        const principal = row.principal;
        const partPayment = row.partPayment;
        const closing = row.closingBalance;

        totalPrincipalPaidSum += (principal + partPayment);

        // Check for common logic traps:
        // 1. Did interest accrue on a negative or zero balance?
        if (opening <= 0 && interest > 0) {
            console.warn(`⚠️ Month ${monthNum}: Interest (₹${interest}) charged even though opening balance was ₹${opening}`);
            hasAnomalies = true;
        }

        // 2. Did principal paid exceed what was available?
        if ((principal + partPayment) > (opening + interest) && opening > 0) {
            // Note: sometimes part payments are large, but let's check basic over-reduction
        }
    });

    const finalClosingBalance = scheduleData[scheduleData.length - 1].closingBalance;
    console.log(`Sum of All Principal + Part Payments Paid: ₹${Math.round(totalPrincipalPaidSum)}`);
    console.log(`Difference from Initial Loan: ₹${Math.round(totalPrincipalPaidSum - initialLoanAmount)}`);

    if (Math.abs(totalPrincipalPaidSum - initialLoanAmount) > 50) {
        console.error(`❌ CRITICAL BUG FOUND: The total principal paid across the schedule does not match the loan amount! There is a mismatch of ₹${totalPrincipalPaidSum - initialLoanAmount}.`);
    } else {
        console.log(`✅ Principal Sum matches loan amount closely.`);
    }

    console.groupEnd();
}

function getTotalPropertyCostValue() {
    const basicCost = document.getElementById('basicCost');
    let extraChargesTotal = 0;
    document.querySelectorAll('.charge-row').forEach(row => {
        const amountInput = row.querySelector('.charge-amount');
        const addToCost = row.querySelector('.add-to-cost-check');
        if (amountInput && addToCost && addToCost.checked) {
            extraChargesTotal += parseFloat(amountInput.value) || 0;
        }
    });
    const basic = parseFloat(basicCost?.value) || 0;
    const finalBasic = basic + extraChargesTotal;
    const gstAmount = (typeof FinanceEngine !== 'undefined') ? FinanceEngine.GSTHelper.calculateGST(finalBasic) : 0;
    return finalBasic + gstAmount;
}

function updateOverallLoanAmount() {
    const loanAmountInput = document.getElementById('loanAmount');
    const ltvRatioInput = document.getElementById('ltvRatio');
    if (loanAmountInput && !loanAmountInput.dataset.manual) {
        const totalCost = getTotalPropertyCostValue();
        const ltv = (parseFloat(ltvRatioInput ? ltvRatioInput.value : 80) || 0) / 100;
        loanAmountInput.value = Math.round(totalCost * ltv);
    }
}

function calculateTotalPropertyCost() {
    const totalWithGST = getTotalPropertyCostValue();
    const basicCost = document.getElementById('basicCost');
    const gstDisplay = document.getElementById('gstDisplay');
    
    const basic = parseFloat(basicCost?.value) || 0;
    let extraChargesTotal = 0;
    document.querySelectorAll('.charge-row').forEach(row => {
        const amountInput = row.querySelector('.charge-amount');
        const addToCost = row.querySelector('.add-to-cost-check');
        if (amountInput && addToCost && addToCost.checked) {
            extraChargesTotal += parseFloat(amountInput.value) || 0;
        }
    });
    const finalBasic = basic + extraChargesTotal;
    const gstAmount = (typeof FinanceEngine !== 'undefined') ? FinanceEngine.GSTHelper.calculateGST(finalBasic) : 0;

    if (gstDisplay) gstDisplay.innerText = `₹${Math.round(gstAmount).toLocaleString()}`;
    
    const totalPropCost = document.getElementById('totalPropertyCost');
    if (totalPropCost) totalPropCost.innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
    
    updateOverallLoanAmount();
    return totalWithGST;
}

function updateBasicCost() {
    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');

    if(superArea && pricePerSqft && basicCost) {
        basicCost.value = (parseFloat(superArea.value) || 0) * (parseFloat(pricePerSqft.value) || 0);
    }
    calculateTotalPropertyCost();
    runCalculation();
}
// --- MULTI-STEP UNDO HISTORY SYSTEM (50 Steps Max) ---
let undoStack = [];
const MAX_UNDO_STEPS = 50;

    function saveStateToUndoStack() {
        const currentState = {};
        document.querySelectorAll('#loanPlanBody tr').forEach((row, idx) => {
            const monthIdx = idx + 1;
            const inputEl = row.querySelector('.planned-emi-input');
            if (inputEl) {
                currentState[monthIdx] = inputEl.value;
            }
        });
        
        undoStack.push(currentState);
        if (undoStack.length > MAX_UNDO_STEPS) {
            undoStack.shift(); 
        }
        updateUndoButtonUI();
    }

    function updateUndoButtonUI() {
        const undoBtnEl = document.getElementById('undoBtn');
        if (undoBtnEl) {
            const canUndo = undoStack.length > 0;
            undoBtnEl.disabled = !canUndo;
            undoBtnEl.style.opacity = canUndo ? '1' : '0.5';
            undoBtnEl.style.cursor = canUndo ? 'pointer' : 'not-allowed';
        }
    }
// --- TOOLBAR RANGE-FILL LOGIC (Placed inside the main script scope) ---
    function handleApplyRange() {
        saveStateToUndoStack(); // Now it can finally see this!

        const fromVal = parseInt(document.getElementById('fillStartMonth').value);
        const toVal = parseInt(document.getElementById('fillEndMonth').value);
        const amtVal = parseFloat(document.getElementById('fillEmiAmount').value);

        if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};

        for (let m = fromVal; m <= toVal; m++) {
            window.loadedPlannedEmis[m] = amtVal;
        }

        if (typeof runCalculation === 'function') runCalculation();
    }

    function handleCopyAccrued() {
        saveStateToUndoStack();

        const fromVal = parseInt(document.getElementById('fillStartMonth').value);
        const toVal = parseInt(document.getElementById('fillEndMonth').value);

        if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};
        for (let m = fromVal; m <= toVal; m++) {
            delete window.loadedPlannedEmis[m];
        }

        if (typeof runCalculation === 'function') runCalculation();
    }

    function handleClearRange() {
        saveStateToUndoStack();
        const fromVal = parseInt(document.getElementById('fillStartMonth').value);
        const toVal = parseInt(document.getElementById('fillEndMonth').value);
        if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};
        for (let m = fromVal; m <= toVal; m++) {
            window.loadedPlannedEmis[m] = ""; 
        }
        if (typeof runCalculation === 'function') runCalculation();
    }

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
    
    row.querySelector('.charge-amount').addEventListener('input', () => {
        calculateTotalPropertyCost();
        runCalculation();
    });
    row.querySelector('.add-to-cost-check').addEventListener('change', () => {
        calculateTotalPropertyCost();
        runCalculation();
    });
        
    if (!isDefault) {
        row.querySelector('.btn-delete').addEventListener('click', () => {
            row.remove();
            calculateTotalPropertyCost();
            runCalculation();
        });
    }
    return row;
}

function createMilestoneRow(name = '', date = '', pct = '', loanAmt = '', isPartOfLoan = true) {
    const milestoneBody = document.getElementById('milestoneBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="milestone-name" value="${name}" placeholder="e.g. Plinth"></td>
        <td><input type="date" class="milestone-date" value="${date}"></td>
        <td><input type="number" class="milestone-pct" value="${pct}" placeholder="%"></td>
        <td><input type="number" class="milestone-loan-amount" value="${loanAmt}" placeholder="₹"></td>
        <td style="text-align: center;"><input type="checkbox" class="part-of-loan-check" ${isPartOfLoan ? 'checked' : ''}></td>
        <td class="milestone-actions" style="overflow: visible;">
            <button type="button" class="btn-dots">⋮</button>
            <div class="action-menu" style="display: none;">
                <button type="button" class="btn-duplicate">Duplicate</button>
                <button type="button" class="btn-menu-delete">Delete</button>
            </div>
        </td>
    `;

    const dotsBtn = row.querySelector('.btn-dots');
    const menu = row.querySelector('.action-menu');
    const pctInput = row.querySelector('.milestone-pct');
    const loanAmtInput = row.querySelector('.milestone-loan-amount');
    const checkInput = row.querySelector('.part-of-loan-check');

    function updateMilestoneLoanAmount() {
        if (!checkInput.checked) {
            loanAmtInput.value = 0;
            loanAmtInput.disabled = true;
        } else {
            loanAmtInput.disabled = false;
            const pct = parseFloat(pctInput.value) || 0;
            const totalCost = getTotalPropertyCostValue();
            
            if (pct > 0 && totalCost > 0 && !loanAmtInput.dataset.manual) {
                loanAmtInput.value = Math.round((pct / 100) * totalCost);
            }
        }
    }

    updateMilestoneLoanAmount();

    pctInput.addEventListener('input', () => {
        loanAmtInput.dataset.manual = ''; 
        updateMilestoneLoanAmount();
        runCalculation();
    });

    checkInput.addEventListener('change', () => {
        updateMilestoneLoanAmount();
        runCalculation();
    });

    loanAmtInput.addEventListener('input', () => {
        loanAmtInput.dataset.manual = 'true';
        runCalculation();
    });

    dotsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.action-menu').forEach(m => {
            if (m !== menu) m.style.display = 'none';
        });
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    });

    row.querySelector('.btn-menu-delete').addEventListener('click', () => {
        row.remove();
        runCalculation();
    });

    row.querySelector('.btn-duplicate').addEventListener('click', () => {
        const newRow = createMilestoneRow(
            row.querySelector('.milestone-name').value,
            row.querySelector('.milestone-date').value,
            pctInput.value,
            loanAmtInput.value,
            checkInput.checked
        );
        milestoneBody.appendChild(newRow);
        menu.style.display = 'none';
        runCalculation();
    });

    row.addEventListener('input', runCalculation);
    milestoneBody.appendChild(row);
    return row;
}

function addRow(date = '', type = 'payment', amount = '') {
    const tableBody = document.getElementById('transactionBody');
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
    const loanPlanBody = document.getElementById('loanPlanBody');
    const amortizationContainer = document.getElementById('loanPlanContainer') || loanPlanBody?.parentElement; 
    
    // --- 1. GATHER ALL INPUTS FOR VALIDATION ---
    let missingErrors = [];

    const interestRateVal = document.getElementById('interestRate')?.value;
    if (!interestRateVal || parseFloat(interestRateVal) <= 0) {
        missingErrors.push("• Enter a valid annual interest rate.");
    }

    const tenureYearsVal = document.getElementById('tenureYears')?.value;
    if (!tenureYearsVal || parseInt(tenureYearsVal) <= 0) {
        missingErrors.push("• Enter a valid loan tenure in years.");
    }

    const loanStartDateVal = document.getElementById('loanStartDate')?.value;
    if (!loanStartDateVal) {
        missingErrors.push("• Select a loan start date.");
    }

    const moroTypeChecked = document.querySelector('input[name="moroType"]:checked');
    if (!moroTypeChecked) {
        missingErrors.push("• Select or configure a Moratorium Period option.");
    } else if (moroTypeChecked.value === 'custom') {
        const customMoroMonthsVal = document.getElementById('customMoroMonths')?.value;
        if (customMoroMonthsVal === '' || parseInt(customMoroMonthsVal) < 0) {
            missingErrors.push("• Specify the custom moratorium duration in months.");
        }
    }

    // --- 2. VALIDATE PROJECT MILESTONES & 100% TOTAL MATCH ---
    const milestoneRows = document.querySelectorAll('#milestoneBody tr');
    if (milestoneRows.length === 0) {
        missingErrors.push("• Add at least one project milestone.");
    }

    let totalMilestonePct = 0;
    milestoneRows.forEach((row, index) => {
        const name = row.querySelector('.milestone-name')?.value.trim();
        const pct = parseFloat(row.querySelector('.milestone-pct')?.value) || 0;
        const date = row.querySelector('.milestone-date')?.value;
        const loanAmt = parseFloat(row.querySelector('.milestone-loan-amount')?.value) || 0;

        totalMilestonePct += pct;

        if (!name) {
            missingErrors.push(`• Milestone #${index + 1}: Name is missing.`);
        }
        if (pct <= 0) {
            missingErrors.push(`• Milestone #${index + 1} (${name || 'Unnamed'}): Percentage must be greater than 0%.`);
        }
        if (!date) {
            missingErrors.push(`• Milestone #${index + 1} (${name || 'Unnamed'}): Date is missing.`);
        }
        if (loanAmt < 0) {
            missingErrors.push(`• Milestone #${index + 1} (${name || 'Unnamed'}): Loan amount cannot be negative.`);
        }
    });

    if (milestoneRows.length > 0 && Math.abs(totalMilestonePct - 100) > 0.01) {
        missingErrors.push(`• Project milestone percentages total ${totalMilestonePct.toFixed(2)}%. They must equal exactly 100%.`);
    }

    // --- 3. HANDLE ERRORS / RENDER WARNING MESSAGE ---
    if (missingErrors.length > 0) {
        if (loanPlanBody) {
            loanPlanBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: left; padding: 25px; color: #ff6b6b; background: rgba(255, 107, 107, 0.05);">
                        <strong style="font-size: 1.05rem; display: block; margin-bottom: 10px;">⚠️ Amortization Table Locked: Complete the following requirements:</strong>
                        <div style="line-height: 1.6; font-size: 0.95rem;">
                            ${missingErrors.join('<br>')}
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Clear summary output numbers
        const closingPrincipalEl = document.getElementById('closingPrincipal');
        const unpaidInterestEl = document.getElementById('unpaidInterest');
        if (closingPrincipalEl) closingPrincipalEl.innerText = `₹0`;
        if (unpaidInterestEl) unpaidInterestEl.innerText = `₹0`;
        
        return; // Halt calculation completely
    }

    const basicCost = document.getElementById('basicCost');
    if (!basicCost) return;

    const totalWithGST = getTotalPropertyCostValue();
    const totalPropCost = document.getElementById('totalPropertyCost');
    if (totalPropCost) totalPropCost.innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
    
    let cumulativePct = 0;
    let cumulativeLoanAmt = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const milestones = Array.from(milestoneRows).map(row => {
        const dateVal = row.querySelector('.milestone-date')?.value || '';
        const mData = {
            name: row.querySelector('.milestone-name')?.value || '',
            date: dateVal,
            pct: parseFloat(row.querySelector('.milestone-pct')?.value) || 0,
            loanAmount: parseFloat(row.querySelector('.milestone-loan-amount')?.value) || 0,
            isPartOfLoan: row.querySelector('.part-of-loan-check')?.checked ?? true
        };

        if (mData.date && mData.isPartOfLoan) {
            const milestoneDate = new Date(mData.date);
            milestoneDate.setHours(0, 0, 0, 0);

            if (milestoneDate <= today) {
                cumulativePct += mData.pct; 
                cumulativeLoanAmt += mData.loanAmount; 
            }
        }
        return mData;
    }).filter(m => m.date !== '');

    const totalPctEl = document.getElementById('totalMilestonePct');
    const totalLoanEl = document.getElementById('totalMilestoneLoan');
    if (totalPctEl) totalPctEl.innerText = `${cumulativePct}%`;
    if (totalLoanEl) totalLoanEl.innerText = `₹${Math.round(cumulativeLoanAmt).toLocaleString()}`;

    const loanStartDateVal2 = document.getElementById('loanStartDate')?.value;
    const moroTypeChecked2 = document.querySelector('input[name="moroType"]:checked');
    const customMoroMonthsVal = document.getElementById('customMoroMonths')?.value;
    
    let moratoriumMonths = 18;
    if (moroTypeChecked2) {
        if (moroTypeChecked2.value === 'custom') {
            moratoriumMonths = parseInt(customMoroMonthsVal) || 0;
        } else if (moroTypeChecked2.value === 'milestone') {
            if (milestones.length > 0 && loanStartDateVal2) {
                const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
                const lastMDate = new Date(sortedMilestones[sortedMilestones.length - 1].date);
                const startD = new Date(loanStartDateVal2);
                const diffTime = lastMDate - startD;
                const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                moratoriumMonths = Math.max(0, diffMonths);
            } else {
                moratoriumMonths = 0;
            }
        } else {
            moratoriumMonths = parseInt(moroTypeChecked2.value) || 18;
        }
    }

    const interestEl = document.getElementById('interestRate');
    const annualRate = interestEl ? parseFloat(interestEl.value) || 0 : 0;
    const monthlyRate = annualRate / 12 / 100;
    const tenureYears = parseInt(document.getElementById('tenureYears')?.value) || 20;
    const totalMonths = tenureYears * 12;

    if (!loanPlanBody) return;
    const existingRows = loanPlanBody.querySelectorAll('tr');
    const isTableBuilt = existingRows.length === totalMonths;
    if (!isTableBuilt) {
        loanPlanBody.innerHTML = '';
    }

    let openingBalance = 0;
    let cumulativeUnpaidInterest = 0;
    
    // --- ADD THESE VARIABLES TO CACHE FIXED FULL EMI ---
    let lockedFullEmi = 0;
    let fullEmiLockedMonth = null;

    function getMilestoneDisbursementForMonth(yearMonthStr) {
        let addedAmt = 0;
        milestones.forEach(m => {
            if (m.date && m.isPartOfLoan) {
                const mYm = m.date.substring(0, 7); 
                if (mYm === yearMonthStr) {
                    addedAmt += m.loanAmount;
                }
            }
        });
        return addedAmt;
    }

    let currentMonthDate = loanStartDateVal ? new Date(loanStartDateVal) : new Date();
    currentMonthDate.setDate(1);
    let totalPrincipalPaidSum = 0;
    let totalInterestPaidSum = 0;
    let totalExtraPaidSum = 0;
    let baselineInterestSum = 0;
    let stdOpeningBalance = 0;
    let loanClosureMonthIndex = null;
    let previousClosingBalance = 0;

    for (let monthIdx = 1; monthIdx <= totalMonths; monthIdx++) {
        const monthName = currentMonthDate.toLocaleString('en-US', { month: 'short' });
        const yearShort = currentMonthDate.toLocaleString('en-US', { year: '2-digit' });
        const formattedDate = `${monthName} '${yearShort}`; 
        const displayLabel = `${monthIdx} (${formattedDate})`;

        const ymStr = currentMonthDate.toISOString().substring(0, 7);
        const milestoneDisbursement = getMilestoneDisbursementForMonth(ymStr);
        
        if (monthIdx === 1) {
            openingBalance = cumulativeLoanAmt;
        } else {
            openingBalance = previousClosingBalance + milestoneDisbursement;
        }

        let row;
        if (isTableBuilt) {
            row = loanPlanBody.querySelector(`tr[data-month="${monthIdx}"]`);
        }

        if (!row) {
            row = document.createElement('tr');
            row.dataset.month = monthIdx;
            row.innerHTML = `
                <td class="col-left">${displayLabel}</td>
                <td class="col-right"></td>
                <td class="col-right"></td>
                <td class="col-right">
                    <input type="number" step="any" class="planned-emi-input" placeholder="₹">
                </td>
                <td class="col-right interest-cell">₹0</td>
                <td class="col-right principal-paid-cell">₹0</td>
                <td class="col-right part-payment-cell">₹0</td>
                <td class="col-right closing-balance-cell">₹0</td>
            `;
            loanPlanBody.appendChild(row);
            
            const inputEl = row.querySelector('.planned-emi-input');
            inputEl.addEventListener('input', () => {
                if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};
                window.loadedPlannedEmis[monthIdx] = parseFloat(inputEl.value) || 0;
                runCalculation();
            });
        }

        let accruedInterest = 0;
        let principalPaid = 0;
        let partPaymentColVal = 0;
        let capitalizedShortfall = 0;
        let standardEmiForMonth = 0;
        let isPreEmi = monthIdx <= moratoriumMonths;
        const inputEl = row.querySelector('.planned-emi-input');

        // --- SINGLE CLEAN ZERO-BALANCE GUARD (No 'continue') ---
        if (openingBalance <= 0 && milestoneDisbursement === 0) {
            openingBalance = 0; 
            row.children[0].innerText = displayLabel;
            row.children[1].innerText = `₹0`; // Opening Balance
            row.children[2].innerText = `₹0`; // EMI
            row.children[4].innerText = `₹0`; // Interest component
            row.children[5].innerText = `₹0`; // Principal component
            row.children[6].innerText = `₹0`; // Part Payment
            row.children[7].innerText = `₹0`; // Closing Balance
            
            if (loanClosureMonthIndex === null) {
                loanClosureMonthIndex = monthIdx;
            }

            previousClosingBalance = 0;
            currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
            continue;
        }

        accruedInterest = openingBalance * monthlyRate;
        let remainingTenureMonths = totalMonths - monthIdx + 1;
        standardEmiForMonth = accruedInterest;

        if (!isPreEmi) {
            if (lockedFullEmi === 0 || fullEmiLockedMonth === null) {
                if (monthlyRate > 0 && remainingTenureMonths > 0) {
                    lockedFullEmi = (openingBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingTenureMonths)) / (Math.pow(1 + monthlyRate, remainingTenureMonths) - 1);
                } else if (remainingTenureMonths > 0) {
                    lockedFullEmi = openingBalance / remainingTenureMonths;
                }
                fullEmiLockedMonth = monthIdx;
            }
            standardEmiForMonth = lockedFullEmi;
        }

        const defaultPlannedEmi = standardEmiForMonth;
        let userPlannedEmiVal;
        if (window.forceDefaultEmis) {
            userPlannedEmiVal = defaultPlannedEmi; 
        } else if (window.loadedPlannedEmis && window.loadedPlannedEmis[monthIdx] !== undefined) {
            const rawVal = window.loadedPlannedEmis[monthIdx];
            userPlannedEmiVal = (rawVal === "" ? "" : rawVal);
        } else {
            userPlannedEmiVal = defaultPlannedEmi;
        }

        row.children[0].innerText = displayLabel;
        row.children[1].innerText = `₹${Math.round(openingBalance).toLocaleString()}`;
        row.children[2].innerHTML = `₹${Math.round(standardEmiForMonth).toLocaleString()} <span style="font-size:0.75rem; color:var(--text-secondary);">(${isPreEmi ? 'Pre-EMI' : 'Full EMI'})</span>`;
        
        if (document.activeElement !== inputEl) {
            inputEl.value = (userPlannedEmiVal === "" || isNaN(userPlannedEmiVal)) ? "" : Math.round(userPlannedEmiVal * 100) / 100;
        }

        const plannedEmiVal = inputEl.value === '' ? 0 : (parseFloat(inputEl.value) || userPlannedEmiVal || 0);
        let effectivePlannedEmi = plannedEmiVal;

        if (isPreEmi) {
            principalPaid = 0;
            if (effectivePlannedEmi >= accruedInterest) {
                partPaymentColVal = effectivePlannedEmi - accruedInterest;
            } else {
                const shortfall = accruedInterest - effectivePlannedEmi;
                capitalizedShortfall = shortfall; 
                cumulativeUnpaidInterest += shortfall;
                partPaymentColVal = 0;
            }
        } else {
            const interestComponent = accruedInterest;
            if (effectivePlannedEmi < interestComponent) {
                const shortfall = interestComponent - effectivePlannedEmi;
                capitalizedStartfall = shortfall; 
                cumulativeUnpaidInterest += shortfall;
                principalPaid = 0;
                partPaymentColVal = 0;
            } else if (effectivePlannedEmi >= standardEmiForMonth) {
                principalPaid = standardEmiForMonth - interestComponent;
                partPaymentColVal = effectivePlannedEmi - standardEmiForMonth;
            } else {
                principalPaid = effectivePlannedEmi - interestComponent;
                partPaymentColVal = 0;
            }
        }
        
        // --- ACCUMULATE ACTUAL METRICS ---
        totalPrincipalPaidSum += (principalPaid + partPaymentColVal);
        totalInterestPaidSum += accruedInterest;
        totalExtraPaidSum += partPaymentColVal;

        let stdDisbursement = milestoneDisbursement;
        if (monthIdx === 1) {
            stdOpeningBalance = cumulativeLoanAmt;
        } else {
            stdOpeningBalance = stdOpeningBalance + stdDisbursement;
        }
        let stdAccruedInterest = stdOpeningBalance * monthlyRate;
        let stdStandardEmi = isPreEmi ? stdAccruedInterest : lockedFullEmi;
        let stdPrincipalPaid = Math.max(0, stdStandardEmi - stdAccruedInterest);
        baselineInterestSum += stdAccruedInterest;
        stdOpeningBalance = Math.max(0, stdOpeningBalance - stdPrincipalPaid);
        
        const isShortfall = effectivePlannedEmi < accruedInterest && inputEl.value !== '';
        inputEl.classList.toggle('shortfall-highlight', isShortfall);
        // --- PRECISION CLAMP: Ensure we never pay more principal than what is actually owed ---
        let totalPrincipalReduction = principalPaid + partPaymentColVal;
        if (totalPrincipalReduction > openingBalance) {
            let excess = totalPrincipalReduction - openingBalance;
            if (partPaymentColVal >= excess) {
                partPaymentColVal -= excess;
            } else {
                excess -= partPaymentColVal;
                partPaymentColVal = 0;
                principalPaid = Math.max(0, principalPaid - excess);
            }
            totalPrincipalReduction = openingBalance;
        }
        let closingBalance = openingBalance - totalPrincipalReduction + capitalizedShortfall;
        if (Math.abs(closingBalance) < 0.01) closingBalance = 0;
        if (closingBalance <= 0 && loanClosureMonthIndex === null && monthIdx > moratoriumMonths) {
            loanClosureMonthIndex = monthIdx;
        }
        
        row.children[5].innerText = `₹${Math.round(principalPaid).toLocaleString()}`;
        row.children[6].innerText = `₹${Math.round(partPaymentColVal).toLocaleString()}`;
        row.children[4].innerText = `₹${Math.round(accruedInterest).toLocaleString()}`;
        row.children[7].innerText = `₹${Math.round(closingBalance).toLocaleString()}`;

        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
        openingBalance = Math.max(0, closingBalance);
        previousClosingBalance = closingBalance;
    }

    const closingPrincipalEl = document.getElementById('closingPrincipal');
    const unpaidInterestEl = document.getElementById('unpaidInterest');
    
    const finalRow = loanPlanBody.lastElementChild;
    const finalClosingBal = finalRow ? parseFloat(finalRow.querySelector('.closing-balance-cell').innerText.replace(/[₹,]/g, '')) || 0 : 0;

    if (closingPrincipalEl) closingPrincipalEl.innerText = `₹${Math.round(finalClosingBal).toLocaleString()}`;
    if (Math.abs(cumulativeUnpaidInterest) < 0.01) cumulativeUnpaidInterest = 0;
    if (unpaidInterestEl) unpaidInterestEl.innerText = `₹${Math.round(cumulativeUnpaidInterest).toLocaleString()}`;

    // --- 📊 AUTOMATED AUDIT TRIGGER ---
    const rowsArray = Array.from(loanPlanBody.querySelectorAll('tr')).map(r => ({
        openingBalance: parseFloat(r.children[1]?.innerText.replace(/[₹,]/g, '')) || 0, // <--- Add this
        interest: parseFloat(r.querySelector('.interest-cell')?.innerText.replace(/[₹,]/g, '')) || 0,
        principal: parseFloat(r.querySelector('.principal-paid-cell')?.innerText.replace(/[₹,]/g, '')) || 0,
        partPayment: parseFloat(r.querySelector('.part-payment-cell')?.innerText.replace(/[₹,]/g, '')) || 0,
        closingBalance: parseFloat(r.querySelector('.closing-balance-cell')?.innerText.replace(/[₹,]/g, '')) || 0
    }));

    const initialLoan = parseFloat(document.getElementById('loanAmount')?.value) || 0;
    const loaderEl = document.getElementById('appLoader');
    const isLoaderHidden = !loaderEl || loaderEl.style.display === 'none';

    if (rowsArray.length > 0 && initialLoan > 0 && isLoaderHidden) {
        auditLoanMath(rowsArray, initialLoan, annualRate);
    }
    
    // --- 🚀 UPDATE SUMMARY FOOTER BAR DOM ELEMENTS ---
    const sumPrincipalEl = document.getElementById('summaryTotalPrincipal');
    const sumInterestEl = document.getElementById('summaryTotalInterest');
    const sumExtraEl = document.getElementById('summaryExtraPaid');
    const sumSavedEl = document.getElementById('summaryInterestSaved');
    const sumCloseDateEl = document.getElementById('summaryCloseDate');

    if (sumPrincipalEl) sumPrincipalEl.innerText = `₹ ${Math.round(totalPrincipalPaidSum).toLocaleString()}`;
    if (sumInterestEl) sumInterestEl.innerText = `₹ ${Math.round(totalInterestPaidSum).toLocaleString()}`;
    if (sumExtraEl) sumExtraEl.innerText = `₹ ${Math.round(totalExtraPaidSum).toLocaleString()}`;
    
    // Calculate Interest Saved (ignoring sub-rupee floating-point drift)
    let interestSaved = Math.max(0, baselineInterestSum - totalInterestPaidSum);
    if (interestSaved < 1) interestSaved = 0;
    if (sumSavedEl) sumSavedEl.innerText = `₹ ${Math.round(interestSaved).toLocaleString()}`;

    // Determine Est. Loan Closure Date
    if (loanClosureMonthIndex !== null) {
        if (loanStartDateVal) {
            let closureDate = new Date(loanStartDateVal);
            closureDate.setDate(1);
            closureDate.setMonth(closureDate.getMonth() + (loanClosureMonthIndex - 1));
            const cMonth = closureDate.toLocaleString('en-US', { month: 'short' });
            const cYear = closureDate.getFullYear();
            if (sumCloseDateEl) sumCloseDateEl.innerText = `${cMonth} ${cYear} 🎉`;
        } else {
            if (sumCloseDateEl) sumCloseDateEl.innerText = `Month ${loanClosureMonthIndex}`;
        }
    } else {
        if (loanStartDateVal && totalMonths > 0) {
            let finalDate = new Date(loanStartDateVal);
            finalDate.setDate(1);
            finalDate.setMonth(finalDate.getMonth() + (totalMonths - 1));
            const fMonth = finalDate.toLocaleString('en-US', { month: 'short' });
            const fYear = finalDate.getFullYear();
            if (sumCloseDateEl) sumCloseDateEl.innerText = `${fMonth} ${fYear} (Full Tenure)`;
        } else {
            if (sumCloseDateEl) sumCloseDateEl.innerText = `--`;
        }
    }
}

// --- TOOLBAR RANGE-FILL LOGIC ---

function updateToolbarButtonStates() {
    const fromInput = document.getElementById('fillStartMonth');
    const toInput = document.getElementById('fillEndMonth');
    const amtInput = document.getElementById('fillEmiAmount');

    const applyBtn = document.getElementById('applyRangeBtn');
    const copyBtn = document.getElementById('copyAccruedRangeBtn');
    const clearBtn = document.getElementById('clearRangeBtn');

    if (!fromInput || !toInput) return;

    const fromVal = parseInt(fromInput.value);
    const toVal = parseInt(toInput.value);
    const amtVal = parseFloat(amtInput?.value);

    // Validate range: integers, from > 0, and to >= from
    const isRangeValid = !isNaN(fromVal) && !isNaN(toVal) && fromVal > 0 && toVal >= fromVal;
    const isAmtValid = !isNaN(amtVal) && amtVal >= 0;

    // 5. Enablement rules:
    // Copy Accrued and Clear Range require valid 'From' and 'To' months
    if (copyBtn) copyBtn.disabled = !isRangeValid;
    if (clearBtn) clearBtn.disabled = !isRangeValid;

    // Apply to Range requires valid 'From', 'To', and an amount
    if (applyBtn) {
        applyBtn.disabled = !(isRangeValid && isAmtValid);
    }
}

function handleMoratoriumUI() {
    const moroTypeRadio = document.querySelector('input[name="moroType"]:checked');
    if (!moroTypeRadio) return;
    
    const isCustom = moroTypeRadio.value === 'custom';
    const customInput = document.getElementById('customMoroMonths');
    if (customInput) {
        customInput.disabled = !isCustom;
        if (!isCustom) customInput.value = '';
    }
}

async function saveCalculatorDataToSupabase() {
    const activeSupabase = window.supabaseClient || window.supabase;
    if (!activeSupabase) {
        alert("Supabase client not found!");
        return;
    }

    const { data: { user }, error: userError } = await activeSupabase.auth.getUser();
    
    if (userError || !user) {
        alert("Please sign in first so we know where to save your data! 🏠✍️");
        return;
    }

    const profilePayload = {
        user_id: user.id,
        profile_name: 'My Property Loan',
        super_area: parseFloat(document.getElementById('superArea')?.value) || null,
        price_per_sqft: parseFloat(document.getElementById('pricePerSqft')?.value) || null,
        ltv_ratio: parseFloat(document.getElementById('ltvRatio')?.value) || 80,
        loan_amount: parseFloat(document.getElementById('loanAmount')?.value) || null,
        interest_rate: parseFloat(document.getElementById('interestRate')?.value) || null,
        tenure_years: parseInt(document.getElementById('tenureYears')?.value) || null,
        loan_start_date: document.getElementById('loanStartDate')?.value || null,
        emi_start_date: document.getElementById('emiStartDate')?.value || null,
        moro_type: document.querySelector('input[name="moroType"]:checked')?.value || '18',
        custom_moro_months: parseInt(document.getElementById('customMoroMonths')?.value) || null,
        updated_at: new Date().toISOString()
    };

    let { data: existingProfiles } = await activeSupabase
        .from('clhl_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    let profileId;

    if (existingProfiles && existingProfiles.length > 0) {
        profileId = existingProfiles[0].id;
        
        const { error: updateError } = await activeSupabase
            .from('clhl_profiles')
            .update(profilePayload)
            .eq('id', profileId);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            alert('Failed to save profile data.');
            return;
        }
    } else {
        const { data: newProfile, error: insertError } = await activeSupabase
            .from('clhl_profiles')
            .insert([profilePayload])
            .select('id')
            .single();

        if (insertError) {
            console.error('Error inserting profile:', insertError);
            alert('Failed to create profile data.');
            return;
        }
        profileId = newProfile.id;
    }

    // 1. Save Milestones
    await activeSupabase
        .from('clhl_milestones')
        .delete()
        .eq('profile_id', profileId);

    const milestoneRows = document.querySelectorAll('#milestoneBody tr');
    const milestonesPayload = Array.from(milestoneRows).map((row, index) => ({
        profile_id: profileId,
        milestone_name: row.querySelector('.milestone-name')?.value || '',
        milestone_date: row.querySelector('.milestone-date')?.value || null,
        milestone_pct: parseFloat(row.querySelector('.milestone-pct')?.value) || 0,
        loan_amount: parseFloat(row.querySelector('.milestone-loan-amount')?.value) || 0,
        is_part_of_loan: row.querySelector('.part-of-loan-check')?.checked ?? true,
        sort_order: index
    }));

    if (milestonesPayload.length > 0) {
        const { error: insertMilestonesError } = await activeSupabase
            .from('clhl_milestones')
            .insert(milestonesPayload);

        if (insertMilestonesError) {
            console.error('Error inserting milestones:', insertMilestonesError);
            alert('Failed to save milestones data.');
            return;
        }
    }

    // 2. Save Extra Charges
    await activeSupabase
        .from('clhl_extra_charges')
        .delete()
        .eq('profile_id', profileId);

    const chargeRows = document.querySelectorAll('#extraChargesContainer .charge-row');
    const chargesPayload = Array.from(chargeRows).map((row, index) => ({
        profile_id: profileId,
        charge_name: row.querySelector('.charge-name')?.value || '',
        charge_amount: parseFloat(row.querySelector('.charge-amount')?.value) || 0,
        add_to_cost: row.querySelector('.add-to-cost-check')?.checked ?? true,
        sort_order: index,
        updated_at: new Date().toISOString()
    })).filter(c => c.charge_name || c.charge_amount > 0);

    if (chargesPayload.length > 0) {
        const { error: chargeError } = await activeSupabase
            .from('clhl_extra_charges')
            .insert(chargesPayload);

        if (chargeError) {
            console.error('Error saving extra charges:', chargeError);
        }
    }

    // 3. Save Custom Planned EMIs (Read directly from the visible table inputs)
    await activeSupabase
        .from('clhl_planned_emis')
        .delete()
        .eq('profile_id', profileId);

    const plannedEmisPayload = [];
    const rows = document.querySelectorAll('#loanPlanBody tr');

    rows.forEach(row => {
        const mIdx = parseInt(row.dataset.month, 10);
        const inputEl = row.querySelector('.planned-emi-input');
        
        if (!isNaN(mIdx) && inputEl) {
            const val = inputEl.value.trim();
            // Save whatever the user entered, or 0 if empty/cleared
            plannedEmisPayload.push({
                profile_id: profileId,
                month_index: mIdx,
                planned_emi: val === "" ? 0 : parseFloat(val) || 0,
                updated_at: new Date().toISOString()
            });
        }
    });

    if (plannedEmisPayload.length > 0) {
        const { error: emiError } = await activeSupabase
            .from('clhl_planned_emis')
            .insert(plannedEmisPayload);

        if (emiError) {
            console.error('Error saving planned EMIs:', emiError);
        }
    }

    alert('Calculator progress successfully saved! 🚀');
}

async function loadCalculatorDataFromSupabase() {
    console.log("TRACE [1]: Starting loadCalculatorDataFromSupabase...");
    
    const activeSupabase = window.supabaseClient || window.supabase;
    if (!activeSupabase) {
        console.error("TRACE ERROR: Supabase client not found.");
        hideLoader();
        return;
    }

    console.log("TRACE [2]: Fetching user auth...");
    const { data: { user }, error: userError } = await activeSupabase.auth.getUser();
    
    if (userError) {
        console.error("TRACE ERROR: User auth error:", userError);
        hideLoader();
        return;
    }
    
    if (!user) {
        console.log("TRACE [3]: No user logged in. Aborting load.");
        hideLoader();
        return;
    }

    console.log("TRACE [4]: User found:", user.id);

    console.log("TRACE [5]: Fetching profiles from DB...");
    const { data: profiles, error: profileError } = await activeSupabase
        .from('clhl_profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

    if (profileError) {
        console.error("TRACE ERROR fetching profiles:", profileError);
        hideLoader();
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log("TRACE [6]: No profiles found for user.");
        hideLoader();
        return;
    }

    console.log("TRACE [7]: Profile loaded successfully:", profiles[0]);
    const profile = profiles[0];

    const setValue = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== null && val !== undefined) el.value = val;
    };

    setValue('superArea', profile.super_area);
    setValue('pricePerSqft', profile.price_per_sqft);
    setValue('ltvRatio', profile.ltv_ratio);
    setValue('loanAmount', profile.loan_amount);
    setValue('interestRate', profile.interest_rate);
    setValue('tenureYears', profile.tenure_years);
    setValue('loanStartDate', profile.loan_start_date);
    setValue('emiStartDate', profile.emi_start_date);
    setValue('customMoroMonths', profile.custom_moro_months);

    if (profile.moro_type) {
        const radio = document.querySelector(`input[name="moroType"][value="${profile.moro_type}"]`);
        if (radio) {
            radio.checked = true;
            handleMoratoriumUI();
        }
    }

    updateBasicCost();
    const loanInput = document.getElementById('loanAmount');
    if (loanInput && profile.loan_amount !== null && profile.loan_amount !== undefined) {
        loanInput.dataset.manual = 'true'; // Lock it so subsequent updates don't overwrite it immediately
        loanInput.value = profile.loan_amount;
    }

    // 1. Load Extra Charges
    console.log("TRACE [7.5]: Fetching extra charges...");
    const { data: charges, error: chargeError } = await activeSupabase
        .from('clhl_extra_charges')
        .select('*')
        .eq('profile_id', profile.id)
        .order('sort_order', { ascending: true });

    if (!chargeError && charges && charges.length > 0) {
        const container = document.getElementById('extraChargesContainer');
        if (container) {
            container.innerHTML = ''; 
            charges.forEach(c => {
                const row = createRow(c.charge_name, c.charge_amount, false);
                const check = row.querySelector('.add-to-cost-check');
                if (check) check.checked = c.add_to_cost;
                container.appendChild(row);
            });
        }
    }

    // 2. Load Milestones
    console.log("TRACE [8]: Fetching milestones...");
    const { data: milestones, error: milestoneError } = await activeSupabase
        .from('clhl_milestones')
        .select('*')
        .eq('profile_id', profile.id)
        .order('sort_order', { ascending: true });

    if (milestoneError) {
        console.error("TRACE ERROR fetching milestones:", milestoneError);
    } else if (milestones && milestones.length > 0) {
        const milestoneBody = document.getElementById('milestoneBody');
        if (milestoneBody) {
            milestoneBody.innerHTML = ''; 
            milestones.forEach(m => {
                createMilestoneRow(
                    m.milestone_name, 
                    m.milestone_date, 
                    m.milestone_pct, 
                    m.loan_amount, 
                    m.is_part_of_loan
                );
            });
        }
    }

    // 3. Load Custom Planned EMIs
    console.log("TRACE [9]: Fetching planned EMIs for profile_id:", profile.id);
    const { data: savedEmis, error: emiError } = await activeSupabase
        .from('clhl_planned_emis')
        .select('*')
        .eq('profile_id', profile.id);

    if (!emiError && savedEmis && savedEmis.length > 0) {
        const emiMap = {};
        savedEmis.forEach(item => {
            emiMap[item.month_index] = item.planned_emi;
        });
        window.loadedPlannedEmis = emiMap;
        console.log("TRACE [9d]: Built loadedPlannedEmis map successfully:", window.loadedPlannedEmis);
    } else {
        window.loadedPlannedEmis = {};
        console.log("TRACE [9e]: No saved EMIs found or error occurred.");
    }

    runCalculation();
    console.log("TRACE [9]: Load complete. Hiding loader.");
    hideLoader();
    if (typeof resetUndoStack === 'function') {
        resetUndoStack();
    } else if (typeof pushState === 'function') {
        pushState(); 
    }
}
function hideLoader() {
    const loaders = document.querySelectorAll('#loadingScreen, #appLoader, .loading-overlay');
    loaders.forEach(loader => {
        loader.style.display = 'none';
        console.log("Hidden loader element:", loader.id || loader.className);
    });
}
