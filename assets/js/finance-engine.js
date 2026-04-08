/**
 * FinanceEngine: The core logic for all financial calculations.
 * This file is UI-agnostic (no DOM references).
 */
var FinanceEngine = window.FinanceEngine || {
    
    // 1. Core Future Value Math (SIP + Lumpsum)
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

    // 2. Goal Gap Math
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

    // 3. Required SIP to bridge a Gap
    calculateRequiredSIP: (targetAmount, annualReturnRate, years) => {
        const monthlyRate = (annualReturnRate / 100) / 12;
        const months = years * 12;
        
        if (targetAmount <= 0) return 0;
        if (monthlyRate <= 0) return targetAmount / months;

        return (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    },

    // 4. Inflation Adjustment (Purchasing Power)
    adjustForInflation: (value, annualInflation, years) => {
        return value / Math.pow(1 + (annualInflation / 100), years);
    },

    // 5. Formatting Utilities
    formatIndian: (num) => {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
        if (num >= 100000) return (num / 100000).toFixed(2) + " L";
        return Math.round(num).toLocaleString('en-IN');
    }
};

/* 6. Tax Calculation Module attached to FinanceEngine */
FinanceEngine.TaxEngine = {
    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1)); // Monthly rent to Annual
        return Math.min(limit1, limit2, limit3);
    },

    calculateBaseSlabTax: (income, slabs) => {
        let tax = 0;
        let previousLimit = 0;
        if (!slabs) return 0;
        
        slabs.forEach(slab => {
            if (income > previousLimit) {
                let currentLimit = slab.limit === Infinity ? income : slab.limit;
                let taxableInSlab = Math.min(income, currentLimit) - previousLimit;
                if (taxableInSlab > 0) tax += taxableInSlab * slab.rate;
            }
            previousLimit = slab.limit;
        });
        return tax;
    },

    calculateNewRegime: (grossIncome) => {
        if (typeof TAX_CONFIG === 'undefined') return 0;
        const config = TAX_CONFIG.newRegime;
        const netTaxable = Math.max(0, grossIncome - config.stdDeduction);
        
        if (netTaxable <= config.rebateLimit) return 0;

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        const extraIncome = netTaxable - config.rebateLimit;
        const taxAfterRelief = Math.min(slabTax, extraIncome); // Marginal Relief
        
        return taxAfterRelief + (taxAfterRelief * TAX_CONFIG.cessRate);
    },

    calculateOldRegime: (grossIncome, deductions) => {
        if (typeof TAX_CONFIG === 'undefined') return 0;
        const config = TAX_CONFIG.oldRegime;
        const d = deductions;

        // Apply Hard Limits
        const capped80C = Math.min(d.section80C || 0, config.limits.section80C);
        const capped24b = Math.min(d.homeLoanInterest || 0, config.limits.section24b);
        const capped80D = Math.min(d.section80D || 0, config.limits.section80D_Self + config.limits.section80D_Parents);

        const totalDeductions = config.stdDeduction + capped80C + capped24b + capped80D + (d.exemptHRA || 0) + (d.otherExemptions || 0);
        const netTaxable = Math.max(0, grossIncome - totalDeductions);

        if (netTaxable <= config.rebateLimit) return 0;

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        return slabTax + (slabTax * TAX_CONFIG.cessRate);
    }
};
