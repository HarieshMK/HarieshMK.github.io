var FinanceEngine = {

    calculateFutureValue: function(investmentAmount, lumpSum, annualRate, years, frequency = 'monthly') {
        const r_annual = annualRate / 100;
        let totalValue = 0;
        let totalInvested = 0;
        let n = 0; 
        let r_periodic = 0; 

        if (frequency === 'monthly') {
            // SEBI Standard Geometric Rate: find 'r' such that (1+r)^12 = (1 + annualRate)
            r_periodic = Math.pow(1 + r_annual, 1/12) - 1;
            n = 12;
            const totalPeriods = years * n;

            let fvSIP = (r_periodic > 0) 
                ? investmentAmount * ((Math.pow(1 + r_periodic, totalPeriods) - 1) / r_periodic) * (1 + r_periodic)
                : investmentAmount * totalPeriods;

            const fvLumpSum = lumpSum * Math.pow(1 + r_periodic, totalPeriods);
            totalValue = fvSIP + fvLumpSum;
            totalInvested = (investmentAmount * totalPeriods) + lumpSum;

        } else {
            r_periodic = r_annual; 
            n = 1;
            const totalPeriods = years * n;

            let fvYearly = (r_periodic > 0)
                ? investmentAmount * ((Math.pow(1 + r_periodic, totalPeriods) - 1) / r_periodic) * (1 + r_periodic)
                : investmentAmount * totalPeriods;

            const fvLumpSum = lumpSum * Math.pow(1 + r_periodic, totalPeriods);
            totalValue = fvYearly + fvLumpSum;
            totalInvested = (investmentAmount * totalPeriods) + lumpSum;
        }

        return { 
            totalValue: Math.round(totalValue), 
            totalInvested: Math.round(totalInvested), 
            estimatedReturns: Math.round(totalValue - totalInvested) 
        };
    },

    calculateGoalGap: function(currentPrice, existingCorpus, inflationRate, annualCorpReturn, years) {
        const i = inflationRate / 100;
        const r = annualCorpReturn / 100;
        const futureCost = currentPrice * Math.pow(1 + i, years);
        const grownSavings = existingCorpus * Math.pow(1 + r, years);
        return { futureCost, grownSavings, gap: Math.max(0, futureCost - grownSavings) };
    },

    calculateRequiredSIP: function(targetAmount, annualReturnRate, years) {
        const monthlyRate = (annualReturnRate / 100) / 12;
        const months = years * 12;
        if (targetAmount <= 0) return 0;
        if (monthlyRate <= 0) return targetAmount / months;
        return (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    },

    adjustForInflation: function(value, annualInflation, years) {
        return value / Math.pow(1 + (annualInflation / 100), years);
    },

    formatIndian: function(num) {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
        if (num >= 100000) return (num / 100000).toFixed(2) + " L";
        return Math.round(num).toLocaleString('en-IN');
    }
};

/* =========================================================================
   Universal Formatters & Data Sanitizers (Shared across all calculators)
   ========================================================================= */
FinanceEngine.Formatters = {
    // 1. Cleans currency strings to pure float numbers safely
    cleanNum: function(val) {
        if (val === undefined || val === null || val === '') return 0;
        const cleanValue = val.toString().replace(/,/g, "").replace(/[^0-9.-]+/g, "");
        return parseFloat(cleanValue) || 0;
    },

    // 2. Core algorithm to apply Indian formatting style commas to numerical text
    formatIndianCurrency: function(valueString) {
        let value = valueString.toString().replace(/,/g, '');
        if (!value) return '';
        let parts = value.split('.');
        let lastThree = parts[0].substring(parts[0].length - 3);
        let otherBits = parts[0].substring(0, parts[0].length - 3);
        if (otherBits !== '') lastThree = ',' + lastThree;
        let formatted = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        if (parts.length > 1) { formatted += '.' + parts[1]; }
        return formatted;
    },

    // 3. UI-Agnostic Mask Coordinator (Calculates clean text changes & shifts cursors safely)
    applyCurrencyMask: function(currentValue, selectionStart) {
        let oldLength = currentValue.length;
        let formatted = this.formatIndianCurrency(currentValue);
        let newLength = formatted.length;
        
        // Calculate where the cursor needs to step forward or backward based on added commas
        let adjustedCursor = selectionStart + (newLength - oldLength);

        return {
            formattedValue: formatted,
            newCursorPosition: adjustedCursor
        };
    }
};

/* Tax Calculation Module */
FinanceEngine.TaxEngine = {
    // NEW: Capital Gains & FD Tax Constants
    TaxConfig: {
        EQUITY_MF: {
            stcgRate: 0.20, 
            ltcgRate: 0.125, 
            exemption: 125000,
            holdingPeriodForLongTerm: 1 // year
        },
        FD: {
            getRate: (slab) => slab / 100 
        }
    },

    // NEW: Asset-specific Tax Logic
    calculateCapitalTax: function(gain, years, taxTreatment, userSlab = 0) {
        if (gain <= 0) return 0;
        // taxTreatment would be "EQUITY" or "SLAB"
        if (taxTreatment === "EQUITY") {
            if (years < 1) {
                return gain * 0.20; // STCG
            } else {
                const taxableGain = Math.max(0, gain - 125000);
                return taxableGain * 0.125; // LTCG
            }
        }
        if (taxTreatment === "SLAB") {
            return gain * (userSlab / 100); // Fixed Deposits, etc.
        }
    
        return 0;
    },

    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, rentPaid - (basic * 0.1));
        return { 
            actualExemption: Math.min(limit1, limit2, limit3), 
            maxPossibleExemption: Math.min(limit2, limit3), 
            isLimitedByHRA: limit1 < Math.min(limit2, limit3) 
        };
    },

    calculateBaseSlabTax: (income, slabs) => {
        let tax = 0;
        let previousLimit = 0;
        if (!slabs) return 0;
        slabs.forEach(slab => {
            if (income > previousLimit) {
                let currentLimit = (slab.limit === Infinity) ? income : slab.limit;
                let taxableInSlab = Math.min(income, currentLimit) - previousLimit;
                if (taxableInSlab > 0) tax += taxableInSlab * slab.rate;
            }
            previousLimit = slab.limit;
        });
        return tax;
    },

    calculateTax: (netTaxable, regimeType, selectedYear) => {
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData[regimeType === 'new' ? 'newRegime' : 'oldRegime'];
        
        // 1. Calculate base slab tax
        let tax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        
        // 2. Apply Regime-specific Rebates/Marginal Relief
        if (netTaxable <= config.rebateLimit) {
            tax = 0;
        } else if (regimeType === 'new') {
            // Marginal Relief for New Regime
            tax = Math.min(tax, netTaxable - config.rebateLimit);
        }
        
        // 3. Apply Cess consistently
        const cess = (yearData.cessRate !== undefined) ? yearData.cessRate : 0.04;
        return tax + (tax * cess);
    },

    calculateNewRegime: (selectedYear, grossIncome, perks, deductions = {}, basicSalary = 0) => {
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.newRegime;
        const perksConfig = yearData.perkRules;
        let totalExemptions = config.stdDeduction;

        if ((deductions.occupancy === 'let-out' || deductions.occupancy === 'rented') && (deductions.homeLoanInterest > 0)) {
            totalExemptions += (deductions.homeLoanInterest || 0);
        }

        let perkBreakdown = [];
        (perks || []).forEach(p => {
            // Structural normalization: read either property fallback safely to 0
            const itemAmount = p.amount !== undefined ? p.amount : (p.value !== undefined ? p.value : 0);
            let eligible = 0;
        
            const rule = perksConfig[p.type];
            if (rule && (rule.regime === "both" || rule.regime === "new" || !rule.regime)) {
                eligible = (p.type === "Corporate NPS") 
                    ? Math.min(itemAmount, basicSalary * (rule.newLimit || 0.14)) 
                    : itemAmount;
            } else {
                eligible = 0; // Explicitly enforce zero if not allowed under the New Regime
            }
        
            totalExemptions += eligible;
            perkBreakdown.push({ type: p.type, eligible: eligible });
        });

        const netTaxable = Math.max(0, grossIncome - totalExemptions);
        
        // Use the Unified Controller
        const finalTax = FinanceEngine.TaxEngine.calculateTax(netTaxable, 'new', selectedYear);
        
        return { tax: finalTax, netTaxable, totalExemptions, perkBreakdown };
    },

    calculateOldRegime: (selectedYear, grossIncome, deductions, perks, basicSalary = 0) => {
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.oldRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;
        let other80C = deductions.section80C || 0;

        (perks || []).forEach(p => {
            const itemAmount = p.amount !== undefined ? p.amount : (p.value !== undefined ? p.value : 0);
            const rule = perksConfig[p.type];
        
            if (rule && (rule.regime === "both" || rule.regime === "old" || !rule.regime)) {
                if (p.type === "Corporate NPS") {
                    totalExemptions += Math.min(itemAmount, basicSalary * (rule.oldLimit || 0.10));
                } else if (p.type === "VPF") {
                    other80C += itemAmount;
                } else {
                    totalExemptions += itemAmount;
                }
            }
        });

        const cappedOther80C = Math.min(other80C, config.limits.section80C);
        const spaceLeftIn80C = Math.max(0, config.limits.section80C - cappedOther80C);
        const npsUsedIn80C = Math.min(deductions.npsSelf || 0, spaceLeftIn80C);
        const npsFor80CCD = Math.min((deductions.npsSelf || 0) - npsUsedIn80C, config.limits.section80CCD_1B);

        const interest24b = (deductions.occupancy === 'let-out' || deductions.occupancy === 'rented') 
            ? (deductions.homeLoanInterest || 0) 
            : Math.min(deductions.homeLoanInterest || 0, config.limits.section24b || 200000);
        
        const interest80EEA = (interest24b < (deductions.homeLoanInterest || 0)) ? Math.min(deductions.extraLoanInterest || 0, config.limits.section80EEA || 150000) : 0;

        const selfLimit = config.limits.section80D_Self || 25000;
        const parentsLimit = deductions.parentsSenior ? (config.limits.section80D_SeniorParents || 50000) : (config.limits.section80D_Parents || 25000);
        const totalCapped80D = Math.min(deductions.healthSelf || 0, selfLimit) + Math.min(deductions.healthParents || 0, parentsLimit);

        const totalDeductions = totalExemptions + cappedOther80C + npsUsedIn80C + npsFor80CCD + interest24b + interest80EEA + totalCapped80D + (deductions.exemptHRA || 0);
        const netTaxable = Math.max(0, grossIncome - totalDeductions);
        // Use the Unified Controller
        const finalTax = FinanceEngine.TaxEngine.calculateTax(netTaxable, 'old', selectedYear);
        return {
            tax: finalTax,
            netTaxable,
            totalDeductions,
            appliedDeductions: { section80C: cappedOther80C, section80D: totalCapped80D, homeInterest: interest24b + interest80EEA }
        };
    },

    // processPerks is now nested here
    processPerks: (rawPerks, basicSalary, selectedYear) => {
        const yearData = TAX_CONFIG[selectedYear];
        const perksConfig = yearData.perkRules;

        return rawPerks.map(p => {
            const itemAmount = p.amount || 0;
            const rule = perksConfig[p.type];
            
            // We calculate eligibility here instead of inside the regime functions
            let eligibleNew = 0;
            let eligibleOld = 0;

            if (rule) {
                // Logic for New Regime
                if (rule.regime === "both" || rule.regime === "new" || !rule.regime) {
                    eligibleNew = (p.type === "Corporate NPS") 
                        ? Math.min(itemAmount, basicSalary * (rule.newLimit || 0.14)) 
                        : itemAmount;
                }
                
                // Logic for Old Regime
                if (rule.regime === "both" || rule.regime === "old" || !rule.regime) {
                    eligibleOld = (p.type === "Corporate NPS") 
                        ? Math.min(itemAmount, basicSalary * (rule.oldLimit || 0.10)) 
                        : itemAmount;
                }
            }

            return { type: p.type, amount: itemAmount, eligibleNew, eligibleOld };
        });
    }
};

