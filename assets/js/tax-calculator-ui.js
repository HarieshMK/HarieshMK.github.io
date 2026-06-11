/**
 * Unexciting Money Club - Tax Calculator UI Modifier Layer
 * Mandated for managing pure interface view layout updates, interactions, and style bindings.
 */

const TaxUI = {
    // 1. Smooth Scroll Engine
    scrollToResults() {
        const target = document.getElementById('tax-breakdown-section');
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    },

    // 2. Section Collapsible Accordion Core
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

    // 3. Home Loan Interactive Form Wizards
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

    // 4. Tax Regime Dynamic Highlights (Winner / Loser Card States)
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

    // 5. Compliance Audits (HRA and Active Housing Loan Warnings)
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

    // 6. Dynamic Form Warnings Feedback
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

    // 7. Input Field Validations
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

// Execute Initializations on DOM Load Completion Lifecycle
document.addEventListener("DOMContentLoaded", function() {
    TaxUI.setupToggle('80c-header', '80c-content', '80c-icon');
    TaxUI.setupToggle('80d-header', '80d-content', '80d-icon');
    TaxUI.setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
    TaxUI.setupToggle('nps-header', 'nps-content', 'nps-icon');

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

    setTimeout(() => {
        TaxUI.updateRegimeHighlights();
        TaxUI.checkHraLoanWarning();
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
    `;
    document.head.appendChild(errorStyle);
})();
