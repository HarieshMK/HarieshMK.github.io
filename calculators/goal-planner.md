---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">

<div markdown="0" class="calculator-wrapper">
    <div class="calc-header">
        <h1>Smart Goal Planner</h1>
    </div>

    <div class="calc-main-body" id="printable-area">
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
    /* 1. MASTER LAYOUT */
    body { background-color: #0b1120; color: #f1f5f9; }
    .calculator-wrapper { max-width: 1050px; margin: 20px auto; font-family: 'Inter', sans-serif; padding: 20px; }
    .calc-header { margin-bottom: 30px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
    .calc-header h1 { color: #ffffff; margin: 0; }

    /* 2. FLEX CONTAINER */
    .calc-main-body { display: flex; flex-direction: row; gap: 40px; align-items: flex-start; }

    /* 3. COLUMNS - Refined for Dark Mode */
    .calc-inputs { flex: 1.4; display: flex; flex-direction: column; gap: 20px; }
    .calc-results { 
        flex: 1; 
        background: #111827; /* Darker card background */
        padding: 30px; 
        border-radius: 20px; 
        border: 1px solid #1f2937; 
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        position: sticky; 
        top: 20px; 
    }

    /* 4. FORM ELEMENTS - High readability */
    .input-group label { color: #94a3b8; font-weight: 500; margin-bottom: 8px; font-size: 0.85rem; display: block; }
    input[type="date"], .full-width-input, input[type="number"] { 
        width: 100%; padding: 12px; background: #0b1120; 
        border: 1px solid #374151; border-radius: 10px; 
        color: #ffffff; font-family: 'JetBrains Mono', monospace; 
    }

    /* 5. RESULTS UI - Matching your reference */
    .result-box .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 800; }
    .result-box h2 { font-size: 1.8rem; margin: 5px 0 20px 0; font-family: 'JetBrains Mono', monospace; color: #ffffff; }
    .highlight { background: #0ea5e9; padding: 25px; border-radius: 14px; text-align: center; }
    .highlight h2 { color: #ffffff !important; font-size: 2.2rem; margin: 0; }
    .countdown-box { background: #1f2937; padding: 15px; border-radius: 14px; margin-top: 20px; }
    .download-button { width: 100%; background: #ffffff; color: #0f172a; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 20px; }

    /* 6. SLIDER & RESPONSIVE */
    .slider { -webkit-appearance: none; width: 100%; height: 4px; background: #374151; border-radius: 2px; margin: 15px 0; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #0ea5e9; border-radius: 50%; cursor: pointer; }
    
    @media (max-width: 850px) {
        .calc-main-body { flex-direction: column; }
        .calc-inputs, .calc-results { width: 100%; }
        .calc-results { position: static; }
    }
</style>
<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
