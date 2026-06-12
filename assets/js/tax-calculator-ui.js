/**
 * Unexciting Money Club - Tax Calculator UI Modifier Layer
 * Mandated for managing pure interface view layout updates, interactions, and style bindings.
 */

const TaxUI = {
    isUpdating: false,

    trace(methodName) {
        console.group(`[Trace] ${methodName}`);
        console.trace();
        console.groupEnd();
    },

    scrollToResults() {
        const target = document.getElementById('tax-breakdown-section');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    initCustomDropdowns() {
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
    },

    styleSelectsInContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.querySelectorAll('select').forEach(dynamicSelect => {
            dynamicSelect.style.backgroundColor = '#0f172a';
            dynamicSelect.style.color = '#f8fafc';
            dynamicSelect.style.border = '1.5px solid #334155';

            dynamicSelect.querySelectorAll('option').forEach(opt => {
                opt.style.backgroundColor = '#1e293b';
                opt.style.color = '#f8fafc';
            });
        });
    },

    initDropdownStyles() {
        this.styleSelectsInContainer('perks-rows-container');
        this.styleSelectsInContainer('80c-rows-container');

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            }
        });
    },

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

    updateRegimeHighlights() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        const oldCard = document.getElementById('old-regime-card');
        const newCard = document.getElementById('new-regime-card');
        if (!oldCard || !newCard) { this.isUpdating = false; return; }

        const getVal = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            return parseFloat(el.innerText.replace(/[^0-9.-]+/g, "")) || 0;
        };

        const oldTax = getVal('old-regime-tax');
        const newTax = getVal('new-regime-tax');

        oldCard.className = 'regime-row-card';
        newCard.className = 'regime-row-card';

        if (oldTax > 0 || newTax > 0) {
            if (oldTax < newTax) {
                oldCard.classList.add('regime-winner');
                newCard.classList.add('regime-loser');
            } else if (newTax < oldTax) {
                newCard.classList.add('regime-winner');
                oldCard.classList.add('regime-loser');
            }
        }
        this.isUpdating = false;
    },

    checkHraLoanWarning() {
        const rentInput = document.getElementById('rent-paid');
        const homeLoanCheck = document.getElementById('has-home-loan');
        const warningBox = document.getElementById('hra-loan-legal-warning');
        if (!warningBox) return;

        const rentPaid = rentInput ? (parseFloat(rentInput.value.replace(/,/g, "")) || 0) : 0;
        const loanChecked = homeLoanCheck ? homeLoanCheck.checked : false;

        warningBox.style.display = (rentPaid > 0 && loanChecked) ? 'block' : 'none';
    },

    validateInputs() {
        let isValid = true;
        document.querySelectorAll('.currency-mapped').forEach(input => {
            const cleanFn = window.TaxController?.cleanNum || ((v) => parseFloat(v.replace(/,/g, '')) || 0);
            if (cleanFn(input.value) < 0) {
                input.classList.add('input-error');
                isValid = false;
            } else {
                input.classList.remove('input-error');
            }
        });
        return isValid;
    }
};

window.TaxUI = TaxUI;

document.addEventListener("DOMContentLoaded", function() {
    TaxUI.setupToggle('80c-header', '80c-content', '80c-icon');
    TaxUI.setupToggle('80d-header', '80d-content', '80d-icon');
    TaxUI.setupToggle('home-loan-header', 'home-loan-content', 'home-loan-icon');
    TaxUI.setupToggle('nps-header', 'nps-content', 'nps-icon');

    TaxUI.initCustomDropdowns();
    TaxUI.initDropdownStyles();

    const breakdownBtn = document.getElementById('view-breakdown-btn');
    if (breakdownBtn) {
        breakdownBtn.addEventListener('click', (e) => { e.preventDefault(); TaxUI.scrollToResults(); });
    }

    const homeLoanCheck = document.getElementById('has-home-loan');
    if (homeLoanCheck) homeLoanCheck.addEventListener('change', TaxUI.toggleLoanWizard);

    const targetOld = document.getElementById('old-regime-tax');
    const targetNew = document.getElementById('new-regime-tax');
    if (targetOld && targetNew) {
        const observer = new MutationObserver(() => {
            observer.disconnect();
            TaxUI.updateRegimeHighlights();
            observer.observe(targetOld, { childList: true, characterData: true, subtree: true });
            observer.observe(targetNew, { childList: true, characterData: true, subtree: true });
        });
        observer.observe(targetOld, { childList: true, characterData: true, subtree: true });
        observer.observe(targetNew, { childList: true, characterData: true, subtree: true });
    }

    document.addEventListener('input', TaxUI.checkHraLoanWarning);
    document.addEventListener('change', () => {
        TaxUI.checkHraLoanWarning();
        setTimeout(() => TaxUI.updateRegimeHighlights(), 50);
    });

    const sanctionInput = document.getElementById('loan-sanction-date');
    if (sanctionInput) {
        sanctionInput.addEventListener('change', () => {
            TaxUI.handleDateBranching();
            if (window.TaxController) window.TaxController.calculateAll();
        });
    }

    document.querySelectorAll('input[name="possession"]').forEach(radio => {
        radio.addEventListener('change', TaxUI.handleLoanStatusChange);
    });

    setTimeout(() => {
        TaxUI.updateRegimeHighlights();
        TaxUI.checkHraLoanWarning();
        TaxUI.handleDateBranching();
    }, 400);
});

(function injectUIStyles() {
    if (document.getElementById('tax-calculator-error-styles')) return;
    const style = document.createElement('style');
    style.id = 'tax-calculator-error-styles';
    style.innerHTML = `
        .input-error { border: 1px solid #ef4444 !important; background-color: #fef2f2 !important; }
        .perk-limit-warning { color: #f59e0b; font-size: 0.75rem; margin-top: 4px; display: none; }
        #80c-rows-container > div { display: grid !important; grid-template-columns: 1.6fr 1fr 40px !important; align-items: center !important; gap: 12px !important; margin-bottom: 12px !important; }
        #perks-rows-container > div { display: grid !important; grid-template-columns: 1.6fr 1fr 0.8fr 40px !important; align-items: center !important; gap: 12px !important; margin-bottom: 12px !important; }
        @media (max-width: 768px) { #perks-rows-container > div { grid-template-columns: 1fr !important; } }
        .unique-tax-calc select, #perks-rows-container select, #80c-rows-container select { background-color: #0f172a !important; color: #f8fafc !important; border-radius: 12px !important; height: 48px !important; border: 1.5px solid #334155 !important; appearance: none !important; }
    `;
    document.head.appendChild(style);
})();
