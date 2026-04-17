const TAX_CONFIG = {
    // FY 2026-27: Current Year (Budget 2026)
    "2026-27": {
        newRegime: {
            stdDeduction: 75000,
            rebateLimit: 1200000, 
            maxRebate: 60000,
            slabs: [
                { limit: 400000, rate: 0.00 },
                { limit: 800000, rate: 0.05 },
                { limit: 1200000, rate: 0.10 },
                { limit: 1600000, rate: 0.15 },
                { limit: 2000000, rate: 0.20 },
                { limit: 2400000, rate: 0.25 },
                { limit: Infinity, rate: 0.30 }
            ]
        },
        oldRegime: {
            stdDeduction: 50000,
            rebateLimit: 500000,
            maxRebate: 12500,
            slabs: [
                { limit: 250000, rate: 0.00 },
                { limit: 500000, rate: 0.05 },
                { limit: 1000000, rate: 0.20 },
                { limit: Infinity, rate: 0.30 }
            ],
            limits: {
                section80C: 150000,
                section80CCD_1B: 50000,
                section24b: 200000,
                section80D_Self: 25000,
                section80D_Parents: 25000,
                section80D_SeniorParents: 50000
            }
        },
        perkRules: {
            "Meal Coupons": { govtLimit: 105600, regime: "both", label: "Meal Vouchers (New Govt Limit: ₹1.05L)" },
            "Corporate NPS": { oldLimit: 0.10, newLimit: 0.14 },
            "Professional Tax": { maxExempt: 2500 },
            "VPF": { regime: "old" },
            "LTA": { regime: "old" },
            "Mobile & Internet": { maxExempt: Infinity },
            "Fuel Allowances": { maxExempt: Infinity },
            "Books & Periodicals": { maxExempt: Infinity }
        }
    },
    
    // FY 2025-26: (Budget 2025)
    "2025-26": {
        newRegime: {
            stdDeduction: 75000,
            rebateLimit: 1200000, 
            maxRebate: 60000,
            slabs: [
                { limit: 400000, rate: 0.00 },
                { limit: 800000, rate: 0.05 },
                { limit: 1200000, rate: 0.10 },
                { limit: 1600000, rate: 0.15 },
                { limit: 2000000, rate: 0.20 },
                { limit: 2400000, rate: 0.25 },
                { limit: Infinity, rate: 0.30 }
            ]
        },
        oldRegime: {
            stdDeduction: 50000,
            rebateLimit: 500000,
            maxRebate: 12500,
            slabs: [
                { limit: 250000, rate: 0.00 },
                { limit: 500000, rate: 0.05 },
                { limit: 1000000, rate: 0.20 },
                { limit: Infinity, rate: 0.30 }
            ],
            limits: {
                section80C: 150000,
                section80CCD_1B: 50000,
                section24b: 200000,
                section80D_Self: 25000,
                section80D_Parents: 25000,
                section80D_SeniorParents: 50000
            }
        },
        perkRules: {
            "Meal Coupons": { govtLimit: 26400, regime: "old", label: "Meal Vouchers (Standard: ₹26,400)" },
            "Corporate NPS": { oldLimit: 0.10, newLimit: 0.14 },
            "Professional Tax": { maxExempt: 2500 },
            "VPF": { regime: "old" },
            "LTA": { regime: "old" },
            "Mobile & Internet": { maxExempt: Infinity },
            "Fuel Allowances": { maxExempt: Infinity },
            "Books & Periodicals": { maxExempt: Infinity }
        }
    },
    cessRate: 0.04
};
