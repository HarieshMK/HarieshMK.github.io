---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<div markdown="0">
<div class="calculator-container" id="printable-area">
    <div class="print-only">
        <h1>Smart Goal Planner</h1>
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
    /* 1. MASTER LAYOUT - STRICT SIDE-BY-SIDE */
    .calculator-container { 
        display: grid;
        grid-template-columns: 1.2fr 1fr; /* Strict 2-column split */
        gap: 35px; 
        margin: 20px 0; 
        font-family: 'Inter', -apple-system, sans-serif; 
        align-items: start;
    }

    /* 2. INPUTS COLUMN (LEFT) */
    .calc-inputs { 
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .input-row { 
        display: flex; 
        gap: 15px; 
        width: 100%;
    }
    
    .flex-1 { flex: 1; }

    .input-group label { 
        display: block; 
        font-weight: 700; 
        margin-bottom: 8px; 
        font-size: 0.85rem; 
        color: #1e293b; 
    }

    input[type="date"], .full-width-input, input[type="number"] { 
        width: 100%; 
        padding: 12px;
        border: 2px solid #f1f5f9; 
        border-radius: 10px; 
        font-family: 'JetBrains Mono', monospace;
        box-sizing: border-box;
        font-size: 0.95rem;
    }

    .timeline-hint { 
        font-size: 0.8rem; 
        color: #64748b; 
        margin: -5px 0 10px 0;
    }

    /* 3. RESULTS COLUMN (RIGHT) */
    .calc-results { 
        background: #f8fafc; 
        padding: 25px; 
        border-radius: 24px; 
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .result-box .label { 
        font-size: 0.75rem; 
        color: #64748b; 
        text-transform: uppercase; 
        letter-spacing: 0.08em; 
        font-weight: 800; 
        margin-bottom: 4px;
        display: block;
    }

    .result-box h2 { 
        font-size: 2rem; 
        margin: 0; 
        font-family: 'JetBrains Mono', monospace; 
        color: #0f172a;
    }

    /* VIBRANT SKY BLUE HIGHLIGHT */
    .highlight { 
        background: #0ea5e9 !important; 
        padding: 22px; 
        border-radius: 18px; 
        color: white !important;
        text-align: center;
    }
    .highlight h2 { color: #ffffff !important; font-size: 2.4rem; }
    .highlight .label { color: rgba(255,255,255,0.9) !important; }

    /* COMPACT GOAL COUNTDOWN */
    .countdown-box {
        background: #ffffff;
        padding: 15px;
        border-radius: 14px;
        border-left: 5px solid #0ea5e9;
    }
    
    .countdown-box h3 { 
        font-family: 'JetBrains Mono', monospace; 
        margin: 2px 0; 
        font-size: 1.15rem; 
    }

    .remaining-text, .journey-text { 
        font-size: 0.8rem; 
        margin: 2px 0 !important; 
        color: #64748b;
    }

    /* BUTTONS & NUDGE INSIDE BOX */
    #goal-nudge { 
        font-size: 0.9rem; 
        text-align: center; 
        font-weight: 600; 
        margin: 10px 0 0 0;
    }

    .download-button { 
        width: 100%; 
        background: #0f172a; 
        color: white; 
        border: none; 
        padding: 14px; 
        border-radius: 12px; 
        font-weight: 700; 
        cursor: pointer; 
        transition: transform 0.2s ease;
    }
    
    .download-button:hover { transform: translateY(-2px); background: #1e293b; }

    /* 4. DARK MODE FIXES */
    .dark-theme .calculator-container { color: #f1f5f9; }
    .dark-theme .calc-results { background: #1e293b; border-color: #334155; }
    .dark-theme .label-row label, .dark-theme .input-group label { color: #f1f5f9; }
    .dark-theme .result-box h2, .dark-theme .countdown-box h3 { color: #ffffff !important; }
    
    .dark-theme .countdown-box { background: #0f172a; }
    .dark-theme .remaining-text, .dark-theme .journey-text, .dark-theme .timeline-hint { color: #94a3b8 !important; }
    .dark-theme input { background: #020617; border-color: #334155; color: #38bdf8 !important; }

    /* 5. SLIDER STYLING */
    .slider { -webkit-appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; margin: 12px 0; outline: none; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #0ea5e9; border-radius: 50%; border: 3px solid #fff; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

    /* Mobile Responsive Toggle */
    @media (max-width: 850px) {
        .calculator-container { grid-template-columns: 1fr; }
        .calc-results { position: static; order: 2; } /* Forces results below on mobile */
        .calc-inputs { order: 1; }
    }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
