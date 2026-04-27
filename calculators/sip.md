---
layout: default
title: SIP Calculator
permalink: /calculators/sip/
---

# SIP Calculator
Estimate the wealth you can create through monthly Systematic Investment Plans.

<div class="segmented-control-wrapper">
  <div class="segmented-control">
    <button id="btn-monthly" class="toggle-btn active" onclick="setFrequency('monthly')">Monthly</button>
    <button id="btn-yearly" class="toggle-btn" onclick="setFrequency('yearly')">Yearly</button>
  </div>
</div>

<div class="calculator-container">
  <div class="calc-inputs">
    <div class="input-group">
      <div class="label-row">
        <label id="investment-label">Monthly Investment (₹)</label>
        <input type="number" id="monthly-sip" value="5000">
      </div>
      <input type="range" id="monthly-sip-slider" min="500" max="100000" step="500" value="5000" class="slider">
    </div>

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
      <input type="range" id="return-rate-slider" min="1" max="20" step="0.1" value="12" class="slider">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Time Period (Years)</label>
        <input type="number" id="years" value="15">
      </div>
      <input type="range" id="years-slider" min="1" max="40" step="0.1" value="15" class="slider">
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
      <input type="range" class="slider" id="inflation-slider" min="0" max="15" step="0.1" value="6">
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
        <span>Amount Today</span>
        <strong id="value-today">₹0</strong>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 4px; display: flex; gap: 10px;">
          <span>Invested: <b id="inv-today">₹0</b></span>
          <span>|</span>
          <span>Gain: <b id="gain-today">₹0</b></span>
        </div>
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
      <div style="display: flex; align-items: center; gap: 6px;">
        <span>Expected Maturity amount</span>
        <span style="cursor: help; color: #94a3b8; font-size: 0.9rem;" title="Calculated using CAGR method. The value may not be attractive, but closer to accurate.">
          <i class="fas fa-info-circle"></i>
        </span>
      </div>
      <strong id="total-value">₹0</strong>
    </div>

    <div class="result-item">
      <span>Inflation adjusted maturity amount</span>
      <strong id="real-future-value">₹0</strong>
    </div>

    <div id="future-message-container" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color, #e2e8f0);">
    <p id="future-message" style="font-size: 1rem; line-height: 1.6; margin: 0;"></p>
    </div>
  </div>
</div>
