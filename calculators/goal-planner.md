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
    /* 1. LAYOUT ENGINE - FORCES SIDE-BY-SIDE */
    .calculator-container { 
        display: grid;
        grid-template-columns: 1.2fr 1fr; /* Forces two columns */
        gap: 30px; 
        margin: 20px 0; 
        font-family: 'Inter', -apple-system, sans-serif; 
        color: #1e293b;
        -webkit-font-smoothing: antialiased;
        align-items: start;
    }

    .calc-inputs { width: 100%; }
    
    .calc-results { 
        background: #f8fafc; 
        padding: 25px; 
        border-radius: 20px; 
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        position: sticky;
        top: 20px;
    }

    /* 2. SIDE-BY-SIDE DATES (TIGHT) */
    .input-row { 
        display: flex; 
        gap: 12px; 
        margin-bottom: 10px; 
    }
    .flex-1 { flex: 1; }

    .input-group label { 
        display: block; 
        font-weight: 700; 
        margin-bottom: 6px; 
        font-size: 0.85rem; 
        color: #1e293b; 
    }

    input[type="date"], .full-width-input, input[type="number"] { 
        width: 100%; 
        padding: 10px;
        border: 2px solid #f1f5f9; 
        border-radius: 10px; 
        font-size: 0.95rem; 
        font-family: 'JetBrains Mono', monospace;
        box-sizing: border-box;
    }

    /* 3. PREMIUM RESULTS STYLING */
    .result-box { margin-bottom: 15px; }
    .result-box .label { 
        font-size: 0.7rem; 
        color: #64748b; 
        text-transform: uppercase; 
        letter-spacing: 0.05em; 
        font-weight: 800; 
        margin-bottom: 2px;
    }

    .result-box h2 { 
        font-size: 1.8rem; 
        margin: 0; 
        font-family: 'JetBrains Mono', monospace; 
        color: #0f172a;
    }

    /* Vibrant Blue Highlight with White Text */
    .highlight { 
        background: #0284c7 !important; 
        padding: 20px; 
        border-radius: 15px; 
        color: #ffffff !important;
        text-align: center;
    }
    .highlight h2 { color: #ffffff !important; font-size: 2.2rem; }
    .highlight .label { color: rgba(255,255,255,0.8) !important; }

    /* 4. COMPACT COUNTDOWN */
    .countdown-box {
        background: #ffffff;
        padding: 15px;
        border-radius: 12px;
        border-left: 4px solid #0284c7;
        margin-top: 10px;
    }
    .countdown-box h3 { 
        font-family: 'JetBrains Mono', monospace; 
        margin: 2px 0; 
        font-size: 1.1rem; 
        color: #0f172a;
    }
    .remaining-text, .journey-text, .timeline-hint { 
        font-size: 0.75rem; 
        margin: 1px 0 !important; 
        color: #64748b;
        line-height: 1.3;
    }

    /* 5. DARK MODE VISIBILITY FIXES */
    .dark-theme .calculator-container { color: #f1f5f9; }
    .dark-theme .calc-results { background: #1e293b; border-color: #334155; }
    .dark-theme .label-row label, .dark-theme .input-group label { color: #f1f5f9; }
    
    .dark-theme .timeline-hint, 
    .dark-theme .remaining-text, 
    .dark-theme .journey-text,
    .dark-theme .result-box .label { 
        color: #94a3b8 !important; 
    }

    .dark-theme .result-box h2 { color: #ffffff !important; }
    .dark-theme .countdown-box { background: #0f172a; border-color: #38bdf8; }
    .dark-theme .countdown-box h3 { color: #ffffff !important; }

    .dark-theme input { background: #020617; border-color: #334155; color: #38bdf8 !important; }

    /* Slider styling */
    .slider { width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; margin: 10px 0; }

    /* Mobile Responsive Toggle */
    @media (max-width: 850px) {
        .calculator-container { grid-template-columns: 1fr; }
        .calc-results { position: static; }
    }
</style>
<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
