---
layout: default
title: Home Loan Ledger
permalink: /calculators/clhl/
---

<div class="calculator-container">
    <details open class="calc-inputs" style="width: 100%; margin-bottom: 20px;">
        <summary><h3>Property Profile</h3></summary>
        <div class="input-grid">
            <div class="input-group">
                <label>Super Built-up Area (sq.ft)</label>
                <input type="number" id="superArea" placeholder="648">
            </div>
            <div class="input-group">
                <label>Price per sq.ft (₹)</label>
                <input type="number" id="pricePerSqft" placeholder="4859">
            </div>
            <div class="input-group">
                <label>Basic Cost (Auto)</label>
                <input type="number" id="basicCost" readonly style="background: var(--bg-offset);">
            </div>
        </div>
        <div id="extraChargesContainer">
            </div>
        <button id="addChargeBtn" class="btn-secondary-outline">+ Add Extra Charge</button>
    </details>
    <details open class="calc-inputs" style="width: 100%;">
        <summary><h3>Loan Particulars</h3></summary>
        <div class="input-grid">
            <div class="input-group">
                <label>Loan Amount (₹)</label>
                <input type="number" id="loanAmount" placeholder="3190000">
            </div>
            <div class="input-group">
                <label>Interest Rate (%)</label>
                <input type="number" id="interestRate" placeholder="7.5">
            </div>
            <div class="input-group">
                <label>Tenure (Years)</label>
                <input type="number" id="tenureYears" placeholder="30">
            </div>
            <div class="input-group">
                <label>EMI Start Date</label>
                <input type="date" id="emiDate">
            </div>
        </div>
    </details>
</div>

<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/clhl-calculator.js"></script>
