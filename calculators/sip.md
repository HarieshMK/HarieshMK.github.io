---
layout: default
title: SIP Calculator
permalink: /calculators/sip/
---

<style>
  /* Calculator Layout Container */
  .calculator-container {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    background: #ffffff;
    padding: 40px;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    margin-top: 20px;
    align-items: start;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    width: 100%;
  }

  /* Input and Result Sections */
  .calc-inputs { flex: 1.2; min-width: 300px; }
  .calc-results {
    flex: 1;
    min-width: 300px;
    background: #f8fafc;
    padding: 25px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* Input Group Styling */
  .input-group { margin-bottom: 25px; }
  .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; width: 100%; }
  .label-row label { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
  .label-row input[type="number"] {
    width: 120px; padding: 8px 12px; border: 2px solid #f1f5f9; border-radius: 10px;
    font-weight: 700; color: #0369a1; font-family: 'JetBrains Mono', monospace; background: #fff;
  }

  /* Sliders */
  .slider { -webkit-appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; outline: none; }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 22px; height: 22px; background: #0ea5e9;
    border-radius: 50%; border: 3px solid #fff; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* Result Item Styling */
  .input-header { font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
  .result-item { display: flex; flex-direction: column; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(226, 232, 240, 0.5); }
  .result-item span { color: #64748b; font-size: 0.85rem; margin-bottom: 5px; }
  .result-item strong { font-size: 1.5rem; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
  .result-item.highlight { background: #0c4a6e; padding: 20px; border-radius: 15px; margin: 15px 0; border: none; }
  .result-item.highlight span { color: #bae6fd; }
  .result-item.highlight strong { color: #ffffff !important; font-size: 2rem; }

  /* Disclaimer */
  .calc-disclaimer { margin-top: 20px; padding: 20px; background: #fffbeb; border-radius: 14px; border-left: 5px solid #f59e0b; }
  .calc-disclaimer p { font-size: 0.8rem; color: #92400e; margin-bottom: 10px; line-height: 1.5; }

  /* Dark Mode Overrides */
  .dark-theme .calculator-container { background: #0f172a; border-color: #1e293b; }
  .dark-theme .calc-results { background: #1e293b; }
  .dark-theme .label-row label { color: #f1f5f9; }
  .dark-theme .label-row input[type="number"] { background: #020617; border-color: #334155; color: #38bdf8; }
  .dark-theme .result-item strong { color: #ffffff !important; }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .calculator-container { grid-template-columns: 1fr !important; padding: 20px 15px !important; }
    .label-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    .label-row input[type="number"] { width: 100% !important; }
  }
</style>

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
