document.addEventListener('DOMContentLoaded', function() {
        
    // --- PART 1: PROPERTY ASSET MANAGER ---
    const superArea = document.getElementById('superArea');
    const pricePerSqft = document.getElementById('pricePerSqft');
    const basicCost = document.getElementById('basicCost');
    const loanAmountInput = document.getElementById('loanAmount');
    const ltvRatioInput = document.getElementById('ltvRatio');

    function getTotalPropertyCostValue() {
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
        const gstAmount = (typeof FinanceEngine !== 'undefined') ? FinanceEngine.GSTHelper.calculateGST(finalBasic) : 0;
        return finalBasic + gstAmount;
    }

    function updateOverallLoanAmount() {
        if (loanAmountInput && !loanAmountInput.dataset.manual) {
            const totalCost = getTotalPropertyCostValue();
            const ltv = (parseFloat(ltvRatioInput ? ltvRatioInput.value : 80) || 0) / 100;
            loanAmountInput.value = Math.round(totalCost * ltv);
        }
    }

    function calculateTotalPropertyCost() {
        const totalWithGST = getTotalPropertyCostValue();
    
        const gstDisplay = document.getElementById('gstDisplay');
        // Fixed gstAmount scoping variable reference safety
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
        if(superArea && pricePerSqft && basicCost) {
            basicCost.value = (parseFloat(superArea.value) || 0) * (parseFloat(pricePerSqft.value) || 0);
        }
        calculateTotalPropertyCost();
        runCalculation();
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

    // --- MILESTONE ROW CREATOR ---
    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    const milestoneBody = document.getElementById('milestoneBody');

    function createMilestoneRow(name = '', date = '', pct = '', loanAmt = '', isPartOfLoan = true) {
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

        const totalWithGST = getTotalPropertyCostValue();
        const totalPropCost = document.getElementById('totalPropertyCost');
        if (totalPropCost) totalPropCost.innerText = `₹${Math.round(totalWithGST).toLocaleString()}`;
        
        // Collect and Filter Milestones based on Today's Date & Loan Check
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

        const loanStartDateVal = document.getElementById('loanStartDate').value;
        if (typeof FinanceEngine !== 'undefined' && loanStartDateVal) {
            FinanceEngine.LoanEngine.getMoratoriumEndDate(
                loanStartDateVal,
                document.querySelector('input[name="moroType"]:checked').value,
                parseFloat(document.getElementById('customMoroMonths').value) || 0,
                milestones
            );
        }

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
        if (!isCustom) customInput.value = '';
    }

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

    handleMoratoriumUI();
    updateBasicCost();

    document.addEventListener('click', (e) => {
        if (!e.target.matches('.btn-dots')) {
            document.querySelectorAll('.action-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // ==========================================================================
    // --- UNSAVED CHANGES & SECURE SAVE GUARD LOGIC ---
    // ==========================================================================
    let hasUnsavedChanges = false;

    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            hasUnsavedChanges = true;
            const dot = document.getElementById('unsavedDot');
            if (dot) dot.style.display = 'block';
        });
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

            await saveCalculatorDataToSupabase();

            hasUnsavedChanges = false;
            const dot = document.getElementById('unsavedDot');
            if (dot) dot.style.display = 'none';
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

    alert('Calculator progress successfully saved! 🚀');
}
