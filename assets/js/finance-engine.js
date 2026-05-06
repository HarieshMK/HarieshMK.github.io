/**
 * FinanceEngine: The core logic for all financial calculations.
 * This file is UI-agnostic (no DOM references).
 */
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
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1));
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
            let eligible = 0;
            const rule = perksConfig[p.type];
            if (rule && (rule.regime === "both" || rule.regime === "new" || !rule.regime)) {
                eligible = (p.type === "Corporate NPS") ? Math.min(p.amount, basicSalary * (rule.newLimit || 0.14)) : p.amount;
            }
            totalExemptions += eligible;
            perkBreakdown.push({ type: p.type, eligible });
        });

        const netTaxable = Math.max(0, grossIncome - totalExemptions);
        let tax = (netTaxable > config.rebateLimit) ? FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs) : 0;
        
        // Marginal Relief check for rebate
        if (netTaxable <= config.rebateLimit) {
            tax = 0; 
        } else {
            let taxBeforeRelief = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
            let excessIncome = netTaxable - config.rebateLimit;
            tax = Math.min(taxBeforeRelief, excessIncome);
        }

        const cess = (yearData.cessRate !== undefined) ? yearData.cessRate : 0.04;
        return { tax: tax + (tax * cess), netTaxable, totalExemptions, perkBreakdown };
    },

    calculateOldRegime: (selectedYear, grossIncome, deductions, perks, basicSalary = 0) => {
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.oldRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;
        let other80C = deductions.section80C || 0;

        (perks || []).forEach(p => {
            const rule = perksConfig[p.type];
            if (rule && (rule.regime === "both" || rule.regime === "old" || !rule.regime)) {
                if (p.type === "Corporate NPS") totalExemptions += Math.min(p.amount, basicSalary * (rule.oldLimit || 0.10));
                else if (p.type === "VPF") other80C += p.amount;
                else totalExemptions += p.amount;
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
        let tax = (netTaxable > config.rebateLimit) ? FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs) : 0;

        const cess = yearData.cessRate !== undefined ? yearData.cessRate : 0.04;
        return {
            tax: tax + (tax * cess),
            netTaxable,
            totalDeductions,
            appliedDeductions: { section80C: cappedOther80C, section80D: totalCapped80D, homeInterest: interest24b + interest80EEA }
        };
    } 
};
