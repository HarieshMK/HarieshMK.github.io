---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div markdown="0">
  <div class="calculator-container">
    <div class="calc-inputs">
      
      <div class="input-group">
        <label>What are we planning for?</label>
        <input type="text" id="goal-name" list="goal-presets" placeholder="Select a goal...">
        <datalist id="goal-presets">
          <option value="Dream House">
          <option value="New Car">
          <option value="Retirement Fund">
        </datalist>
      </div>

      <div class="input-group">
        <label>Current Price (Today)</label>
        <input type="number" id="current-price" value="500000">
        <input type="range" id="current-price-slider" min="10000" max="10000000" step="10000" value="500000">
      </div>

      <div class="input-group">
        <label>Years to Goal</label>
        <input type="number" id="goal-years" value="5">
        <input type="range" id="goal-years-slider" min="1" max="40" value="5">
      </div>

      <div class="input-group">
        <label>Expected Inflation (%)</label>
        <input type="number" id="goal-inflation" value="6">
        <input type="range" id="goal-inflation-slider" min="1" max="15" step="0.5" value="6">
      </div>

      <div class="input-group">
        <label>Existing Savings</label>
        <input type="number" id="existing-corpus" value="0">
        <input type="range" id="existing-corpus-slider" min="0" max="5000000" step="5000" value="0">
      </div>

      <div class="input-group">
        <label>Expected Returns (%)</label>
        <input type="number" id="goal-returns" value="12">
        <input type="range" id="goal-returns-slider" min="1" max="25" step="0.5" value="12">
      </div>
    </div>

    <div class="calc-results">
      <div class="result-item">Future Cost: <strong id="future-cost">₹0</strong></div>
      <div class="result-item">Corpus Gap: <strong id="corpus-gap">₹0</strong></div>
      <div class="result-item highlight">Monthly SIP: <strong id="required-sip">₹0</strong></div>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
