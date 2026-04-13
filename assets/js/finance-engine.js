/**
 * FinanceEngine: The core logic for all financial calculations.
 * This file is UI-agnostic (no DOM references).
 */
var FinanceEngine = window.FinanceEngine || {
    
    // 1. Core Future Value Math (SIP + Lumpsum) - UNTOUCHED
    calculateFutureValue: (monthlySIP, lumpSum, annualRate, years) => {
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;

        const fvSIP = monthlyRate > 0 
            ? monthlySIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate) 
            : monthlySIP * months;
            
        const fvLumpSum = lumpSum * Math.pow(1 + monthlyRate, months);
        const totalValue = fvSIP + fvLumpSum;
        const totalInvested = (monthlySIP * months) + lumpSum;

        return {
            totalValue: totalValue,
            totalInvested: totalInvested,
            estimatedReturns: totalValue - totalInvested
        };
    },

    // 2. Goal Gap Math - UNTOUCHED
    calculateGoalGap: (currentPrice, existingCorpus, inflationRate, annualCorpReturn, years) => {
        const i = inflationRate / 100;
        const r = annualCorpReturn / 100;

        const futureCost = currentPrice * Math.pow(1 + i, years);
        const grownSavings = existingCorpus * Math.pow(1 + r, years);
        const gap = Math.max(0, futureCost - grownSavings);

        return {
            futureCost: futureCost,
            grownSavings: grownSavings,
            gap: gap
        };
    },

    // 3. Required SIP to bridge a Gap - UNTOUCHED
    calculateRequiredSIP: (targetAmount, annualReturnRate, years) => {
        const monthlyRate = (annualReturnRate / 100) / 12;
        const months = years * 12;
        
        if (targetAmount <= 0) return 0;
        if (monthlyRate <= 0) return targetAmount / months;

        return (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    },

    // 4. Inflation Adjustment (Purchasing Power) - UNTOUCHED
    adjustForInflation: (value, annualInflation, years) => {
        return value / Math.pow(1 + (annualInflation / 100), years);
    },

    // 5. Formatting Utilities - UNTOUCHED
    formatIndian: (num) => {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
        if (num >= 100000) return (num / 100000).toFixed(2) + " L";
        return Math.round(num).toLocaleString('en-IN');
    }
};

/* 6. Tax Calculation Module attached to FinanceEngine */
FinanceEngine.TaxEngine = {
    // 1. IMPROVED HRA LOGIC - UNTOUCHED
    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1));
        
        const finalExemption = Math.min(limit1, limit2, limit3);
        
        return {
            actualExemption: finalExemption,
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

    // 2. NEW REGIME - UPDATED ONLY FOR HOME LOAN
    calculateNewRegime: (selectedYear, grossIncome, perks, deductions = {}, basicSalary = 0) => {
        perks = perks || [];
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.newRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;

        // HOME LOAN UPDATE: New Regime only allows deduction for Let-out Property
        if (deductions.occupancy === 'let-out' && deductions.homeLoanInterest > 0) {
            totalExemptions += deductions.homeLoanInterest;
        }

        let perkBreakdown = [];
        perks.forEach(p => {
            let eligible = 0;
            const rule = perksConfig[p.type];
            const isAllowed = rule && (rule.regime === "both" || rule.regime === "new" || !rule.regime);
        
            if (isAllowed) {
                if (p.type === "Corporate NPS") {
                    const maxAllowed = basicSalary * (rule.newLimit || 0.14);
                    eligible = Math.min(p.amount, maxAllowed);
                } else {
                    eligible = p.amount;
                }
            }
            totalExemptions += eligible;
            perkBreakdown.push({ type: p.type, eligible });
        });
        const netTaxable = Math.max(0, grossIncome - totalExemptions);
        
        let tax = 0;
        if (netTaxable > config.rebateLimit) {
            const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
            const extraIncome = netTaxable - config.rebateLimit;
            tax = Math.min(slabTax, extraIncome);
        }

        return {
            tax: tax + (tax * TAX_CONFIG.cessRate),
            netTaxable,
            totalExemptions,
            perkBreakdown
        };
    },

   calculateOldRegime: (selectedYear, grossIncome, deductions, perks, basicSalary = 0) => {
        perks = perks || [];
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.oldRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;
        
        // HOME LOAN UPDATE: Bundle Principal & Stamp Duty into 80C
        let other80C = (deductions.section80C || 0) + 
                       (deductions.homePrincipal || 0) + 
                       (deductions.stampDuty || 0);

        perks.forEach(p => {
            const rule = perksConfig[p.type];
            const isAllowed = rule && (rule.regime === "both" || rule.regime === "old" || !rule.regime);
        
            if (isAllowed) {
                if (p.type === "Corporate NPS") {
                    const maxAllowed = basicSalary * (rule.oldLimit || 0.10);
                    totalExemptions += Math.min(p.amount, maxAllowed);
                } else if (p.type === "VPF") {
                    other80C += p.amount;
                } else {
                    totalExemptions += p.amount;
                }
            }
        });

        // Waterfall: 80C + 80CCD(1B) - UNTOUCHED
        const cappedOther80C = Math.min(other80C, config.limits.section80C);
        const spaceLeftIn80C = Math.max(0, config.limits.section80C - cappedOther80C);
        const npsUsedIn80C = Math.min(deductions.npsSelf || 0, spaceLeftIn80C);
        const npsFor80CCD = Math.min((deductions.npsSelf || 0) - npsUsedIn80C, config.limits.section80CCD_1B);

        // HOME LOAN UPDATE: Section 24b and 80EEA logic
        let interest24b = 0;
        let interest80EEA = 0;
        const totalInterestPaid = deductions.homeLoanInterest || 0;

        if (deductions.occupancy === 'let-out') {
            interest24b = Math.min(totalInterestPaid, 200000); // Cap offset against salary at 2L
        } else {
            interest24b = Math.min(totalInterestPaid, config.limits.section24b || 200000);
            
            const remainingInterest = totalInterestPaid - interest24b;
            if (remainingInterest > 0 && deductions.isEligible80EEA) {
                interest80EEA = Math.min(remainingInterest, 150000);
            }
        }
        
        // 80D Calculation - UNTOUCHED
        const limit80D = deductions.parentsSenior ? 
            (config.limits.section80D_Self + config.limits.section80D_SeniorParents) : 
            (config.limits.section80D_Self + (config.limits.section80D_Parents || 25000));
        
        const capped80D = Math.min(deductions.section80D || 0, limit80D);

        const totalDeductions = totalExemptions + cappedOther80C + npsUsedIn80C + npsFor80CCD + interest24b + interest80EEA + capped80D + (deductions.exemptHRA || 0);
        
        const netTaxable = Math.max(0, grossIncome - totalDeductions);

        let tax = 0;
        if (netTaxable > config.rebateLimit) {
            const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
            tax = (netTaxable <= 500000) ? Math.max(0, slabTax - config.maxRebate) : slabTax;
        }
       
        return {
            tax: tax + (tax * (yearData.cessRate || TAX_CONFIG.cessRate)),
            netTaxable,
            totalDeductions
        };
    }
};
