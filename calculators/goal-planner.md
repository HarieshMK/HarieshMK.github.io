---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div class="calculator-container"> 
    <div class="calc-header">
        <h1>Smart Goal Planner</h1>
    </div>

    <div class="calc-main-body" id="printable-area">
        <div class="calc-inputs">
            <div class="input-group">
                <label>What are we planning for?</label>
                <select id="goal-name" class="full-width-input">
                    <option value="Custom Plan">Custom Plan (Start from scratch) 🎯</option>
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
                <label>Current Cost Today (₹)</label>
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
                <label>Expected Inflation (% p.a.)</label>
                <div class="input-with-box">
                    <input type="number" id="goal-inflation" value="6" step="0.5">
                    <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
                </div>
            </div>

            <label style="margin-bottom: 15px; display: block;">
                <input type="checkbox" id="has-corpus-check"> Do you have any money saved for this goal?
            </label>

            <div id="corpus-section" style="display: none;">
                <div class="input-group">
                    <label>Current Savings for this Goal (₹)</label>
                    <div class="input-with-box">
                        <input type="number" id="existing-corpus" value="0">
                        <input type="range" id="existing-corpus-slider" class="slider" min="0" max="5000000" step="5000" value="0">
                    </div>
                </div>
                
                <div class="input-group">
                    <label>Return on Existing Savings (% p.a.)</label>
                    <div class="input-with-box">
                        <input type="number" id="corpus-returns" value="8">
                        <input type="range" id="corpus-returns-slider" class="slider" min="5" max="15" step="0.5" value="8">
                    </div>
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

            <div class="result-box calc-disclaimer">
                <span class="label">Disclaimer</span>
                <p><strong>The Unexciting Reality:</strong> Markets move, inflation is a thief. This isn't professional advice—it's just math.</p>
            </div>

            <button id="download-btn" class="download-button">
                Download Goal Plan 📥
            </button>
        </div>
    </div>
</div>
