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
    // 1. IMPROVED HRA LOGIC
    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1));
        
        const finalExemption = Math.min(limit1, limit2, limit3);
        
        return {
            actualExemption: finalExemption,      // For the Tax Math
            maxPossibleExemption: Math.min(limit2, limit3), // The "Eligible" column value
            isLimitedByHRA: limit1 < Math.min(limit2, limit3) // True if they should ask for more HRA
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

    // 2. NEW REGIME WITH OBJECT RETURN
    calculateNewRegime: (grossIncome, perks, basicSalary = 0) => {
        const config = TAX_CONFIG.newRegime;
        let totalExemptions = config.stdDeduction;
        let corpNPSUsed = 0;

        perks.forEach(p => {
            if (p.type === "Meal Coupons") {
                totalExemptions += Math.min(p.amount, 105600);
            } else if (p.type === "Corporate NPS") {
                corpNPSUsed = Math.min(p.amount, basicSalary * 0.14);
                totalExemptions += corpNPSUsed;
            } else if (["Mobile & Internet", "Books & Periodicals"].includes(p.type)) {
                totalExemptions += p.amount;
            }
        });

        const netTaxable = Math.max(0, grossIncome - totalExemptions);
        
        if (netTaxable <= config.rebateLimit) return { tax: 0, netTaxable, totalExemptions };

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        const extraIncome = netTaxable - config.rebateLimit;
        const taxAfterRelief = Math.min(slabTax, extraIncome);
        
        return {
            tax: taxAfterRelief + (taxAfterRelief * TAX_CONFIG.cessRate),
            netTaxable,
            totalExemptions,
            corpNPSEligible: basicSalary * 0.14
        };
    },

    // 3. OLD REGIME WITH WATERFALL & OBJECT RETURN
    calculateOldRegime: (grossIncome, deductions, perks, basicSalary = 0) => {
        const config = TAX_CONFIG.oldRegime;
        let perkExemptions = 0;
        let npsSelf = deductions.npsSelf || 0;
        let other80C = deductions.section80C || 0;

        perks.forEach(p => {
            if (p.type === "Corporate NPS") {
                perkExemptions += Math.min(p.amount, basicSalary * 0.10);
            } else if (p.type === "Meal Coupons") {
                perkExemptions += Math.min(p.amount, 105600);
            } else if (p.type === "VPF") {
                other80C += p.amount;
            } else {
                perkExemptions += p.amount;
            }
        });

        // Waterfall Logic for 80C + 80CCD(1B)
        const cappedOther80C = Math.min(other80C, config.limits.section80C);
        const spaceLeftIn80C = config.limits.section80C - cappedOther80C;
        const npsUsedToFill80C = Math.min(npsSelf, spaceLeftIn80C);
        const npsRemainingAfter80C = npsSelf - npsUsedToFill80C;
        const capped80CCD1B = Math.min(npsRemainingAfter80C, config.limits.section80CCD_1B);

        const final80CTotal = cappedOther80C + npsUsedToFill80C;
        const capped24b = Math.min(deductions.homeLoanInterest || 0, config.limits.section24b);
        
        const limit80D = deductions.parentsSenior ? 
                         (config.limits.section80D_Self + config.limits.section80D_SeniorParents) : 
                         (config.limits.section80D_Self + config.limits.section80D_Parents);
        const capped80D = Math.min(deductions.section80D || 0, limit80D);

        const totalDeductions = config.stdDeduction + final80CTotal + capped80CCD1B + capped24b + capped80D + (deductions.exemptHRA || 0) + perkExemptions;
        const netTaxable = Math.max(0, grossIncome - totalDeductions);

        if (netTaxable <= config.rebateLimit) return { tax: 0, netTaxable, totalDeductions };

        const slabTax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        
        return {
            tax: slabTax + (slabTax * TAX_CONFIG.cessRate),
            netTaxable,
            totalDeductions,
            corpNPSEligible: basicSalary * 0.10,
            nps80CCD: capped80CCD1B,
            final80C: final80CTotal
        };
    }
};
