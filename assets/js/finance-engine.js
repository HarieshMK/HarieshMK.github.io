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
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1)); 
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

    // ADDED basicSalary as a parameter here
    calculateNewRegime: (grossIncome, perks, basicSalary = 0) => {
        const config = TAX_CONFIG.newRegime;
        
        let exemptions = config.stdDeduction;
        perks.forEach(p => {
            if (p.type === "Meal Coupons") {
                exemptions += Math.min(p.amount, 105600);
            } else if (p.type === "Corporate NPS") {
                // 14% limit for New Regime
                const limit = basicSalary * 0.14;
                exemptions += Math.min(p.amount, limit);
            } else if (p.type === "Mobile & Internet" || p.type === "Books & Periodicals") {
                exemptions += p.amount;
            }
        });

        const netTaxable = Math.max(0, grossIncome - exemptions);
        
        // Income up to rebateLimit (12L in 2026) is tax-free
        if (netTaxable <= config.rebateLimit) return 0;

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        
        // Marginal Relief logic for 2026
        const extraIncome = netTaxable - config.rebateLimit;
        const taxAfterRelief = Math.min(slabTax, extraIncome);
        
        return taxAfterRelief + (taxAfterRelief * TAX_CONFIG.cessRate);
    },

    // ADDED basicSalary as a parameter here
    calculateOldRegime: (grossIncome, deductions, perks, basicSalary = 0) => {
        const config = TAX_CONFIG.oldRegime;
        
        let perkExemptions = 0;
        let local80C = deductions.section80C || 0;

        perks.forEach(p => {
            if (p.type === "Corporate NPS") {
                // 10% limit for Old Regime
                const limit = basicSalary * 0.10;
                perkExemptions += Math.min(p.amount, limit);
            } else if (p.type === "Meal Coupons") {
                perkExemptions += Math.min(p.amount, 105600);
            } else if (p.type === "VPF") {
                local80C += p.amount;
            } else {
                perkExemptions += p.amount;
            }
        });

        const capped80C = Math.min(local80C, config.limits.section80C);
        const capped24b = Math.min(deductions.homeLoanInterest || 0, config.limits.section24b);
        const capped80D = Math.min(deductions.section80D || 0, 75000); 

        const totalDeductions = config.stdDeduction + capped80C + capped24b + capped80D + 
                                (deductions.exemptHRA || 0) + perkExemptions;

        const netTaxable = Math.max(0, grossIncome - totalDeductions);
        
        if (netTaxable <= config.rebateLimit) return 0;

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        return slabTax + (slabTax * TAX_CONFIG.cessRate);
    }
};
