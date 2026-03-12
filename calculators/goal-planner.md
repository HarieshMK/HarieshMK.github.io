---
layout: default
title: Smart Goal Planner
permalink: /calculators/goal-planner/
---

<div class="calculator-container"> 
    <div class="calc-inputs" id="printable-area">
        <div class="input-header">Goal Details</div>
        
        <div class="input-group">
            <label>What are we planning for?</label>
            <select id="goal-name" class="full-width-input" style="width: 100%; padding: 10px; border-radius: 10px; border: 2px solid #f1f5f9; font-weight: 600;">
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

        <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div class="input-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 8px; font-weight: 700;">Start Date</label>
                <input type="date" id="start-date" style="width: 100%; padding: 8px; border-radius: 10px; border: 2px solid #f1f5f9;">
            </div>
            <div class="input-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 8px; font-weight: 700;">Target Date</label>
                <input type="date" id="target-date" style="width: 100%; padding: 8px; border-radius: 10px; border: 2px solid #f1f5f9;">
            </div>
        </div>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: -15px; margin-bottom: 20px;">Total Duration: <span id="years-val" style="font-weight: 700; color: #0ea5e9;">5.0</span> Years</p>

        <div class="input-group">
            <div class="label-row">
                <label>Current Cost Today (₹) <span id="current-price-readable" style="font-size: 0.8rem; color: #0ea5e9; margin-left: 5px;"></span></label>
                <input type="number" id="current-price" value="500000">
            </div>
            <input type="range" id="current-price-slider" class="slider" min="10000" max="10000000" step="5000" value="500000">
        </div>

        <div class="input-group">
            <div class="label-row">
                <label>Expected SIP Returns (% p.a.)</label>
                <input type="number" id="goal-returns" value="12" step="0.5">
            </div>
            <input type="range" id="goal-returns-slider" class="slider" min="1" max="25" step="0.5" value="12">
        </div>
        
        <div class="input-group">
            <div class="label-row">
                <label>Expected Inflation (% p.a.)</label>
                <input type="number" id="goal-inflation" value="6" step="0.5">
            </div>
            <input type="range" id="goal-inflation-slider" class="slider" min="1" max="15" step="0.5" value="6">
        </div>

        <div class="input-group">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600;">
                <input type="checkbox" id="has-corpus-check"> Do you have any money saved?
            </label>
        </div>

        <div id="corpus-section" style="display: none;">
            <div class="input-group">
                <div class="label-row">
                    <label>Current Savings (₹) <span id="existing-corpus-readable" style="font-size: 0.8rem; color: #0ea5e9; margin-left: 5px;"></span></label>
                    <input type="number" id="existing-corpus" value="0">
                </div>
                <input type="range" id="existing-corpus-slider" class="slider" min="0" max="10000000" step="5000" value="0">
            </div>
            
            <div class="input-group">
                <div class="label-row">
                    <label>Returns on Savings (%)</label>
                    <input type="number" id="corpus-returns" value="8">
                </div>
                <input type="range" id="corpus-returns-slider" class="slider" min="5" max="15" step="0.5" value="8">
            </div>
        </div>
    </div> 

    <div class="calc-results">
        <div class="input-header">Your Goal Plan</div>
        
        <div class="result-item">
            <span>Future Cost</span>
            <strong id="future-cost">₹0</strong>
        </div>
        
        <div class="result-item highlight">
            <span>Required Monthly SIP</span>
            <strong id="required-sip">₹0</strong>
        </div>

        <div class="result-item">
            <span>Goal Date</span>
            <strong id="deadline-date">--</strong>
            <p id="time-left" style="font-size: 0.8rem; color: #64748b; margin-top: 5px;"></p>
        </div>

        <div class="result-item">
            <span>The Reality Check</span>
            <p id="goal-nudge" style="text-align: center; font-size: 0.9rem; color: #475569; padding: 0 10px;">Ready to be a BOSS? 🚀</p>
        </div>

        <div class="calc-disclaimer">
            <p><strong>The Unexciting Reality:</strong> Markets move, inflation is a thief. This isn't professional advice—it's just math.</p>
        </div>

        <button id="download-btn" class="download-button" style="width: 100%; margin-top: 15px;">
            Download Goal Plan 📥
        </button>
    </div>
</div>
