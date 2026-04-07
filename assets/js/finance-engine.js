/**
 * FinanceEngine: The core logic for all financial calculations.
 * This file is UI-agnostic (no DOM references).
 */
const FinanceEngine = {
    
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

    // 2. Goal Gap Math (From goal-planner.js)
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

/* 6. Tax Calculation Module */
const TaxEngine = {

    // A. The "Best of 3" HRA Logic from your Excel
    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, rentPaid - (basic * 0.1));
        
        return Math.min(limit1, limit2, limit3);
    },

    // B. Base Slab Calculator (G3 in your Excel)
    calculateBaseSlabTax: (income, slabs) => {
        let tax = 0;
        slabs.forEach(slab => {
            if (income > slab.start) {
                let amountInSlab = Math.min(income, slab.end) - slab.start;
                tax += amountInSlab * slab.rate;
            }
        });
        return tax;
    },

    // C. The Main New Regime Function (With your Marginal Relief Logic)
    calculateNewRegime: (grossIncome) => {
        const config = TAX_CONFIG.newRegime;
        const netTaxable = Math.max(0, grossIncome - config.stdDeduction);
        
        if (netTaxable <= config.rebateLimit) return 0;

        // Slab Tax (G3)
        const slabTax = TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        
        // Marginal Relief (G5): Tax cannot exceed income above 12L
        const extraIncome = netTaxable - config.rebateLimit;
        const taxAfterRelief = Math.min(slabTax, extraIncome);
        
        const cess = taxAfterRelief * TAX_CONFIG.cessRate;
        return taxAfterRelief + cess;
    },

    // D. The Old Regime Function (Handles your 80C, 80D, etc.)
    calculateOldRegime: (grossIncome, deductions) => {
        const config = TAX_CONFIG.oldRegime;
        const d = deductions;

        // Apply Limits to Deductions
        const capped80C = Math.min(d.section80C, config.limits.section80C);
        const capped80D = Math.min(d.section80D, d.isParentSenior ? config.limits.section80D_SeniorParents : config.limits.section80D_Parents) + Math.min(d.section80D_Self, config.limits.section80D_Self);
        const capped24b = Math.min(d.homeLoanInterest, config.limits.section24b);
        const cappedNPS = Math.min(d.npsIndividual, config.limits.section80CCD_1B);

        const totalDeductions = config.stdDeduction + capped80C + capped80D + capped24b + cappedNPS + d.exemptHRA + d.otherExemptions;
        
        const netTaxable = Math.max(0, grossIncome - totalDeductions);

        // Rebate check for Old Regime (Usually up to 5L)
        if (netTaxable <= config.rebateLimit) return 0;

        const slabTax = TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        const cess = slabTax * TAX_CONFIG.cessRate;
        
        return slabTax + cess;
    }
};

// Update the main object to include TaxEngine
FinanceEngine.TaxEngine = TaxEngine;
