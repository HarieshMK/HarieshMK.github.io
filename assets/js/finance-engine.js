/**
 * FinanceEngine: The core logic for all financial calculations.
 * This file is UI-agnostic (no DOM references).
 */
var FinanceEngine = window.FinanceEngine || {
    
        calculateFutureValue: (monthlySIP, lumpSum, annualRate, years) => {
        const r = (annualRate / 100) / 12;
        const n = years * 12;
    
        let fvSIP;
        if (r > 0) {
            fvSIP = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        } else {
            fvSIP = monthlySIP * n;
        }
        // Lump sum compounding (Monthly frequency to match)
        const fvLumpSum = lumpSum * Math.pow(1 + r, n);
        const totalValue = fvSIP + fvLumpSum;
        const totalInvested = (monthlySIP * n) + lumpSum;
        return { 
            totalValue: Math.round(totalValue), 
            totalInvested, 
            estimatedReturns: Math.round(totalValue - totalInvested) 
        };
    },
    },

    calculateGoalGap: (currentPrice, existingCorpus, inflationRate, annualCorpReturn, years) => {
        const i = inflationRate / 100;
        const r = annualCorpReturn / 100;
        const futureCost = currentPrice * Math.pow(1 + i, years);
        const grownSavings = existingCorpus * Math.pow(1 + r, years);
        return { futureCost, grownSavings, gap: Math.max(0, futureCost - grownSavings) };
    },

    calculateRequiredSIP: (targetAmount, annualReturnRate, years) => {
        const monthlyRate = (annualReturnRate / 100) / 12;
        const months = years * 12;
        if (targetAmount <= 0) return 0;
        if (monthlyRate <= 0) return targetAmount / months;
        return (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    },

    adjustForInflation: (value, annualInflation, years) => {
        return value / Math.pow(1 + (annualInflation / 100), years);
    },

    formatIndian: (num) => {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
        if (num >= 100000) return (num / 100000).toFixed(2) + " L";
        return Math.round(num).toLocaleString('en-IN');
    }
};

/* Tax Calculation Module */
FinanceEngine.TaxEngine = {
    calculateExemptHRA: (basic, hraReceived, rentPaid, isMetro) => {
        const metroFactor = isMetro ? 0.5 : 0.4;
        const limit1 = hraReceived;
        const limit2 = basic * metroFactor;
        const limit3 = Math.max(0, (rentPaid * 12) - (basic * 0.1));
        const finalExemption = Math.min(limit1, limit2, limit3);
        return { actualExemption: finalExemption, maxPossibleExemption: Math.min(limit2, limit3), isLimitedByHRA: limit1 < Math.min(limit2, limit3) };
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
        perks = perks || [];
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.newRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;

        // HOME LOAN: New Regime only allows deduction for Let-out Property
        if ((deductions.occupancy === 'let-out' || deductions.occupancy === 'rented') && (deductions.homeLoanInterest > 0)) {
            totalExemptions += (deductions.homeLoanInterest || 0);
        }

        let perkBreakdown = [];
        perks.forEach(p => {
            let eligible = 0;
            const rule = perksConfig[p.type];
            if (rule && (rule.regime === "both" || rule.regime === "new" || !rule.regime)) {
                if (p.type === "Corporate NPS") {
                    eligible = Math.min(p.amount, basicSalary * (rule.newLimit || 0.14));
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
            tax = Math.min(slabTax, netTaxable - config.rebateLimit);
        }

        const cess = (yearData.cessRate !== undefined) ? yearData.cessRate : (TAX_CONFIG.cessRate || 0.04);
        const totalTax = tax + (tax * cess);

return {tax: totalTax, netTaxable, totalExemptions, perkBreakdown };
    },

    calculateOldRegime: (selectedYear, grossIncome, deductions, perks, basicSalary = 0) => {
        perks = perks || [];
        const yearData = TAX_CONFIG[selectedYear];
        const config = yearData.oldRegime;
        const perksConfig = yearData.perkRules;

        let totalExemptions = config.stdDeduction;
        let other80C = deductions.section80C || 0;

        perks.forEach(p => {
            const rule = perksConfig[p.type];
            if (rule && (rule.regime === "both" || rule.regime === "old" || !rule.regime)) {
                if (p.type === "Corporate NPS") {
                    totalExemptions += Math.min(p.amount, basicSalary * (rule.oldLimit || 0.10));
                } else if (p.type === "VPF") {
                    other80C += p.amount;
                } else {
                    totalExemptions += p.amount;
                }
            }
        });

        const cappedOther80C = Math.min(other80C, config.limits.section80C);
        const spaceLeftIn80C = Math.max(0, config.limits.section80C - cappedOther80C);
        const npsUsedIn80C = Math.min(deductions.npsSelf || 0, spaceLeftIn80C);
        const npsFor80CCD = Math.min((deductions.npsSelf || 0) - npsUsedIn80C, config.limits.section80CCD_1B);

        // --- HOME LOAN LOGIC ---
        let interest24b = 0;
        let interest80EEA = 0;
        const totalInterestPaid = deductions.homeLoanInterest || 0;

        if (deductions.occupancy === 'let-out' || deductions.occupancy === 'rented') {
            interest24b = totalInterestPaid; 
        } else {
            interest24b = Math.min(totalInterestPaid, config.limits.section24b || 200000);
            if (deductions.extraLoanInterest > 0) {
                interest80EEA = Math.min(deductions.extraLoanInterest, config.limits.section80EEA || 150000);
            }
        }
        
        // --- IMPROVED 80D LOGIC ---
        const selfLimit = config.limits.section80D_Self || 25000;
        const parentsLimit = deductions.parentsSenior 
            ? (config.limits.section80D_SeniorParents || 50000) 
            : (config.limits.section80D_Parents || 25000);
        
        const cappedSelf80D = Math.min(deductions.healthSelf || 0, selfLimit);
        const cappedParents80D = Math.min(deductions.healthParents || 0, parentsLimit);
        const totalCapped80D = cappedSelf80D + cappedParents80D;

        const totalDeductions = totalExemptions + cappedOther80C + npsUsedIn80C + npsFor80CCD + interest24b + interest80EEA + totalCapped80D + (deductions.exemptHRA || 0);

        const netTaxable = Math.max(0, grossIncome - totalDeductions);

        let tax = 0;
        if (netTaxable > config.rebateLimit) {
            tax = FinanceEngine.TaxEngine.calculateBaseSlabTax(netTaxable, config.slabs);
        }
           const cess = yearData.cessRate !== undefined ? yearData.cessRate : TAX_CONFIG.cessRate;
            const totalTax = tax + (tax * cess);
           
            return {
                tax: totalTax,
                netTaxable,
                totalDeductions,
                appliedDeductions: {
                    homeInterestSection24: interest24b,
                    homeInterest80EEA: interest80EEA,
                    section80C: cappedOther80C,
                    section80D: totalCapped80D
                }
            };    
    }
};
