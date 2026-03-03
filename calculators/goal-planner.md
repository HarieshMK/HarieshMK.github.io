---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

# 🎯 Smart Goal Planner
*Tell us what your dream costs today. We’ll calculate exactly what you need to save from today to own it tomorrow.*

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
    <span id="current-price-words" class="word-preview">₹0</span>
    <input type="number" id="current-price" value="500000">
  </div>
  <input type="range" id="current-price-slider" class="slider" min="10000" max="100000000" step="10000" value="500000">
</div>

  <div class="input-group">
      <div class="label-row">
        <label>Years to Goal</label>
        <input type="number" id="goal-years" value="5">
      </div>
      <input type="range" id="goal-years-slider" class="slider" min="1" max="40" value="5">
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
    <span id="existing-corpus-words" class="word-preview">₹0</span>
    <input type="number" id="existing-corpus" value="10000">
  </div>
  <input type="range" id="existing-corpus-slider" class="slider" min="0" max="10000000" step="5000" value="10000">
</div>

   <div class="input-group">
      <div class="label-row">
        <label>Expected Returns (%)</label>
        <input type="number" id="goal-returns" value="10">
      </div>
      <input type="range" id="goal-returns-slider" class="slider" min="1" max="30" step="0.5" value="10">
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
  <p><strong>The Bottom Line:</strong> This is the monthly amount you need to invest starting <em>right now</em> to reach your goal on time.</p>
  
  <p style="margin-top: 10px; font-weight: 800; color: #b45309;">
    Don’t just look at the numbers, start BOSS! The longer you wait, the bigger this number gets. :P
  </p>

  <hr style="margin: 15px 0; border: 0; border-top: 1px dashed rgba(146, 64, 14, 0.3);">

  <p style="font-size: 0.7rem; opacity: 0.8; font-style: italic;">
    <strong>Disclaimer:</strong> Markets are moody and inflation is a thief. These numbers are projections, so consider this as a guide not a GOD.
  </p>
</div>
  </div>
</div>

<div class="back-to-blogs-container">
  <a href="/calculators/" class="back-link">← Back to All Calculators</a>
</div>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}"></script>
