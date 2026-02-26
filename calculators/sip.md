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
      <small style="display: block; margin-top: 5px; color: #94a3b8;">Shows progress from start date until today.</small>
    </div>
  </div>

 <div class="calc-results">
  <div id="current-progress" style="display: none; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px dashed #e2e8f0;">
    <h4 class="input-header">Current Progress (Until Today)</h4>
    <div class="result-item">
      <span>Duration Completed</span>
      <strong id="completed-tenure">0y 0m</strong>
    </div>
    <div class="result-item">
      <span>Projected Value Today</span>
      <strong id="value-today" style="color: #0f172a;">₹0</strong>
    </div>
  </div>

  <h4 class="input-header">Future Projection (End of Tenure)</h4>
  <div class="result-item">
    <span>Total Invested</span>
    <strong id="total-invested">₹0</strong>
  </div>
  <div class="result-item">
    <span>Est. Wealth Gain</span>
    <strong id="total-returns">₹0</strong>
  </div>
  <div class="result-item highlight">
    <span>Target Portfolio Value</span>
    <strong id="total-value">₹0</strong>
  </div>
</div>

<script src="{{ '/assets/js/sip-calc.js' | relative_url }}"></script>
