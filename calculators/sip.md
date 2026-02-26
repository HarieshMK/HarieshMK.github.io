---
layout: default
title: SIP Calculator
permalink: /calculators/sip/
---

# SIP Calculator
Estimate the wealth you can create through monthly Systematic Investment Plans.

<div class="calculator-container">
  <div class="calc-inputs">
    <div class="input-group">
      <label>Monthly Investment (₹)</label>
      <input type="number" id="monthly-sip" value="5000" step="500">
    </div>

    <div class="input-group">
      <label>Expected Return Rate (% p.a)</label>
      <input type="number" id="return-rate" value="12" step="0.5">
    </div>

    <div class="input-group">
      <label>Time Period (Years)</label>
      <input type="number" id="years" value="10">
    </div>

    <div class="input-group">
      <label>Start Date (Optional)</label>
      <input type="date" id="start-date">
      <small style="display: block; margin-top: 5px; color: #94a3b8;">Overrides "Years" if selected.</small>
    </div>
  </div>

  <div class="calc-results">
    <div class="result-item">
      <span>Investment Duration</span>
      <strong id="display-tenure">10 Years</strong>
    </div>
    
    <div class="result-item">
      <span>Invested Amount</span>
      <strong id="total-invested">₹0</strong>
    </div>
    
    <div class="result-item">
      <span>Est. Returns</span>
      <strong id="total-returns">₹0</strong>
    </div>
    
    <div class="result-item highlight">
      <span>Total Value</span>
      <strong id="total-value">₹0</strong>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/sip-calc.js' | relative_url }}"></script>
