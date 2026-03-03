---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div markdown="0">
<div class="calculator-container">
    <div class="calc-inputs">
        <div class="input-group">
            <label>Choose your Goal</label>
            <select id="goal-name" class="full-width">
                <option value="" disabled selected>Select a goal...</option>
                <option value="Dream House">Dream House 🏠</option>
                <option value="New Car">New Car 🚗</option>
                <option value="Child Education">Child Education 🎓</option>
                <option value="Foreign Vacation">Foreign Vacation ✈️</option>
                <option value="Retirement">Retirement Fund 🏝️</option>
            </select>
        </div>

        <div class="input-group">
            <label>Current Cost Today (₹)</label>
            <input type="number" id="current-price" value="500000">
            <input type="range" id="current-price-slider" class="slider" min="100000" max="10000000" step="50000" value="500000">
        </div>

        <div class="input-group">
            <label>Years to Goal</label>
            <input type="number" id="goal-years" value="5">
            <input type="range" id="goal-years-slider" class="slider" min="1" max="40" value="5">
        </div>

        <div class="input-group">
            <label>Expected Inflation (% p.a.)</label>
            <input type="number" id="goal-inflation" value="6">
            <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
        </div>

        <div class="input-group">
            <label>Expected Returns (% p.a.)</label>
            <input type="number" id="goal-returns" value="12">
            <input type="range" id="goal-returns-slider" class="slider" min="1" max="25" step="0.5" value="12">
        </div>
    </div>

    <div class="calc-results">
        <div class="result-box">
            <span>Future Cost (Inflation Adjusted)</span>
            <h2 id="future-cost">₹0</h2>
        </div>
        <div class="result-box highlight">
            <span>Required Monthly SIP</span>
            <h2 id="required-sip">₹0</h2>
        </div>
        <div class="nudge-container">
            <p id="goal-nudge">Select a goal to see your personalized plan!</p>
        </div>
    </div>
</div>
</div>

<style>
    .calculator-container { display: flex; flex-wrap: wrap; gap: 40px; margin: 20px 0; font-family: sans-serif; }
    .calc-inputs { flex: 1.5; min-width: 300px; }
    .calc-results { flex: 1; min-width: 300px; background: #f0f7ff; padding: 25px; border-radius: 15px; height: fit-content; }
    .input-group { margin-bottom: 22px; }
    .input-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #334155; }
    .full-width, input[type="number"] { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
    .slider { width: 100%; margin-top: 12px; cursor: pointer; }
    .result-box { margin-bottom: 20px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; }
    .result-box.highlight { background: #fff; padding: 15px; border-radius: 10px; border: 2px solid #3b82f6; }
    .result-box h2 { margin: 5px 0; color: #1e293b; }
    .nudge-container { margin-top: 20px; font-weight: 700; color: #1d4ed8; font-style: italic; }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
