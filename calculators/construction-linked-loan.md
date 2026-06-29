---
layout: default
title: Home Loan Ledger
permalink: /calculators/clhl/
---

<div class="calculator-container" id="clhl-calculator">
    <div class="calc-inputs">
        <h3>Loan Parameters</h3>
        <div class="input-group">
            <div class="label-row">
                <label>Loan Amount (₹)</label>
                <input type="number" id="loanAmount" placeholder="3190000">
            </div>
            <div class="label-row">
                <label>Annual Interest (%)</label>
                <input type="number" id="interestRate" placeholder="7.5">
            </div>
            <div class="label-row">
                <label>EMI Date</label>
                <input type="date" id="emiDate">
            </div>
        </div>
        <h3>Transaction Ledger</h3>
        <table class="styled-table" id="transactionTable">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody id="transactionBody">
                </tbody>
        </table>
        <button id="addRowBtn" class="btn-secondary-outline" style="width: 100%; margin-top: 15px;">+ Add Transaction</button>
    </div>
    <div class="calc-results">
        <div class="input-header">Summary</div>
        <div id="summaryResults">
            <div class="result-item">
                <span>Closing Principal</span>
                <strong id="closingPrincipal">₹0</strong>
            </div>
            <div class="result-item">
                <span>Unpaid Interest</span>
                <strong id="unpaidInterest">₹0</strong>
            </div>
        </div>
    </div>
</div>

<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/clhl-calculator.js"></script>
