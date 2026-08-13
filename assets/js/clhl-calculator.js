document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: PROPERTY ASSET MANAGER ELEMENT BINDINGS ---
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

    // --- BUTTON LOGIC ---
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

    // --- PART 2: LEDGER ---
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
            const startM = parseInt(document.getElementById('fillStartMonth')?.value) || 1;
            const endM = parseInt(document.getElementById('fillEndMonth')?.value) || 360;
            const emiVal = parseFloat(document.getElementById('fillEmiAmount')?.value) || 0;

            document.querySelectorAll('#loanPlanBody tr').forEach(row => {
                const mNum = parseInt(row.dataset.month);
                if (mNum >= startM && mNum <= endM) {
                    const input = row.querySelector('.planned-emi-input');
                    if (input) {
                        input.value = emiVal;
                    }
                }
            });
            runCalculation();
        });
    }

    handleMoratoriumUI();
    updateBasicCost();
    loadCalculatorDataFromSupabase();

    document.addEventListener('click', (e) => {
        if (!e.target.matches('.btn-dots')) {
            document.querySelectorAll('.action-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // --- UNSAVED CHANGES & SECURE SAVE GUARD LOGIC ---
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
                await saveCalculatorDataToSupabase();
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

// --- GLOBAL UTILITIES & CALCULATION ENGINES ---

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
        const dateVal = row.querySelector('.milestone-date').value;
        const mData = {
            name: row.querySelector('.milestone-name').value,
            date: dateVal,
            pct: parseFloat(row.querySelector('.milestone-pct').value) || 0,
            loanAmount: parseFloat(row.querySelector('.milestone-loan-amount').value) || 0,
            isPartOfLoan: row.querySelector('.part-of-loan-check').checked
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
    
    // Determine Moratorium Duration in Months
    let moratoriumMonths = 18; // default
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

    // Check if the table already exists. If it does, we update it in-place instead of clearing it,
    // which prevents the cursor from losing focus when typing!
    const existingRows = loanPlanBody.querySelectorAll('tr');
    const isTableBuilt = existingRows.length === totalMonths;

    const existingPlannedEmis = {};
    existingRows.forEach(row => {
        const mNum = row.dataset.month;
        const input = row.querySelector('.planned-emi-input');
        if (mNum && input) {
            existingPlannedEmis[mNum] = input.value; // Keeps even empty strings intact
        }
    });

    if (!isTableBuilt) {
        loanPlanBody.innerHTML = '';
    }

    let openingBalance = 0;
    let cumulativeUnpaidInterest = 0;
    let fullEmiCache = 0;
    let fullEmiCalculated = false;

    // Helper to get disbursements falling into a given month (YYYY-MM)
    function getMilestoneDisbursementForMonth(yearMonthStr) {
        let addedAmt = 0;
        milestones.forEach(m => {
            if (m.date && m.isPartOfLoan) {
                const mYm = m.date.substring(0, 7); // YYYY-MM
                if (mYm === yearMonthStr) {
                    addedAmt += m.loanAmount;
                }
            }
        });
        return addedAmt;
    }

    // Determine starting date object
    let currentMonthDate = loanStartDateVal ? new Date(loanStartDateVal) : new Date();
    currentMonthDate.setDate(1);

    for (let monthIdx = 1; monthIdx <= totalMonths; monthIdx++) {
        const ymStr = currentMonthDate.toISOString().substring(0, 7);
        
        // Milestone disbursement for this specific month index
        const milestoneDisbursement = getMilestoneDisbursementForMonth(ymStr);

        // Explicit opening balance logic for Month 1 vs Subsequent Months
        if (monthIdx === 1) {
            openingBalance = cumulativeLoanAmt;
        } else {
            openingBalance = openingBalance + milestoneDisbursement;
        }

        // Accrued Interest Calculation
        let accruedInterest = openingBalance * monthlyRate;
        let isPreEmi = monthIdx <= moratoriumMonths;

        let benchmarkEmi = accruedInterest;
        if (!isPreEmi) {
            if (!fullEmiCalculated) {
                const remainingTenureMonths = totalMonths - monthIdx + 1;
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

        const defaultPlannedEmi = Math.round(isPreEmi ? accruedInterest : fullEmiCache);
        
        // Fix: Only fallback to default if it has NEVER been touched (undefined). If it's an empty string, keep it empty.
        let userPlannedEmiStr = existingPlannedEmis[monthIdx];
        if (userPlannedEmiStr === undefined) {
            userPlannedEmiStr = defaultPlannedEmi;
        }

        let row;
        if (isTableBuilt) {
            row = loanPlanBody.querySelector(`tr[data-month="${monthIdx}"]`);
        }

        if (!row) {
            row = document.createElement('tr');
            row.dataset.month = monthIdx;
            row.innerHTML = `
                <td class="col-left">M${monthIdx} (${ymStr})</td>
                <td class="col-right"></td>
                <td class="col-right"></td>
                <td class="col-right">
                    <input type="number" class="planned-emi-input" placeholder="₹">
                </td>
                <td class="col-right principal-paid-cell">₹0</td>
                <td class="col-right part-payment-cell">₹0</td>
                <td class="col-right closing-balance-cell">₹0</td>
            `;
            loanPlanBody.appendChild(row);
            
            const inputEl = row.querySelector('.planned-emi-input');
            inputEl.value = userPlannedEmiStr;
            inputEl.addEventListener('input', () => {
                runCalculation(); 
            });
        }

        // Update row cell text values dynamically without breaking input focus
        row.children[0].innerText = `M${monthIdx} (${ymStr})`;
        row.children[1].innerText = `₹${Math.round(openingBalance).toLocaleString()}`;
        row.children[2].innerHTML = `₹${Math.round(isPreEmi ? accruedInterest : fullEmiCache).toLocaleString()} <span style="font-size:0.75rem; color:var(--text-secondary);">(${isPreEmi ? 'Pre-EMI' : 'Full EMI'})</span>`;

        const inputEl = row.querySelector('.planned-emi-input');
        // Only update input value programmatically if this specific input is not currently focused by the user
        if (document.activeElement !== inputEl && inputEl.value !== String(userPlannedEmiStr)) {
            inputEl.value = userPlannedEmiStr;
        }

        const plannedEmiVal = parseFloat(inputEl.value) || 0;
        let principalPaid = 0;

        if (isPreEmi) {
            if (plannedEmiVal >= accruedInterest) {
                const extra = plannedEmiVal - accruedInterest;
                principalPaid = extra; 
            } else {
                const shortfall = accruedInterest - plannedEmiVal;
                cumulativeUnpaidInterest += shortfall;
            }
        } else {
            const interestComponent = accruedInterest;
            const principalComponent = Math.max(0, plannedEmiVal - interestComponent);
            if (plannedEmiVal < interestComponent) {
                const shortfall = interestComponent - plannedEmiVal;
                cumulativeUnpaidInterest += shortfall;
                principalPaid = 0;
            } else {
                principalPaid = principalComponent;
            }
        }

        const isShortfall = plannedEmiVal < Math.round(accruedInterest) && inputEl.value !== '';
        inputEl.classList.toggle('shortfall-highlight', isShortfall);

        let closingBalance = openingBalance - principalPaid;
        
        row.querySelector('.principal-paid-cell').innerText = `₹${Math.round(principalPaid).toLocaleString()}`;
        row.querySelector('.part-payment-cell').innerText = `₹${Math.round(principalPaid).toLocaleString()}`;
        row.querySelector('.closing-balance-cell').innerText = `₹${Math.round(Math.max(0, closingBalance)).toLocaleString()}`;

        // Advance month date by 1 month for next loop iteration
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
        openingBalance = Math.max(0, closingBalance);
    }

    // Update summary card metrics
    const closingPrincipalEl = document.getElementById('closingPrincipal');
    const unpaidInterestEl = document.getElementById('unpaidInterest');
    
    const finalRow = loanPlanBody.lastElementChild;
    const finalClosingBal = finalRow ? parseFloat(finalRow.querySelector('.closing-balance-cell').innerText.replace(/[₹,]/g, '')) || 0 : 0;

    if (closingPrincipalEl) closingPrincipalEl.innerText = `₹${Math.round(finalClosingBal).toLocaleString()}`;
    if (unpaidInterestEl) unpaidInterestEl.innerText = `₹${Math.round(cumulativeUnpaidInterest).toLocaleString()}`;
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
        sort_order: index,
        updated_at: new Date().toISOString()
    })).filter(m => m.milestone_name || m.milestone_date);

    if (milestonesPayload.length > 0) {
        const { error: milestoneError } = await activeSupabase
            .from('clhl_milestones')
            .insert(milestonesPayload);

        if (milestoneError) {
            console.error('Error saving milestones:', milestoneError);
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

    runCalculation();
    console.log("TRACE [9]: Load complete. Hiding loader.");
    hideLoader();
}

function hideLoader() {
    const loaders = document.querySelectorAll('#loadingScreen, #appLoader, .loading-overlay');
    loaders.forEach(loader => {
        loader.style.display = 'none';
        console.log("Hidden loader element:", loader.id || loader.className);
    });
}
