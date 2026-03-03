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
                <optgroup label="Travel & Recurring">
                    <option value="Health Insurance">Health Insurance (Yearly) 🏥</option>
                    <option value="Car Insurance">Car Insurance (Yearly) 🚗</option>
                    <option value="Local Vacation">Local Vacation 🏔️</option>
                    <option value="Foreign Vacation">Foreign Vacation 🗽</option>
                </optgroup>
            </select>
        </div>

        <div class="input-group">
            <label>Current Cost Today (₹) <span id="current-price-text" class="human-readable"></span></label>
            <input type="number" id="current-price" value="500000">
            <input type="range" id="current-price-slider" class="slider" min="10000" max="10000000" step="5000" value="500000">
        </div>

        <div class="input-group">
            <label>Years to Goal: <span id="years-val">5</span></label>
            <input type="range" id="goal-years-slider" class="slider" min="1" max="40" value="5">
        </div>

        <div class="input-group">
            <label>Inflation (% p.a.): <span id="infl-val">6</span>%</label>
            <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
        </div>

        <div class="input-group">
            <label>Expected Returns (% p.a.): <span id="ret-val">12</span>%</label>
            <input type="range" id="goal-returns-slider" class="slider" min="1" max="25" step="0.5" value="12">
        </div>
    </div>
    <div class="input-group">
    <label>Current Savings for this Goal (₹) <span id="existing-corpus-text" class="human-readable"></span></label>
    <input type="number" id="existing-corpus" value="0">
    <input type="range" id="existing-corpus-slider" class="slider" min="0" max="5000000" step="5000" value="0">
    
    </div>
    <div class="input-group">
    <label>Return on Existing Savings: <span id="corpus-ret-val">7</span>% p.a.</label>
    <input type="range" id="corpus-returns-slider" class="slider" min="1" max="20" step="0.5" value="7">
    </div>

    <div class="calc-results">
        <div class="result-box">
            <span class="label">Future Cost (Inflation Adjusted)</span>
            <h2 id="future-cost">₹0</h2>
        </div>
        <div class="result-box highlight">
            <span class="label">Required Monthly SIP</span>
            <h2 id="required-sip">₹0</h2>
        </div>
        <div class="nudge-container">
            <p id="goal-nudge">Select a goal to start! 🚀</p>
        </div>
    </div>
</div>
</div>

<style>
    .calculator-container { display: flex; flex-wrap: wrap; gap: 30px; margin: 20px 0; font-family: sans-serif; }
    .calc-inputs { flex: 1.2; min-width: 300px; }
    .calc-results { flex: 1; min-width: 300px; background: #f1f5f9; padding: 25px; border-radius: 15px; height: fit-content; }
    .input-group { margin-bottom: 20px; }
    .input-group label { display: block; font-weight: bold; margin-bottom: 8px; }
    .human-readable { color: #2563eb; margin-left: 5px; }
    .full-width-input, input[type="number"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
    .slider { width: 100%; margin-top: 10px; cursor: pointer; }
    .result-box { margin-bottom: 20px; }
    .result-box .label { font-size: 0.9rem; color: #64748b; }
    .result-box h2 { margin: 5px 0; color: #1e293b; }
    .highlight { border: 2px solid #2563eb; background: #fff; padding: 15px; border-radius: 10px; }
    .highlight h2 { color: #2563eb; }
    .nudge-container { margin-top: 15px; font-weight: bold; color: #1e40af; }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
