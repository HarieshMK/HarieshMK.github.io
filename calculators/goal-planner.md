---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

# 🎯 Smart Goal Planner
*Plan for the future cost of your dreams, not today's price.*

<div class="calculator-container">
  <div class="calc-inputs">
    
    <div class="input-group">
      <div class="label-row">
        <label>Goal Name</label>
        <input type="text" id="goal-name" placeholder="e.g. New Home" style="width: 100%; padding: 10px; border: 2px solid #f1f5f9; border-radius: 10px; font-weight: 600;">
      </div>
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Current Price (Today)</label>
        <input type="number" id="current-price" value="5000000">
      </div>
      <input type="range" id="current-price-slider" class="slider" min="100000" max="100000000" step="100000" value="5000000">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Years to Goal</label>
        <input type="number" id="goal-years" value="10">
      </div>
      <input type="range" id="goal-years-slider" class="slider" min="1" max="40" value="10">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Expected Inflation (%)</label>
        <input type="number" id="goal-inflation" value="6">
      </div>
      <input type="range" id="goal-inflation-slider" class="slider" min="0" max="15" step="0.5" value="6">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Existing Corpus (Savings)</label>
        <input type="number" id="existing-corpus" value="500000">
      </div>
      <input type="range" id="existing-corpus-slider" class="slider" min="0" max="10000000" step="50000" value="500000">
    </div>

    <div class="input-group">
      <div class="label-row">
        <label>Expected Returns (%)</label>
        <input type="number" id="goal-returns" value="12">
      </div>
      <input type="range" id="goal-returns-slider" class="slider" min="1" max="30" step="0.5" value="12">
    </div>

  </div>

  <div class="calc-results">
    <div class="input-header">Goal Breakdown</div>
    
    <div class="result-item">
      <span>Future Cost (Adjusted)</span>
      <strong id="future-cost">₹0</strong>
    </div>

    <div class="result-item">
      <span>Corpus Gap</span>
      <strong id="corpus-gap">₹0</strong>
    </div>

    <div class="result-item highlight">
      <span>Required Monthly SIP</span>
      <strong id="required-sip">₹0</strong>
    </div>

    <div class="calc-disclaimer">
      <p><strong>Note:</strong> This calculates the SIP required to bridge the gap between your future goal cost and your current savings (growing at the same return rate).</p>
    </div>
  </div>
</div>

<div class="back-to-blogs-container">
  <a href="/calculators/" class="back-link">← Back to All Calculators</a>
</div>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}"></script>
