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
    <select id="goal-name" class="full-width-input">
        <option value="" disabled selected>Select a goal...</option>
        
        <optgroup label="Family & Life Events">
            <option value="Own Wedding">My Own Wedding 🤵</option>
            <option value="Siblings Wedding">Sibling's Wedding 🥂</option>
            <option value="Emergency Fund">Emergency Fund 🛡️</option>
            <option value="Jewelry Purchase">Jewelry Purchase ✨</option>
            <option value="Home Renovation">Home Renovation 🔨</option>
            <option value="Home Appliances">Home Appliances 📺</option>
        </optgroup>

        <optgroup label="Education">
            <option value="School Admission">Child's School Admission 🏫</option>
            <option value="Yearly School Fees">Child's Yearly School Fees 📚</option>
            <option value="Child UG India">Child's UG (India) 🎓</option>
            <option value="Child UG Foreign">Child's UG (Foreign) 🌍</option>
            <option value="Child PG India">Child's PG (India) 🏛️</option>
            <option value="Child PG Foreign">Child's PG (Foreign) ✈️</option>
            <option value="My Own PG">My Own PG/MBA 📖</option>
        </optgroup>

        <optgroup label="Assets & Business">
            <option value="Dream House">Dream House 🏰</option>
            <option value="House Downpayment">House Downpayment 💰</option>
            <option value="New Car">New Car 🚗</option>
            <option value="Car Downpayment">Car Downpayment 🏎️</option>
            <option value="Business Start">Starting a Business 💼</option>
            <option value="Retirement Fund">Retirement Fund 🏝️</option>
        </optgroup>

        <optgroup label="Recurring & Travel">
            <option value="Health Insurance">Health Insurance (Yearly) 🏥</option>
            <option value="Car Insurance">Car Insurance (Yearly) 🛡️</option>
            <option value="Local Vacation">Local Vacation 🏔️</option>
            <option value="Foreign Vacation">Foreign Vacation 🗽</option>
        </optgroup>
    </select>
</div>
        <div class="input-group">
            <label>Current Cost Today (₹)</label>
            <input type="number" id="current-price" value="500000">
            <input type="range" id="current-price-slider" class="slider" min="10000" max="10000000" step="5000" value="500000">
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
            <p id="goal-nudge">Select a goal to see your plan!</p>
        </div>
    </div>
</div>
</div>

<style>
    .calculator-container { display: flex; flex-wrap: wrap; gap: 40px; margin: 20px 0; }
    .calc-inputs { flex: 1.5; min-width: 300px; }
    .calc-results { flex: 1; min-width: 300px; background: #f0f7ff; padding: 25px; border-radius: 15px; }
    .input-group { margin-bottom: 22px; }
    .input-group label { display: block; font-weight: 600; margin-bottom: 8px; }
    .full-width-input, input[type="number"] { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .slider { width: 100%; margin-top: 12px; }
    .result-box { margin-bottom: 20px; }
    .result-box.highlight { background: #fff; padding: 15px; border-radius: 10px; border: 2px solid #3b82f6; }
    .nudge-container { margin-top: 20px; font-weight: 700; color: #1d4ed8; }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
