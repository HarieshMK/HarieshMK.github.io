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

    <div class="result-box nudge-container">
        <span class="label">The Boss Nudge</span>
        <p id="goal-nudge">Ready to be a BOSS? 🚀</p>
    </div>

    <div class="result-box disclaimer-box">
        <span class="label">Disclaimer</span>
        <p><strong>The Unexciting Reality:</strong> Markets move, inflation is a thief. This isn't professional advice—it's just math. Treat this guide like a map, but remember: you’re the one who has to do the driving.</p>
    </div>

    <button id="download-btn" class="download-button">
        Download Goal Plan 📥
    </button>
</div>
</div>
</div>

<style>
    /* 1. CONTAINER & LAYOUT */
    .calculator-wrapper { max-width: 1050px; margin: 0px auto; padding: 5px; font-family: 'Inter', sans-serif; }
    .calc-header h1 { margin-bottom: 15px; color: #0f172a; }
    .calc-main-body { display: flex; flex-direction: row; gap: 20px; align-items: flex-start; }
    .calc-inputs { flex: 1.4; display: flex; flex-direction: column; gap: 10px; }
    
    /* 2. PREMIUM RESULTS CARD (LIGHT MODE) */
    .calc-results { 
        flex: 1; background: #f8fafc; padding: 30px; border-radius: 24px; 
        border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); 
        position: sticky; top: 20px; 
    }
    .result-box { margin-bottom: 20px; }
    .result-box .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px; display: block; }
    .result-box h2 { font-size: 1.8rem; margin: 0; font-family: 'JetBrains Mono', monospace; color: #0f172a; }
    
    .highlight { background: #0ea5e9; padding: 25px; border-radius: 18px; color: white; text-align: center; }
    .highlight h2 { color: #ffffff !important; font-size: 2.2rem; }
    .highlight .label { color: rgba(255,255,255,0.9); }

    /* COUNTDOWN BOX (LIGHT MODE) */
    .countdown-box { background: #ffffff; padding: 15px; border-radius: 14px; border-left: 5px solid #0ea5e9; margin: 20px 0; }
    .countdown-box h3 { font-family: 'JetBrains Mono', monospace; margin: 2px 0; color: #0f172a; font-size: 1.2rem; }
    .remaining-text, .journey-text { font-size: 0.85rem; color: #475569; margin: 4px 0; font-weight: 500; }
    
    .download-button { width: 100%; background: #0f172a; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }

    /* 3. INPUT ELEMENTS */
    input[type="date"], .full-width-input, input[type="number"] { width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; }
    .slider { -webkit-appearance: none; width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; margin: 12px 0; outline: none; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #0ea5e9; border-radius: 50%; border: 3px solid #fff; cursor: pointer; }

   /* 4. DARK MODE OVERRIDES - UPDATED SELECTOR */
    .dark-theme { background-color: #0b1120 !important; color: #f1f5f9 !important; }
    .dark-theme .calc-header h1 { color: #ffffff !important; }
    .dark-theme .calc-results { background: #111827 !important; border-color: #1f2937 !important; }
    
    /* Targeting the countdown box */
    .dark-theme .countdown-box { background: #1f2937 !important; border-color: #0ea5e9 !important; }
    
    .dark-theme .countdown-box h3 { 
        color: #000000 !important; 
        background: #ffffff !important; 
        padding: 4px 8px !important; 
        border-radius: 6px !important; 
        display: inline-block !important; 
    }
    
    .dark-theme .remaining-text, 
    .dark-theme .journey-text { 
        color: #e2e8f0 !important; 
        font-weight: 600 !important; 
    }
    
    .dark-theme input[type="date"], 
    .dark-theme .full-width-input, 
    .dark-theme input[type="number"] { background: #0b1120 !important; border-color: #374151 !important; color: white !important; }

/* --- Disclaimer Box --- */
.calc-disclaimer {
  margin-top: 20px;
  padding: 20px;
  background: #fffbeb;
  border-radius: 14px;
  border-left: 5px solid #f59e0b;
}

.calc-disclaimer p { 
  font-size: 0.8rem; 
  color: #92400e; 
  margin: 0; /* Updated to 0 to match your snippet */
  line-height: 1.5; 
}

/* Dark Mode adjustment for the Amber style */
.dark-theme .calc-disclaimer {
  background: #453411 !important; /* Darker amber background */
  border-left-color: #f59e0b !important;
}

.dark-theme .calc-disclaimer p {
  color: #fcd34d !important; /* Lighter text for readability */
}
    /* 5. RESPONSIVE */
    @media (max-width: 850px) {
        .calc-main-body { flex-direction: column; }
        .calc-inputs, .calc-results { width: 100%; }
        .calc-results { position: static; }
    }
</style>

<script src="{{ '/assets/js/goal-planner.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
