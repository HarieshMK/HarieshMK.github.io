/**
 * Unexciting Money Club - Tax Calculator UI Modifier Layer
 * Mandated for managing pure interface view layout updates, interactions, and style bindings.
 */

const TaxUI = {
    // 1. Smooth Scroll Engine
    scrollToResults() {
        const target = document.getElementById('tax-breakdown-section');
        if (target) { 
            target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        }
    },

    // 2. Custom Select Interaction Layer (Updated to support both custom wrappers and native dynamic selects)
    initCustomDropdowns() {
        // Handle custom styled dropdown wrappers (for static fields)
        document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const targetSelectId = wrapper.getAttribute('data-target');
            const nativeSelect = document.querySelector(targetSelectId);

            if (!trigger) return;

            trigger.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-select-wrapper').forEach(other => {
                    if (other !== wrapper) other.classList.remove('open');
                });
                wrapper.classList.toggle('open');
            };

            wrapper.querySelectorAll('.custom-option').forEach(option => {
                option.onclick = (e) => {
                    e.stopPropagation();
                    const selectedValue = option.getAttribute('data-value');
                    
                    const displaySpan = trigger.querySelector('span');
                    if (displaySpan) displaySpan.textContent = option.textContent;
                    
                    wrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');

                    if (nativeSelect) {
                        nativeSelect.value = selectedValue;
                        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    wrapper.classList.remove('open');
                };
            });
        });

        // Safeguard: Force dark styles explicitly via JavaScript on any raw select element found in dynamic containers
        document.querySelectorAll('#perks-rows-container select, #80c-rows-container select').forEach(dynamicSelect => {
            dynamicSelect.style.backgroundColor = '#0f172a';
            dynamicSelect.style.color = '#f8fafc';
            dynamicSelect.style.border = '1.5px solid #334155';
            
            // Apply styles directly to the child options inside the dropdown list
            dynamicSelect.querySelectorAll('option').forEach(opt => {
                opt.style.backgroundColor = '#1e293b';
                opt.style.color = '#f8fafc';
            });
        });

        // Safely close custom dropdowns without blocking standard DOM button actions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            }
        });
    },

    // 3. Section Collapsible Accordion Core
    setupToggle(headerId, contentId, iconId) {
        const header = document.getElementById(headerId);
        const content = document.getElementById(contentId);
        const icon = document.getElementById(iconId);
        if (header && content && icon) {
            if (content.classList.contains('content-hidden')) { content.style.display = 'none'; }
            header.onclick = (e) => {
                e.stopPropagation();
                const isHidden = (content.style.display === 'none');
                content.style.display = isHidden ? 'block' : 'none';
                icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                content.classList.remove('content-hidden');
            };
        }
    },

    // 4. Home Loan Interactive Form Wizards
    toggleLoanWizard() {
        const hasLoan = document.getElementById('has-home-loan')?.checked;
        const wizard = document.getElementById('home-loan-wizard');
        const deductions = document.getElementById('conditional-deductions');
        if (wizard) wizard.style.display = hasLoan ? 'block' : 'none';
        if (deductions) deductions.style.display = hasLoan ? 'block' : 'none';
        if (window.TaxController) window.TaxController.calculateAll();
    },

    handleLoanStatusChange() {
        const status = document.querySelector('input[name="possession"]:checked')?.value;
        const msg = document.getElementById('under-construction-msg');
        const fields = document.getElementById('completed-loan-fields');
        if (status === 'under-construction') { 
            if (msg) msg.style.display = 'block'; 
            if (fields) fields.style.display = 'none'; 
        } else { 
            if (msg) msg.style.display = 'none'; 
            if (fields) fields.style.display = 'block'; 
        }
        if (window.TaxController) window.TaxController.calculateAll();
    },

    handleDateBranching() {
        const dateVal = document.getElementById('loan-sanction-date')?.value;
        const branchEE = document.getElementById('branch-80ee-fields');
        const branchEEA = document.getElementById('branch-80eea-fields');
        if (!branchEE || !branchEEA) return;
        
        branchEE.style.display = 'none';
        branchEEA.style.display = 'none';

        if (!dateVal || !window.ELIGIBILITY_RULES) return; 
        
        const sanctionDate = new Date(dateVal);
        const rules = window.ELIGIBILITY_RULES;
        
        if (rules.sec80EE && sanctionDate >= rules.sec80EE.start && sanctionDate <= rules.sec80EE.end) { 
            branchEE.style.display = 'block'; 
        } else if (rules.sec80EEA && sanctionDate >= rules.sec80EEA.start && sanctionDate <= rules.sec80EEA.end) { 
            branchEEA.style.display = 'block'; 
        }
    },

    // 5. Tax Regime Dynamic Highlights
    updateRegimeHighlights() {
        const oldCard = document.getElementById('old-regime-card');
        const newCard = document.getElementById('new-regime-card');
        if (!oldCard || !newCard) return;

        const getVal = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            return parseFloat(el.innerText.replace(/[^0-9.-]+/g, "")) || 0;
        };

        const oldTax = getVal('old-regime-tax');
        const newTax = getVal('new-regime-tax');

        oldCard.className = 'regime-row-card';
        newCard.className = 'regime-row-card';

        if (oldTax === 0 && newTax === 0) return;

        if (oldTax < newTax) {
            oldCard.classList.add('regime-winner');
            newCard.classList.add('regime-loser');
        } else if (newTax < oldTax) {
            newCard.classList.add('regime-winner');
            oldCard.classList.add('regime-loser');
        }
    },

    // 6. Compliance Audits (HRA and Active Housing Loan Warnings)
    checkHraLoanWarning() {
        const rentInput = document.getElementById('rent-paid');
        const homeLoanCheck = document.getElementById('has-home-loan');
        const warningBox = document.getElementById('hra-loan-legal-warning');
        if (!warningBox) return;

        const rentPaid = rentInput ? (parseFloat(rentInput.value.replace(/,/g, "")) || 0) : 0;
        const loanChecked = homeLoanCheck ? homeLoanCheck.checked : false;

        if (rentPaid > 0 && loanChecked) {
            warningBox.style.display = 'block';
        } else {
            warningBox.style.display = 'none';
        }
    },

    // 7. Dynamic Form Warnings Feedback
    handlePerkUIFeedback(inputElement, perkName) {
        if (!window.TaxController) return;
        const value = window.TaxController.cleanNum(inputElement.value);
        const fy = document.getElementById('fy-selector')?.value || "2026-27";
        const config = window.TAX_CONFIG[fy] || window.TAX_CONFIG["2026-27"];
        if (perkName === "Meal Coupons" && config?.perkRules?.["Meal Coupons"]) {
            let warningDiv = inputElement.parentNode.querySelector('.perk-limit-warning');
            if (!warningDiv) { warningDiv = document.createElement('div'); warningDiv.className = 'perk-limit-warning'; inputElement.parentNode.appendChild(warningDiv); }
            const limit = config.perkRules["Meal Coupons"].govtLimit;
            if (value > limit) { warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Standard exempt limit is ₹${limit.toLocaleString('en-IN')}.`; warningDiv.style.display = 'block'; } else { warningDiv.style.display = 'none'; }
        }
        if (perkName === "Fuel Allowance" || perkName === "Mobile Reimbursement") { inputElement.placeholder = "Enter amount as per bills"; }
    },

    // 8. Input Field Validations
    validateInputs() {
        let isValid = true;
        document.querySelectorAll('.currency-mapped').forEach(input => {
            const cleanFn = window.TaxController?.cleanNum || ((v) => parseFloat(v.replace(/,/g, '')) || 0);
            const val = cleanFn(input.value);
            if (val < 0) { 
                input.classList.add('input-error'); 
                isValid = false; 
            } else { 
                input.classList.remove('input-error'); 
            }
        });
        return isValid;
    }
};

// Global mounting onto layout window context
window.TaxUI = TaxUI;
window.scrollToResults = TaxUI.scrollToResults;
window.validateInputs = TaxUI.validateInputs;
window.toggleLoanWizard = TaxUI.toggleLoanWizard;
window.initCustomDropdowns = TaxUI.initCustomDropdowns;

// Execute Initializations on DOM Load Completion Lifecycle
document.addEventListener("DOMContentLoaded", function() {
    // Structural Accordions Setup
    TaxUI.setupToggle('80c-header', '80c-content', '80c-icon');
    TaxUI.setupToggle('80d-header', '80d-content', '80d-icon');
    TaxUI.setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
    TaxUI.setupToggle('nps-header', 'nps-content', 'nps-icon');

    // Initialize interactive dropdown panels
    TaxUI.initCustomDropdowns();

    // Link View Breakdown Action Trigger to Smooth Scroll Engine
    const breakdownBtn = document.getElementById('view-breakdown-btn');
    if (breakdownBtn) {
        breakdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            TaxUI.scrollToResults();
        });
    }

    // Attach explicit layout listener for the home loan primary checkbox element
    const homeLoanCheck = document.getElementById('has-home-loan');
    if (homeLoanCheck) {
        homeLoanCheck.addEventListener('change', TaxUI.toggleLoanWizard);
    }

    // Dynamic Mutation Monitors watching calculated tax element updates
    const targetOld = document.getElementById('old-regime-tax');
    const targetNew = document.getElementById('new-regime-tax');
    if (targetOld && targetNew) {
        const layoutObserver = new MutationObserver(() => { TaxUI.updateRegimeHighlights(); });
        layoutObserver.observe(targetOld, { childList: true, characterData: true, subtree: true });
        layoutObserver.observe(targetNew, { childList: true, characterData: true, subtree: true });
    }

    document.addEventListener('input', TaxUI.checkHraLoanWarning);
    document.addEventListener('change', function() {
        TaxUI.checkHraLoanWarning();
        setTimeout(TaxUI.updateRegimeHighlights, 50); 
    });

    // Handle home loan parameter date adjustments dynamically
    const sanctionInput = document.getElementById('loan-sanction-date');
    if (sanctionInput) {
        sanctionInput.addEventListener('change', () => {
            TaxUI.handleDateBranching();
            if (window.TaxController) window.TaxController.calculateAll();
        });
    }

    const possessionRadios = document.querySelectorAll('input[name="possession"]');
    possessionRadios.forEach(radio => {
        radio.addEventListener('change', TaxUI.handleLoanStatusChange);
    });

    setTimeout(() => {
        TaxUI.updateRegimeHighlights();
        TaxUI.checkHraLoanWarning();
        TaxUI.handleDateBranching();
    }, 400);
});

// Setup Runtime Layout Validation Errors CSS Injection
(function injectUIStyles() {
    if (document.getElementById('tax-calculator-error-styles')) return;
    const errorStyle = document.createElement('style');
    errorStyle.id = 'tax-calculator-error-styles';
    errorStyle.innerHTML = `
        .input-error { border: 1px solid #ef4444 !important; background-color: #fef2f2 !important; } 
        .perk-limit-warning { color: #f59e0b; font-size: 0.75rem; margin-top: 4px; display: none; }
        
        /* Fix structural grid track alignment for manual/statutory 80C Rows (3 columns) */
        #80c-rows-container > div {
            display: grid !important;
            grid-template-columns: 1.6fr 1fr 40px !important;
            align-items: center !important;
            gap: 12px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
        }

        /* Fix structural grid track alignment for Perk Rows (4 columns: type, amt, eligibility, delete) */
        .perk-row,
        #perks-rows-container > div {
            display: grid !important;
            grid-template-columns: 1.6fr 1fr 0.8fr 40px !important;
            align-items: center !important;
            gap: 12px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
        }

        /* Prevent button alignments from losing grid assignments */
        #80c-rows-container button, #80c-rows-container i.fa-lock {
            grid-column: 3 / 4 !important;
            justify-self: center;
        }
        #perks-rows-container button {
            grid-column: 4 / 5 !important;
            justify-self: center;
        }

        /* 2. Absolute fix for native dropdown select element appearance */
        .unique-tax-calc select, 
        #perks-rows-container select, 
        #80c-rows-container select {
            background-color: #0f172a !important;   /* Hardcoded rich slate dark base */
            color: #f8fafc !important;              /* Force crisp text visibility */
            padding: 10px 15px !important;
            border-radius: 12px !important;
            height: 48px !important;
            border: 1.5px solid #334155 !important; 
            font-family: inherit !important;
            font-weight: 600 !important;
            font-size: 0.9rem !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2394a3b8' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/></svg>") !important;
            background-repeat: no-repeat !important;
            background-position: calc(100% - 15px) center !important;
            padding-right: 40px !important;
        }

        /* Force cross-browser dropdown options context to match layout theme */
        .unique-tax-calc select option, 
        #perks-rows-container select option, 
        #80c-rows-container select option {
            background-color: #1e293b !important;   
            color: #f8fafc !important;              
        }
    `;
    document.head.appendChild(errorStyle);
})();
