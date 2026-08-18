document.addEventListener('DOMContentLoaded', () => {

    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');
    const loanAmountInput = document.getElementById('loanAmount');
    const ltvRatioInput = document.getElementById('ltvRatio');

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

    const addBtn = document.getElementById('addRowBtn');
    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    const applyRangeBtn = document.getElementById('applyRangeBtn');

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
    
    if(applyRangeBtn) {
        applyRangeBtn.addEventListener('click', () => {
            saveStateToUndoStack();

            const start = parseInt(document.getElementById('fillStartMonth')?.value) || 1;
            const end = parseInt(document.getElementById('fillEndMonth')?.value) || 360;
            const val = parseFloat(document.getElementById('fillEmiAmount')?.value) || 0;

            const rows = document.querySelectorAll('#loanPlanBody tr');
            
            if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};

            rows.forEach((row, idx) => {
                const monthIdx = idx + 1;
                if (monthIdx >= start && monthIdx <= end) {
                    const inputEl = row.querySelector('.planned-emi-input');
                    if (inputEl) {
                        inputEl.value = val;
                        window.loadedPlannedEmis[monthIdx] = val;
                    }
                }
            });
            runCalculation();
        });
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

    // 2. Hook "Copy Accrued" Button
    const copyAccruedBtn = document.getElementById('copyAccruedBtn');
    if (copyAccruedBtn) {
        copyAccruedBtn.addEventListener('click', () => {
            saveStateToUndoStack();

            window.loadedPlannedEmis = {};
            window.forceDefaultEmis = true;
            runCalculation();

            const rows = document.querySelectorAll('#loanPlanBody tr');
            rows.forEach((row, idx) => {
                const monthIdx = idx + 1;
                const inputEl = row.querySelector('.planned-emi-input');
                if (inputEl) {
                    window.loadedPlannedEmis[monthIdx] = parseFloat(inputEl.value) || 0;
                }
            });
            window.forceDefaultEmis = false;
        });
    }

    // 3. Track individual manual inputs in the table for Undo
    const loanPlanBody = document.getElementById('loanPlanBody');
    if (loanPlanBody) {
        let typingTimeout;
        loanPlanBody.addEventListener('input', (e) => {
            if (e.target.matches('.planned-emi-input')) {
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    saveStateToUndoStack();
                }, 500);
            }
        });
    }

    /// 4. Hook "Copy Accrued (Remaining)" Button
    const copyAccruedRemainingBtn = document.getElementById('copyAccruedRemainingBtn');
    if (copyAccruedRemainingBtn) {
        copyAccruedRemainingBtn.addEventListener('click', () => {
            saveStateToUndoStack();

            const rows = document.querySelectorAll('#loanPlanBody tr');
            if (!window.loadedPlannedEmis) window.loadedPlannedEmis = {};

            let lastUserMonth = 0;
            rows.forEach((row, idx) => {
                const monthIdx = idx + 1;
                const inputEl = row.querySelector('.planned-emi-input');
                if (inputEl) {
                    const val = parseFloat(inputEl.value);
                    if (!isNaN(val) && val > 0) {
                        lastUserMonth = monthIdx;
                        window.loadedPlannedEmis[monthIdx] = val; 
                    }
                }
            });

            Object.keys(window.loadedPlannedEmis).forEach(m => {
                const mNum = parseInt(m, 10);
                if (mNum > lastUserMonth) {
                    delete window.loadedPlannedEmis[mNum];
                }
            });
            window.forceDefaultEmis = false;
            runCalculation();
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
    let totalPrincipalPaid = 0;
    let hasAnomalies = false;
    let consoleLogGroup = [];

    consoleLogGroup.push(`%c--- 📊 Loan Calculation Audit Report ---`, 'color: #007bff; font-weight: bold;');

    scheduleData.forEach((row, index) => {
        if (isNaN(row.closingBalance) || isNaN(row.interest) || isNaN(row.principal)) {
            hasAnomalies = true;
            consoleLogGroup.push(`❌ Row ${index + 1}: Contains NaN or invalid numbers.`);
        }
        // FIX: Only add row.principal, since it already encompasses the total principal reduction for that row
        totalPrincipalPaid += row.principal;
    });

    const finalClosingBalance = scheduleData[scheduleData.length - 1].closingBalance;

    if (Math.abs(finalClosingBalance) <= 5) {
        consoleLogGroup.push(`✅ Closing Balance Check: Passed (Loan fully amortized to ₹${finalClosingBalance.toFixed(2)})`);
    } else {
        hasAnomalies = true;
        consoleLogGroup.push(`⚠️ Closing Balance Check: Warning! Final balance is ₹${finalClosingBalance.toFixed(2)} (Expected ₹0)`);
    }

    const principalDifference = Math.abs(totalPrincipalPaid - initialLoanAmount);
    if (principalDifference <= 10) {
        consoleLogGroup.push(`✅ Total Principal Match: Passed (Sum matches initial loan amount of ₹${initialLoanAmount})`);
    } else {
        hasAnomalies = true;
        consoleLogGroup.push(`❌ Total Principal Match: Failed! Paid principal sum (₹${Math.round(totalPrincipalPaid).toLocaleString()}) differs from loan amount (₹${initialLoanAmount}) by ₹${principalDifference.toFixed(2)}`);
    }

    consoleLogGroup.forEach(log => console.log(log));

    if (hasAnomalies) {
        console.warn('⚠️ Audit completed with warnings or errors. Check details above.');
    } else {
        console.log('%c🎉 All math invariants passed successfully!', 'color: #28a745; font-weight: bold;');
    }
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
    const basicCost = document.getElementById('basicCost');
    if (!basicCost) return;

    const totalWithGST = getTotalPropertyCostValue();
    const totalPropCost = document.getElementById('totalPropertyCost');
    if (totalPropCost) totalPropCost.innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
    
    const milestoneRows = document.querySelectorAll('#milestoneBody tr');
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

    const loanStartDateVal = document.getElementById('loanStartDate')?.value;
    const moroTypeChecked = document.querySelector('input[name="moroType"]:checked');
    const customMoroMonthsVal = document.getElementById('customMoroMonths')?.value;
    
    let moratoriumMonths = 18;
    if (moroTypeChecked) {
        if (moroTypeChecked.value === 'custom') {
            moratoriumMonths = parseInt(customMoroMonthsVal) || 0;
        } else if (moroTypeChecked.value === 'milestone') {
            if (milestones.length > 0 && loanStartDateVal) {
                const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
                const lastMDate = new Date(sortedMilestones[sortedMilestones.length - 1].date);
                const startD = new Date(loanStartDateVal);
                const diffTime = lastMDate - startD;
                const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                moratoriumMonths = Math.max(0, diffMonths);
            } else {
                moratoriumMonths = 0;
            }
        } else {
            moratoriumMonths = parseInt(moroTypeChecked.value) || 18;
        }
    }

    const interestEl = document.getElementById('interestRate');
    const annualRate = interestEl ? parseFloat(interestEl.value) || 0 : 0;
    const monthlyRate = annualRate / 12 / 100;
    const tenureYears = parseInt(document.getElementById('tenureYears')?.value) || 20;
    const totalMonths = tenureYears * 12;

    const loanPlanBody = document.getElementById('loanPlanBody');
    if (!loanPlanBody) return;
    const existingRows = loanPlanBody.querySelectorAll('tr');
    const hasInterestCell = existingRows.length > 0 && existingRows[0].querySelector('.interest-cell');
    const isTableBuilt = existingRows.length === totalMonths;
    if (!isTableBuilt) {
        loanPlanBody.innerHTML = '';
    }

    let openingBalance = 0;
    let cumulativeUnpaidInterest = 0;
    let fullEmiCache = 0;
    let fullEmiCalculated = false;
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
            openingBalance = openingBalance + milestoneDisbursement;
        }
        let accruedInterest = openingBalance * monthlyRate;
        let isPreEmi = monthIdx <= moratoriumMonths;

        let benchmarkEmi = accruedInterest;
        if (!isPreEmi) {
            if (!fullEmiCalculated) {
                const remainingTenureMonths = totalMonths - moratoriumMonths; 
                if (monthlyRate > 0) {
                    fullEmiCache = (openingBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingTenureMonths)) / (Math.pow(1 + monthlyRate, remainingTenureMonths) - 1);
                } else {
                    fullEmiCache = openingBalance / remainingTenureMonths;
                }
                fullEmiCalculated = true;
            }
            benchmarkEmi = fullEmiCache;
            accruedInterest = openingBalance * monthlyRate; 
        }

        const defaultPlannedEmi = isPreEmi ? accruedInterest : fullEmiCache;
        let userPlannedEmiVal;
        if (window.forceDefaultEmis) {
            userPlannedEmiVal = defaultPlannedEmi; 
        } else if (window.loadedPlannedEmis && window.loadedPlannedEmis[monthIdx] !== undefined) {
            userPlannedEmiVal = window.loadedPlannedEmis[monthIdx];
        } else {
            userPlannedEmiVal = defaultPlannedEmi;
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

        row.children[0].innerText = displayLabel;
        row.children[1].innerText = `₹${Math.round(openingBalance).toLocaleString()}`;
        row.children[2].innerHTML = `₹${Math.round(isPreEmi ? accruedInterest : fullEmiCache).toLocaleString()} <span style="font-size:0.75rem; color:var(--text-secondary);">(${isPreEmi ? 'Pre-EMI' : 'Full EMI'})</span>`;
        
        const inputEl = row.querySelector('.planned-emi-input');
        if (document.activeElement !== inputEl) {
            inputEl.value = Math.round(userPlannedEmiVal * 100) / 100;
        }

        let principalPaid = 0;
        let partPaymentColVal = 0;
        let capitalizedShortfall = 0;
        const plannedEmiVal = parseFloat(inputEl.value) || userPlannedEmiVal;

        let effectivePlannedEmi = plannedEmiVal;
        if (monthIdx === totalMonths) {
            effectivePlannedEmi = openingBalance + accruedInterest;
        }

        if (isPreEmi) {
            if (effectivePlannedEmi >= accruedInterest) {
                const extra = effectivePlannedEmi - accruedInterest;
                principalPaid = extra; 
                partPaymentColVal = extra; 
            } else {
                const shortfall = accruedInterest - effectivePlannedEmi;
                capitalizedShortfall = shortfall; 
                cumulativeUnpaidInterest += shortfall;
                principalPaid = 0;
                partPaymentColVal = 0;
            }
        } else {
            const interestComponent = accruedInterest;
            const standardEmiForCalc = window.standardEmiAmount || effectivePlannedEmi; 

            if (effectivePlannedEmi < interestComponent) {
                const shortfall = interestComponent - effectivePlannedEmi;
                capitalizedShortfall = shortfall; 
                cumulativeUnpaidInterest += shortfall;
                principalPaid = 0;
                partPaymentColVal = 0;
            } else {
                principalPaid = effectivePlannedEmi - interestComponent;
                partPaymentColVal = Math.max(0, effectivePlannedEmi - standardEmiForCalc);
            }
        }

        const isShortfall = effectivePlannedEmi < accruedInterest && inputEl.value !== '';
        inputEl.classList.toggle('shortfall-highlight', isShortfall);
        
        let closingBalance = openingBalance - principalPaid + capitalizedShortfall;
        row.querySelector('.interest-cell').innerText = `₹${Math.round(accruedInterest).toLocaleString()}`;
        row.querySelector('.principal-paid-cell').innerText = `₹${Math.round(principalPaid).toLocaleString()}`;
        row.querySelector('.part-payment-cell').innerText = `₹${Math.round(partPaymentColVal).toLocaleString()}`;
        row.querySelector('.closing-balance-cell').innerText = `₹${Math.round(Math.max(0, closingBalance)).toLocaleString()}`;
        
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
        openingBalance = Math.max(0, closingBalance);
    }

    const closingPrincipalEl = document.getElementById('closingPrincipal');
    const unpaidInterestEl = document.getElementById('unpaidInterest');
    
    const finalRow = loanPlanBody.lastElementChild;
    const finalClosingBal = finalRow ? parseFloat(finalRow.querySelector('.closing-balance-cell').innerText.replace(/[₹,]/g, '')) || 0 : 0;

    if (closingPrincipalEl) closingPrincipalEl.innerText = `₹${Math.round(finalClosingBal).toLocaleString()}`;
    if (unpaidInterestEl) unpaidInterestEl.innerText = `₹${Math.round(cumulativeUnpaidInterest).toLocaleString()}`;

// --- 📊 AUTOMATED AUDIT TRIGGER ---
    const rowsArray = Array.from(loanPlanBody.querySelectorAll('tr')).map(r => ({
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

    // 3. Save Custom Planned EMIs
    await activeSupabase
        .from('clhl_planned_emis')
        .delete()
        .eq('profile_id', profileId);

    const loanPlanRows = document.querySelectorAll('#loanPlanBody tr');
    const plannedEmisPayload = [];

    loanPlanRows.forEach(row => {
        const mIdx = parseInt(row.dataset.month);
        const inputEl = row.querySelector('.planned-emi-input');
        if (!isNaN(mIdx) && inputEl && inputEl.value !== '') {
            plannedEmisPayload.push({
                profile_id: profileId,
                month_index: mIdx,
                planned_emi: parseFloat(inputEl.value) || 0,
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