FinanceEngine.LoanEngine = {
    calculateCLHL: function(transactions, annualRate) {
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        let schedule = [];
        let runningPrincipal = 0;
        let unpaidInterest = 0;
        const dailyRate = (annualRate / 100) / 365;

        // Loop through all transactions
        for (let i = 0; i < transactions.length; i++) {
            let event = transactions[i];
            
            // 1. Calculate interest accrued since the PREVIOUS transaction
            if (i > 0) {
                let prevDate = new Date(transactions[i - 1].date);
                let currDate = new Date(event.date);
                let diffDays = Math.ceil((currDate - prevDate) / (1000 * 60 * 60 * 24));
                
                unpaidInterest += (runningPrincipal * dailyRate * diffDays);
            }

            // 2. Apply current transaction
            if (event.type === 'disbursement') {
                runningPrincipal += event.amount;
            } else if (event.type === 'payment') {
                let payment = event.amount;
                let interestPaid = Math.min(payment, unpaidInterest);
                unpaidInterest -= interestPaid;
                runningPrincipal -= (payment - interestPaid);
            }

            schedule.push({
                date: event.date,
                principal: runningPrincipal,
                interest: unpaidInterest
            });
        }

        // 3. OPTIONAL: Add interest up to "Today" if you want to see current status
        const today = new Date();
        const lastEventDate = new Date(transactions[transactions.length - 1].date);
        if (today > lastEventDate) {
            let diffDays = Math.ceil((today - lastEventDate) / (1000 * 60 * 60 * 24));
            unpaidInterest += (runningPrincipal * dailyRate * diffDays);
            schedule.push({
                date: today.toISOString().split('T')[0],
                principal: runningPrincipal,
                interest: unpaidInterest
            });
        }

        return schedule;
    }
};

