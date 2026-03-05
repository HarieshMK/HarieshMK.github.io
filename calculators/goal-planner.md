---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div markdown="0">
<div class="calculator-container" id="printable-area">
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

        <div class="input-row">
            <div class="input-group flex-1">
                <label>Start Date</label>
                <input type="date" id="start-date">
            </div>
            <div class="input-group flex-1">
                <label>Target Date</label>
                <input type="date" id="target-date">
            </div>
        </div>
        <p class="timeline-hint">Total Duration: <span id="years-val">5</span> Years</p>

        <div class="input-group">
            <label>Current Cost Today (₹) <span id="current-price-text" class="human-readable"></span></label>
            <div class="input-with-box">
                <input type="number" id="current-price" value="500000">
                <input type="range" id="current-price-slider" class="slider" min="10000" max="10000000" step="5000" value="500000">
            </div>
        </div>

        <div class="input-group">
            <label>Expected SIP Returns (% p.a.)</label>
            <div class="input-with-box">
                <input type="number" id="goal-returns" value="12" step="0.5">
                <input type="range" id="goal-returns-slider" class="slider" min="1" max="25" step="0.5" value="12">
            </div>
        </div>

        <div class="input-group">
            <label>Current Savings for this Goal (₹) <span id="existing-corpus-text" class="human-readable"></span></label>
            <div class="input-with-box">
                <input type="number" id="existing-corpus" value="0">
                <input type="range" id="existing-corpus-slider" class="slider" min="0" max="5000000" step="5000" value="0">
            </div>
        </div>

        <div class="input-group">
            <label>Return on Existing Savings (% p.a.) <small id="risk-label"></small></label>
            <div class="input-with-box">
                <input type="number" id="corpus-returns" value="7" step="0.5">
                <input type="range" id="corpus-returns-slider" class="slider" min="1" max="20" step="0.5" value="7">
            </div>
        </div>

        <div class="input-group">
            <label>Expected Inflation (% p.a.)</label>
            <div class="input-with-box">
                <input type="number" id="goal-inflation" value="6" step="0.5">
                <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
            </div>
        </div>
    </div>

    <div class="calc-results">
        <div class="result-box">
            <span class="label">Future Cost</span>
            <h2 id="future-cost">₹0</h2>
        </div>
        
        <div class="result-box highlight">
            <span class="label">Required Monthly SIP</span>
            <h2 id="required-sip">₹0</h2>
        </div>

        <div class="result-box countdown-box">
            <span class="label">Goal Countdown</span>
            <h3 id="deadline-date">--</h3>
            <p id="time-left" class="remaining-text"></p>
            <p id="total-duration" class="journey-text"></p>
        </div>

        <div class="nudge-container">
            <p id="goal-nudge">Ready to be a BOSS? 🚀</p>
        </div>

        <button id="download-btn" class="download-button">
            Download Goal Plan 📥
        </button>
    </div>
</div>
</div>

<style>
    .calculator-container { display: flex; flex-wrap: wrap; gap: 30px; margin: 20px 0; font-family: 'Segoe UI', system-ui, sans-serif; }
    .calc-inputs { flex: 1.3; min-width: 300px; }
    .calc-results { flex: 1; min-width: 300px; background: #f8fafc; padding: 25px; border-radius: 15px; height: fit-content; position: sticky; top: 20px; border: 1px solid #e2e8f0; }
    .input-row { display: flex; gap: 15px; margin-bottom: 10px; }
    .flex-1 { flex: 1; }
    .input-group { margin-bottom: 20px; }
    .input-group label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; color: #334155; }
    .input-with-box { display: flex; flex-direction: column; gap: 8px; }
    .timeline-hint { font-size: 0.85rem; color: #64748b; margin-top: -10px; margin-bottom: 20px; font-weight: 600; }
    .human-readable { color: #2563eb; font-size: 0.85rem; margin-left: 5px; }
    input[type="date"], input[type="number"], .full-width-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
    .slider { width: 100%; cursor: pointer; accent-color: #2563eb; }
    
    .result-box { margin-bottom: 20px; }
    .result-box .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .result-box h2 { font-size: 2.2rem; margin: 5px 0; color: #0f172a; }
    .highlight { border: 2px solid #2563eb; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .highlight h2 { color: #2563eb; }
    
    .countdown-box { background: #eff6ff; padding: 15px; border-radius: 10px; border-left: 4px solid #2563eb; }
    .countdown-box h3 { margin: 5px 0; font-size: 1.1rem; color: #1e293b; }
    .remaining-text { margin: 0; font-size: 0.95rem; color: #2563eb; font-weight: bold; }
    .journey-text { margin: 5px 0 0 0; font-size: 0.75rem; color: #64748b; }

    .download-button { width: 100%; background: #0f172a; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
    .download-button:hover { background: #1e293b; }

    /* Print Specific Styles */
    @media print {
        .download-button, .slider, input[type="range"] { display: none !important; }
        .calc-inputs { flex: 1; }
        .calculator-container { display: block; }
        .calc-results { position: static; border: none; background: white; padding: 0; }
        .highlight { border: 1px solid #ccc; }
    }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
