---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<div markdown="0">
<div class="calculator-container" id="printable-area">
    <div class="print-only">
        <h1>Personal Goal Strategy Report</h1>
        <p>Generated on: <span id="print-date"></span></p>
    </div>

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
    /* 1. CORE LAYOUT & TYPOGRAPHY */
    .calculator-container { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 30px; 
        margin: 20px 0; 
        font-family: 'Inter', -apple-system, sans-serif; 
        color: #1e293b;
        -webkit-font-smoothing: antialiased;
    }

    .calc-inputs { flex: 1.2; min-width: 300px; }
    
    .calc-results { 
        flex: 1; 
        min-width: 300px; 
        background: #f8fafc; /* Matches .calc-results in your CSS */
        padding: 30px; 
        border-radius: 20px; 
        height: fit-content; 
        position: sticky; 
        top: 20px; 
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    /* 2. PREMIUM LABELS (Matching Section 15 of your style.css) */
    .input-group label { 
        display: block; 
        font-weight: 700; 
        margin-bottom: 10px; 
        font-size: 0.95rem; /* Matched to .label-row label */
        color: #1e293b; 
    }

    /* 3. INPUTS & JETBRAINS MONO FOR NUMBERS */
    input[type="date"], 
    .full-width-input { 
        width: 100%; 
        padding: 14px; 
        border: 2px solid #f1f5f9; 
        border-radius: 10px; 
        font-size: 1rem; 
        background: white; 
        box-sizing: border-box; 
        font-family: 'Inter', sans-serif;
    }

    input[type="number"] {
        width: 100%;
        padding: 12px;
        border: 2px solid #f1f5f9;
        border-radius: 10px;
        font-weight: 700;
        color: #0369a1; /* Blue color for numbers from your CSS */
        font-family: 'JetBrains Mono', monospace; /* The "Premium" Secret */
        background: #fff;
    }

    /* 4. RESULTS SECTION (Matching your .result-item.highlight) */
    .result-box .label { 
        font-size: 0.85rem; 
        color: #64748b; 
        text-transform: uppercase; 
        letter-spacing: 0.1em; 
        font-weight: 800; 
        display: block;
        margin-bottom: 8px;
    }

    .result-box h2 { 
        font-size: 2.2rem; 
        font-weight: 700; 
        margin: 5px 0; 
        color: #0f172a; 
        font-family: 'JetBrains Mono', monospace; /* Professional Number Look */
    }

    .highlight { 
        background: #0c4a6e !important; /* Matches .result-item.highlight in your CSS */
        padding: 25px; 
        border-radius: 15px; 
        color: white;
        text-align: center;
        margin: 20px 0;
    }
    .highlight h2 { color: #ffffff !important; font-size: 2.5rem; }
    .highlight .label { color: #bae6fd !important; }

    /* 5. SLIDERS (Matching Section 15 .slider) */
    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 10px;
        outline: none;
        margin: 15px 0;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 22px;
        height: 22px;
        background: #0ea5e9;
        border-radius: 50%;
        border: 3px solid #fff;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* 6. COUNTDOWN & NUDGE */
    .countdown-box {
        background: #ffffff;
        padding: 20px;
        border-radius: 12px;
        border-left: 5px solid #0ea5e9;
        margin-top: 20px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    
    .countdown-box h3 { font-family: 'JetBrains Mono', monospace; margin: 5px 0; color: #0f172a; font-size: 1.2rem; }

    .download-button { 
        width: 100%; 
        background: #0f172a; 
        color: white; 
        border: none; 
        padding: 16px; 
        border-radius: 12px; 
        font-weight: 700; 
        font-family: 'Inter', sans-serif;
        cursor: pointer; 
        margin-top: 15px; 
    }

    /* 7. DARK MODE (Integrated from your Section 7 & 15) */
    .dark-theme .calculator-container { background: #0f172a; border-color: #1e293b; }
    .dark-theme .calc-results { background: #1e293b; }
    .dark-theme .label-row label, .dark-theme .input-group label { color: #f1f5f9; }
    .dark-theme input[type="number"], .dark-theme input[type="date"], .dark-theme .full-width-input { 
        background: #020617; 
        border-color: #334155; 
        color: #38bdf8; 
    }
    .dark-theme .result-box h2, .dark-theme .countdown-box h3 { color: #ffffff !important; }
    .dark-theme .countdown-box { background: #0f172a; border-color: #38bdf8; }

    /* Print Logic */
    @media print {
        @page { size: A4; margin: 1cm; }
        body * { visibility: hidden; }
        #printable-area, #printable-area * { visibility: visible; }
        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .download-button, .slider { display: none !important; }
        .highlight { background: #f0f9ff !important; border: 2px solid #0c4a6e !important; color: #0c4a6e !important; }
        .highlight h2, .highlight .label { color: #0c4a6e !important; }
    }
</style>
<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
