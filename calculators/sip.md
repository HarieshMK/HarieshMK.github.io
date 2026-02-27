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
        <input type="number" id="return-rate" value="10">
      </div>
      <input type="range" id="return-rate-slider" min="1" max="30" step="0.5" value="10" class="slider">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Time Period (Years)</label>
        <input type="number" id="years" value="10">
      </div>
      <input type="range" id="years-slider" min="1" max="40" step="1" value="10" class="slider">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Existing Corpus (Optional)</label>
        <input type="number" id="initial-lump-sum" value="0">
      </div>
      <input type="range" class="slider" id="lump-sum-slider" min="0" max="1000000" step="5000" value="0">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Expected Inflation (%) (Optional)</label>
        <input type="number" id="inflation-rate" value="6">
      </div>
      <input type="range" class="slider" id="inflation-slider" min="0" max="15" step="0.5" value="6">
    </div>

    <div class="input-group">
      <label>Start Date (Optional)</label>
      <input type="date" id="start-date">
      <small style="display: block; margin-top: 5px; color: #94a3b8;">Shows progress from start date until today.</small>
    </div>

    <div class="calc-disclaimer">
      <p><strong>Disclaimer:</strong> This calculator is for illustrative purposes only. Actual returns may vary based on market performance, taxation, and individual fund expenses.</p>
    </div>
  </div>

  <div class="calc-results">
    <div id="current-progress" style="display: none;">
      <h4 class="input-header">Investments as on today</h4>
      <div class="result-item">
        <span>Time Invested</span>
        <strong id="completed-tenure">0y 0m</strong>
      </div>
      <div class="result-item">
        <span>Estimated Amount Today</span>
        <strong id="value-today">₹0</strong>
      </div>
      <hr style="border: 0; border-top: 2px dashed #e2e8f0; margin: 15px 0;">
    </div>

    <h4 class="input-header">Future Expectation</h4>
    <div class="result-item">
      <span>Total Investment Planned</span>
      <strong id="total-invested">₹0</strong>
    </div>
    <div class="result-item">
      <span>Estimated Returns (Profit)</span>
      <strong id="total-returns">₹0</strong>
    </div>
    
    <div class="result-item highlight">
      <span>Expected Maturity amount</span>
      <strong id="total-value">₹0</strong>
    </div>

    <div class="result-item">
      <span>Inflation adjusted maturity amount</span>
      <strong id="real-future-value">₹0</strong>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/sip-calc.js' | relative_url }}"></script>