// Add to FinanceEngine.TaxEngine
FinanceEngine.TaxRules = {
    // Moved from tax-calculator.js: manageStatutoryRows
    calculateEPF: (basic) => Math.round(basic * 0.12),

    // Moved from tax-calculator.js: 80EE/80EEA logic
    getLoanTaxBenefits: (sanctionDateStr, propVal, loanAmt, interestPaid, isSelfOccupied) => {
        const sanctionDate = new Date(sanctionDateStr);
        const rules = window.ELIGIBILITY_RULES; // From tax-config.js
        let extraSection = null;
        let dExtra = 0;

        if (isSelfOccupied && interestPaid > 200000) {
            // Check 80EEA
            if (sanctionDate >= rules.sec80EEA.start && sanctionDate <= rules.sec80EEA.end &&
                propVal > 0 && propVal <= rules.sec80EEA.propertyLimit) {
                dExtra = Math.min(interestPaid - 200000, rules.sec80EEA.deductionLimit);
                extraSection = 'card-80eea';
            } 
            // Check 80EE
            else if (sanctionDate >= rules.sec80EE.start && sanctionDate <= rules.sec80EE.end &&
                     propVal > 0 && propVal <= rules.sec80EE.propertyLimit &&
                     loanAmt > 0 && loanAmt <= rules.sec80EE.loanLimit) {
                dExtra = Math.min(interestPaid - 200000, rules.sec80EE.deductionLimit);
                extraSection = 'card-80ee';
            }
        }
        return { dExtra, extraSection };
    }
};
