---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div markdown="0">
<div class="calculator-container">
    <div class="calc-inputs">
        <div class="preset-group">
            <div class="label-row">
                <label>What are we planning for?</label>
            </div>
            <input type="text" id="goal-name" list="goal-options" placeholder="e.g. Dream House" class="full-width-input">
            <datalist id="goal-options">
                <option value="Dream House">
                <option value="New Car">
                <option value="Retirement Fund">
                <option value="Child's UG (India)">
                <option value="Foreign Vacation">
            </datalist>
        </div>

        <div class="input-group">
            <div class="label-row">
                <label>Current Cost Today</label>
                <span id="current-price-words" class="word-preview">₹0</span>
                <input type="number" id="current-price" value="1000000">
            </div>
            <input type="range" id="current-price-slider" class="slider" min="10000" max="100000000" step="10000" value="1000000">
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
            <input type="range" id="goal-inflation-slider" class="slider" min="1" max="20" value="6">
        </div>

        <div class="input-group">
            <div class="label-row">
                <label>Existing Savings for this Goal</label>
                <span id="existing-corpus-words" class="word-preview">₹0</span>
                <input type="number" id="existing-corpus" value="0">
            </div>
            <input type="range" id="existing-corpus-slider" class="slider" min="0" max="50000000" step="10000" value="0">
        </div>

        <div class="input-group">
            <div class="label-row">
                <label>Expected Returns (%)</label>
                <input type="number" id="goal-returns" value="12">
            </div>
            <input type="range" id="goal-returns-slider" class="slider" min="1" max="30" value="12">
        </div>
    </div>

    <div class="calc-results">
        <div class="input-header">Future Projection</div>
        
        <div class="result-item">
            <span>Future Cost of Goal</span>
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
            <p id="goal-nudge">Don't just look at the numbers, start BOSS!</p>
            <p style="font-size: 0.7rem; opacity: 0.7;">*Calculations assume monthly compounding and end-of-period investments.</p>
        </div>
    </div>
</div>
</div>

<script src="/assets/js/goal-planner.js?v={{ site.time | date: '%s' }}"></script>
