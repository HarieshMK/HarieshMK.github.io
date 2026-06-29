---
layout: default
title: Home Loan Ledger
permalink: /calculators/clhl/
---

<div class="calculator-container">
    <details open class="calc-inputs">
        <summary><h3>Property Profile</h3></summary>
        <div class="input-grid">
            <div class="input-group">
                <div class="label-row"><label>Super Built-up Area (sq.ft)</label></div>
                <input type="number" id="superArea" placeholder="648">
            </div>
            <div class="input-group">
                <div class="label-row"><label>Price per sq.ft (₹)</label></div>
                <input type="number" id="pricePerSqft" placeholder="4859">
            </div>
            <div class="input-group">
                <div class="label-row"><label>Basic Cost (Auto)</label></div>
                <input type="number" id="basicCost" readonly style="background: var(--bg-offset);">
            </div>
        </div>
        <div id="extraChargesContainer"></div>
        <button id="addChargeBtn" class="btn-secondary-outline" style="margin-top: 15px;">+ Add Extra Charge</button>
        <div class="summary-results" style="margin-top: 20px; padding: 15px; background: var(--bg-offset);">
            <div class="result-item"><span>GST Amount:</span> <strong id="gstDisplay">₹0</strong></div>
            <div class="result-item"><span>Total Property Cost (incl. GST):</span> <strong id="totalPropertyCost">₹0</strong></div>
        </div>
    </details>
    <details open class="calc-inputs" style="margin-top: 20px;">
        <summary><h3>Loan Particulars</h3></summary>
        <div class="input-grid">
            <div class="input-group">
                <div class="label-row"><label>Loan Amount (₹)</label></div>
                <input type="number" id="loanAmount" placeholder="3190000">
            </div>
            <div class="input-group">
                <div class="label-row"><label>Interest Rate (%)</label></div>
                <input type="number" id="interestRate" placeholder="7.5">
            </div>
            <div class="input-group">
                <div class="label-row"><label>Tenure (Years)</label></div>
                <input type="number" id="tenureYears" placeholder="30">
            </div>
            <div class="input-group">
                <div class="label-row"><label>EMI Start Date</label></div>
                <input type="date" id="emiDate">
            </div>
        </div>
        <div class="summary-results" style="margin-top: 20px; padding: 15px; border-top: 1px solid var(--border-color);">
            <div class="result-item"><span>Closing Principal:</span> <strong id="closingPrincipal">₹0</strong></div>
            <div class="result-item"><span>Unpaid Interest:</span> <strong id="unpaidInterest">₹0</strong></div>
        </div>
    </details>
    <div class="calculator-container" style="margin-top: 20px;">
        <h3>Transaction Ledger</h3>
        <div class="table-wrapper">
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
        </div>
        <button id="addRowBtn" class="btn-secondary-outline" style="margin-top: 15px;">+ Add Transaction</button>
    </div>
</div>

<script src="/assets/js/finance-engine.js"></script>
<script src="/assets/js/clhl-calculator.js"></script>
