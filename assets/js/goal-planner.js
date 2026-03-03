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
            <label>
                Current Cost Today (₹) 
                <span id="current-price-text" class="human-readable"></span>
            </label>
            <input type="number" id="current-price" value="500000">
            <input type="range" id="current-price-slider" class="slider" min="10000" max="100000000" step="5000" value="500000">
        </div>

        <div class="input-group">
            <label>Years to Goal: <span class="val-display" id="years-val">5</span> Years</label>
            <input type="range" id="goal-years-slider" class="slider" min="1" max="40" value="5">
            <input type="hidden" id="goal-years" value="5">
        </div>

        <div class="input-group">
            <label>Expected Inflation: <span class="val-display" id="infl-val">6</span>% p.a.</label>
            <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
            <input type="hidden" id="goal-inflation" value="6">
        </div>

        <div class="input-group">
            <label>Expected Returns: <span class="val-display" id="ret-val">12</span>% p.a.</label>
            <input type="range" id="goal-returns-slider" class="slider" min="1" max="25" step="0.5" value="12">
            <input type="hidden" id="goal-returns" value="12">
        </div>
    </div>

    <div class="calc-results">
        <div class="result-box">
            <span class="label">Future Cost (Inflation Adjusted)</span>
            <h2 id="future-cost" class="value">₹0</h2>
        </div>
        <div class="result-box highlight">
            <span class="label">Required Monthly SIP</span>
            <h2 id="required-sip" class="value">₹0</h2>
        </div>
        <div class="nudge-container">
            <p id="goal-nudge">Select a goal to start your BOSS plan! 🚀</p>
        </div>
    </div>
</div>
</div>

<style>
    .calculator-container { display: flex; flex-wrap: wrap; gap: 30px; margin: 20px 0; font-family: 'Inter', sans-serif; color: #1e293b; }
    .calc-inputs { flex: 1.4; min-width: 300px; }
    .calc-results { flex: 1; min-width: 300px; background: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; height: fit-content; position: sticky; top: 20px; }
    .input-group { margin-bottom: 25px; }
    .input-group label { display: block; font-weight: 600; margin-bottom: 10px; font-size: 0.95rem; }
    .human-readable { color: #3b82f6; margin-left: 8px; font-size: 0.9rem; }
    .full-width-input, input[type="number"] { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 1rem; outline: none; transition: border 0.2s; }
    .full-width-input:focus { border-color: #3b82f6; }
    .slider { width: 100%; height: 6px; background: #e2e8f0; border-radius: 5px; outline: none; margin-top: 15px; -webkit-appearance: none; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; cursor: pointer; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .result-box { margin-bottom: 25px; }
    .result-box .label { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .result-box .value { font-size: 1.8rem; margin: 5px 0; color: #0f172a; font-weight: 800; }
    .result-box.highlight { background: #eff6ff; padding: 20px; border-radius: 15px; border: 2px solid #3b82f6; }
    .result-box.highlight .value { color: #2563eb; }
    .nudge-container { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-weight: 600; color: #1e40af; font-style: italic; line-height: 1.4; }
    .val-display { color: #3b82f6; }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
