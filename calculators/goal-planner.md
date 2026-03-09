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
    /* Wrapper ensures the header and body align perfectly */
    .calculator-wrapper { max-width: 1050px; margin: 20px auto; font-family: 'Inter', sans-serif; padding: 20px; }

    /* Heading styling */
    .calc-header h1 { margin-bottom: 25px; color: #0f172a; }

    /* Main Flex body: Inputs and Results side by side */
    .calc-main-body { 
        display: flex; 
        flex-direction: row; 
        gap: 40px; 
        align-items: flex-start;
    }

    /* Column Sizing */
    .calc-inputs { flex: 1.4; display: flex; flex-direction: column; gap: 15px; }
    .calc-results { flex: 1; background: #f8fafc; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); position: sticky; top: 20px; }

    /* Inner styling remains identical to your previous working version */
    .input-row { display: flex; gap: 15px; width: 100%; }
    .flex-1 { flex: 1; }
    .input-group label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.85rem; color: #1e293b; }
    input[type="date"], .full-width-input, input[type="number"] { width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; }
    .result-box .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px; display: block; }
    .result-box h2 { font-size: 1.8rem; margin: 0; font-family: 'JetBrains Mono', monospace; color: #0f172a; }
    .highlight { background: #0ea5e9; padding: 25px; border-radius: 18px; color: white; text-align: center; }
    .highlight h2 { color: #ffffff !important; font-size: 2.2rem; }
    .highlight .label { color: rgba(255,255,255,0.9); }
    .countdown-box { background: #ffffff; padding: 15px; border-radius: 14px; border-left: 5px solid #0ea5e9; margin: 20px 0; }
    .countdown-box h3 { font-family: 'JetBrains Mono', monospace; margin: 2px 0; color: #0f172a; font-size: 1.2rem; }
    .download-button { width: 100%; background: #0f172a; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .slider { -webkit-appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; margin: 12px 0; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #0ea5e9; border-radius: 50%; border: 3px solid #fff; cursor: pointer; }

    @media (max-width: 850px) {
        .calc-main-body { flex-direction: column; }
        .calc-inputs, .calc-results { width: 100%; }
        .calc-results { position: static; }
    }
</style>
<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
