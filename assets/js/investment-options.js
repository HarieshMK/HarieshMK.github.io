window.InvestmentRegistry = {
    // --- GROWTH INVESTMENTS (isInvestment: true) ---
    "Bank savings account": { liquidity: "Very high", type: "Debt", returns: 2.5, taxCategory: "80TTA", taxTreatment: "SLAB_RATE", isInvestment: true },
    "RD": { liquidity: "Very high", type: "Debt", returns: 6.0, taxCategory: "NONE", taxTreatment: "SLAB_RATE", isInvestment: true },
    "FD": { liquidity: "Very high", type: "Debt", returns: 6.5, taxCategory: "NONE", taxTreatment: "SLAB_RATE", isInvestment: true },
    "5-Year Tax FD": { liquidity: "Low", type: "Debt", returns: 7.0, taxCategory: "80C", taxTreatment: "SLAB_RATE", isInvestment: true },
    "LIC plan": { liquidity: "Very low", type: "Debt", returns: 5.0, taxCategory: "80C", taxTreatment: "EXEMPT", isInvestment: true }, // Usually exempt under 10(10D)
    "PPF": { liquidity: "Very low", type: "Debt", returns: 7.1, taxCategory: "80C", taxTreatment: "EXEMPT", isInvestment: true },
    "SSY": { liquidity: "Very low", type: "Debt", returns: 8.1, taxCategory: "80C", taxTreatment: "EXEMPT", isInvestment: true },
    "NSC": { liquidity: "Very low", type: "Debt", returns: 7.7, taxCategory: "80C", taxTreatment: "SLAB_RATE", isInvestment: true },
    "KVP": { liquidity: "Very low", type: "Debt", returns: 7.5, taxCategory: "NONE", taxTreatment: "SLAB_RATE", isInvestment: true },
    "EPF": { liquidity: "Very low", type: "Debt", returns: 8.15, taxCategory: "80C", taxTreatment: "EXEMPT", isInvestment: true },
    "VPF": { liquidity: "Very low", type: "Debt", returns: 8.15, taxCategory: "80C", taxTreatment: "EXEMPT", isInvestment: true },
    "EPS": { liquidity: "Very low", type: "Debt", returns: 0.0, taxCategory: "NONE", taxTreatment: "EXEMPT", isInvestment: true },
    "Liquid fund": { liquidity: "Very high", type: "Debt", returns: 6.0, taxCategory: "NONE", taxTreatment: "SLAB_RATE", isInvestment: true },
    "Arbitrage fund": { liquidity: "High", type: "Debt", returns: 6.5, taxCategory: "NONE", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "Gold plan": { liquidity: "Low", type: "Gold", returns: 6.5, taxCategory: "NONE", taxTreatment: "SLAB_RATE", isInvestment: true }, // SGB is exempt if held to maturity, but physical/MF/ETF follows slab/debt rules
    "Nifty 50": { liquidity: "High", type: "Equity", returns: 10.0, taxCategory: "NONE", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "Smallcap 250": { liquidity: "High", type: "Equity", returns: 13.5, taxCategory: "NONE", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "Flexi cap": { liquidity: "High", type: "Equity", returns: 12.0, taxCategory: "NONE", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "ELSS": { liquidity: "Low", type: "Equity", returns: 12.0, taxCategory: "80C", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "Shares": { liquidity: "High", type: "Equity", returns: 12.0, taxCategory: "NONE", taxTreatment: "EQUITY_CAP_GAINS", isInvestment: true },
    "NPS": { liquidity: "Very low", type: "Hybrid", returns: 9.0, taxCategory: "80CCD", taxTreatment: "EXEMPT", isInvestment: true }, // 60% is exempt on maturity
    "Crypto": { liquidity: "Very high", type: "Crypto", returns: 18.0, taxCategory: "NONE", taxTreatment: "CRYPTO_TAX", isInvestment: true },

    // --- TAX SAVING DEDUCTIONS/EXPENSES (isInvestment: false) ---
    // These remain focused on the Deduction side (taxCategory)
    "Home Loan Principal": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80C", taxTreatment: "NONE", isInvestment: false },
    "Home Loan Interest": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "24B", taxTreatment: "NONE", isInvestment: false },
    "Pre-EMI Interest": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "24B_PRE", taxTreatment: "NONE", isInvestment: false },
    "Health Insurance (Self)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_SELF", taxTreatment: "NONE", isInvestment: false },
    "Health Insurance (Parents < 60)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_PARENTS", taxTreatment: "NONE", isInvestment: false },
    "Health Insurance (Parents Senior)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_SENIOR", taxTreatment: "NONE", isInvestment: false },
    "Children Tuition Fees": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80C", taxTreatment: "NONE", isInvestment: false },
    "Standard Deduction": { liquidity: "Very high", type: "Debt", returns: 0.0, taxCategory: "STD", taxTreatment: "NONE", isInvestment: false }
};
