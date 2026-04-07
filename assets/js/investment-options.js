// assets/js/investment-options.js
const InvestmentRegistry = {
    // --- GROWTH INVESTMENTS (isInvestment: true) ---
    "Bank savings account": { liquidity: "Very high", type: "Debt", returns: 2.5, taxCategory: "80TTA", isInvestment: true },
    "RD": { liquidity: "Very high", type: "Debt", returns: 6.0, taxCategory: "NONE", isInvestment: true },
    "FD": { liquidity: "Very high", type: "Debt", returns: 6.5, taxCategory: "NONE", isInvestment: true },
    "5-Year Tax FD": { liquidity: "Low", type: "Debt", returns: 7.0, taxCategory: "80C", isInvestment: true },
    "LIC plan": { liquidity: "Very low", type: "Debt", returns: 5.0, taxCategory: "80C", isInvestment: true },
    "PPF": { liquidity: "Very low", type: "Debt", returns: 7.1, taxCategory: "80C", isInvestment: true },
    "SSY": { liquidity: "Very low", type: "Debt", returns: 8.1, taxCategory: "80C", isInvestment: true },
    "NSC": { liquidity: "Very low", type: "Debt", returns: 7.7, taxCategory: "80C", isInvestment: true },
    "KVP": { liquidity: "Very low", type: "Debt", returns: 7.5, taxCategory: "NONE", isInvestment: true },
    "EPF": { liquidity: "Very low", type: "Debt", returns: 8.15, taxCategory: "80C", isInvestment: true },
    "VPF": { liquidity: "Very low", type: "Debt", returns: 8.15, taxCategory: "80C", isInvestment: true },
    "EPS": { liquidity: "Very low", type: "Debt", returns: 0.0, taxCategory: "NONE", isInvestment: true },
    "Liquid fund": { liquidity: "Very high", type: "Debt", returns: 6.0, taxCategory: "NONE", isInvestment: true },
    "Arbitrage fund": { liquidity: "High", type: "Debt", returns: 6.5, taxCategory: "NONE", isInvestment: true },
    "Gold plan": { liquidity: "Low", type: "Gold", returns: 6.5, taxCategory: "NONE", isInvestment: true },
    "Nifty 50": { liquidity: "High", type: "Equity", returns: 10.0, taxCategory: "NONE", isInvestment: true },
    "Smallcap 250": { liquidity: "High", type: "Equity", returns: 13.5, taxCategory: "NONE", isInvestment: true },
    "Flexi cap": { liquidity: "High", type: "Equity", returns: 12.0, taxCategory: "NONE", isInvestment: true },
    "ELSS": { liquidity: "Low", type: "Equity", returns: 12.0, taxCategory: "80C", isInvestment: true },
    "Shares": { liquidity: "High", type: "Equity", returns: 12.0, taxCategory: "NONE", isInvestment: true },
    "NPS": { liquidity: "Very low", type: "Hybrid", returns: 9.0, taxCategory: "80CCD", isInvestment: true },
    "Crypto": { liquidity: "Very high", type: "Crypto", returns: 18.0, taxCategory: "NONE", isInvestment: true },

    // --- TAX SAVING DEDUCTIONS/EXPENSES (isInvestment: false) ---
    "Home Loan Principal": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80C", isInvestment: false },
    "Home Loan Interest": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "24B", isInvestment: false },
    "Pre-EMI Interest": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "24B_PRE", isInvestment: false },
    "Health Insurance (Self)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_SELF", isInvestment: false },
    "Health Insurance (Parents < 60)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_PARENTS", isInvestment: false },
    "Health Insurance (Parents Senior)": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80D_SENIOR", isInvestment: false },
    "Children Tuition Fees": { liquidity: "None", type: "Debt", returns: 0.0, taxCategory: "80C", isInvestment: false },
    "Standard Deduction": { liquidity: "Very high", type: "Debt", returns: 0.0, taxCategory: "STD", isInvestment: false }
};
