---
layout: default
title: Construction-Linked Home Loan Calculator
permalink: /calculators/clhl/
---

# Construction-Linked Home Loan Calculator

<div id="clhl-calculator-container">
    </div>
    <div class="calculator-box">
    <h3>Loan Details</h3>
    <div class="input-grid">
        <input type="number" id="loanAmount" placeholder="Loan Amount">
        <input type="number" id="interestRate" placeholder="Interest Rate">
    </div>
    <h3>Transactions</h3>
    <table id="transactionTable" class="styled-table">
        <thead>
            <tr><th>Date</th><th>Type</th><th>Amount</th></tr>
        </thead>
        <tbody id="transactionBody">
            </tbody>
    </table>
    <button id="addRowBtn" class="btn-primary">+ Add Row</button>
    <div id="results">
        </div>
</div>

<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/clhl-calculator.js"></script>
