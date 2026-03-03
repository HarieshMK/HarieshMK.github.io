---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

# 🎯 Smart Goal Planner

*Estimate the future cost of your dreams and calculate the monthly savings needed to get there.*

<div markdown="0">
<div class="calculator-container">
    <div class="calc-inputs">
        
        <div class="input-group">
            <label>What are you planning for?</label>
            <input type="text" id="goal-name" list="goal-presets" placeholder="e.g., New Car">
            <datalist id="goal-presets">
                <option value="Dream House">
                <option value="New Car">
                <option value="Retirement Fund">
                <option value="Child's Education">
                <option value="Foreign Vacation">
            </datalist>
        </div>

        <div class="input-group">
            <label>Current Cost Today (₹)</label>
            <input type="number" id="current-price" value="500000">
            <input type="range" id="current-price-slider" min="10000" max="10000000" step="10000" value="500000">
        </div>

        <div class="input-group">
            <label>Years to Goal</label>
            <input type="number" id="goal-years" value="5">
            <input type="range" id="goal-years-slider" min="1" max="40" value="5">
        </div>

        <div class="input-group">
            <label>Expected Inflation (% p.a.)</label>
            <input type="number" id="goal-inflation" value="6">
            <input type="range" id="goal-inflation-slider" min="1" max="15" step="0.5" value="6">
        </div>

        <div class="input-group">
            <label>Existing Savings (₹)</label>
            <input type="number" id="existing-corpus" value="0">
            <input type="range" id="existing-corpus-slider" min="0" max="5000000" step="5000" value="0">
        </div>

        <div class="input-group">
            <label>Expected Investment Returns (% p.a.)</label>
            <input type="number" id="goal-returns" value="12">
            <input type="range" id="goal-returns-slider" min="1" max="25" step="0.5" value="12">
        </div>

    </div>

    <div class="calc-results">
        <div class="result-card">
            <span class="result-label">Future Cost of Goal</span>
            <div class="result-value" id="future-cost">₹0</div>
        </div>

        <div class="result-card">
            <span class="result-label">Savings Gap</span>
            <div class="result-value" id="corpus-gap">₹0</div>
        </div>

        <div class="result-card highlight">
            <span class="result-label">Required Monthly SIP</span>
            <div class="result-value" id="required-sip">₹0</div>
        </div>

        <div class="nudge-box">
            <p id="goal-nudge">The best time to start was yesterday. The second best time is today!</p>
        </div>
    </div>
</div>
</div>

<style>
/* Minimal structural CSS to ensure it displays correctly immediately */
.calculator-container { display: flex; flex-wrap: wrap; gap: 30px; margin-top: 20px; }
.calc-inputs { flex: 1; min-width: 300px; }
.calc-results { flex: 1; min-width: 300px; background: #f8fafc; padding: 20px; border-radius: 12px; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-weight: bold; margin-bottom: 8px; }
.input-group input[type="number"], .input-group input[type="text"] { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.slider { width: 100%; margin-top: 10px; cursor: pointer; }
.result-card { margin-bottom: 15px; padding: 15px; border-bottom: 1px solid #e2e8f0; }
.result-card.highlight { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; }
.result-label { font-size: 0.9rem; color: #64748b; }
.result-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
