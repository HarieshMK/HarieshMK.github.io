<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
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
      <div class="label-row">
        <label>Monthly Investment (₹)</label>
        <input type="number" id="monthly-sip" value="5000">
      </div>
      <input type="range" id="monthly-sip-slider" min="500" max="100000" step="500" value="5000" class="slider">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Expected Return Rate (% p.a)</label>
        <input type="number" id="return-rate" value="12">
      </div>
      <input type="range" id="return-rate-slider" min="1" max="30" step="0.5" value="12" class="slider">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Time Period (Years)</label>
        <input type="number" id="years" value="10">
      </div>
      <input type="range" id="years-slider" min="1" max="40" step="1" value="10" class="slider">
    </div>

    <div class="input-group">
      <label>Start Date (Optional)</label>
      <input type="date" id="start-date">
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
</div>

<script src="{{ '/assets/js/sip-calc.js' | relative_url }}"></script>
