const TAX_CONFIG = {
    currentFY: "2026-27",
    
    // NEW REGIME (Default)
    newRegime: {
        stdDeduction: 75000,
        rebateLimit: 1200000, // Income up to 12L is tax-free via 87A rebate
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

            // Updated section for tax-config.js
        oldRegime: {
            stdDeduction: 50000,
            rebateLimit: 500000,
            maxRebate: 12500, // Fixed: was 125000
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
    
    // Add this inside TAX_CONFIG
        perkRules: {
            "Meal Coupons": { maxExempt: 105600, label: "Max ₹200/meal per day" },
            "Corporate NPS": { 
                oldLimit: 0.10, // 10% of Basic
                newLimit: 0.14, // 14% of Basic
                label: "Employer NPS (80CCD 2)" 
            },
            "VPF": { regime: "old", label: "Voluntary PF (part of 80C)" },
            "Mobile & Internet": { maxExempt: Infinity, label: "Actual Bill Reimbursement" },
            "LTA": { regime: "old", label: "Leave Travel Allowance" },
            "Books & Periodicals": { maxExempt: Infinity, label: "Actual Bill Reimbursement" },
            "Professional Tax": { maxExempt: 2500, label: "Standard State PT" }
        },

    cessRate: 0.04 // 4% Health & Education Cess
};
