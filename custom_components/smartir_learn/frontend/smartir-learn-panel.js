/**
 * SmartIR Learn Panel — HA Web Component
 * HA sets `element.hass` whenever state updates, giving us direct access
 * to callService(), connection.subscribeEvents(), and states[] — no auth token needed.
 */
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────────────────────
const _CSS = `
:host { display: block; min-height: 100vh; background: #111827; color: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; }
* { box-sizing: border-box; margin: 0; padding: 0; }

header { background: #1f2937; border-bottom: 1px solid #374151; padding: 0 24px;
  height: 56px; display: flex; align-items: center; }
.header-inner { width: 100%; display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 18px; font-weight: 700; }
.ha-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9ca3af; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #9ca3af; }
.dot.ok { background: #10b981; }

.steps-bar { display: flex; align-items: center; justify-content: center; padding: 20px 24px;
  background: #1f2937; border-bottom: 1px solid #374151; }
.step { display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: .4; transition: opacity .3s; }
.step.active, .step.done { opacity: 1; }
.step-num { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #374151;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
  background: #374151; transition: background .3s, border-color .3s; }
.step.active .step-num { background: #3b82f6; border-color: #3b82f6; }
.step.done  .step-num { background: #10b981; border-color: #10b981; }
.step-label { font-size: 11px; color: #9ca3af; white-space: nowrap; }
.step.active .step-label { color: #f9fafb; }
.step-line { flex: 1; height: 2px; background: #374151; min-width: 40px; max-width: 80px; }

.step-content { display: none; padding: 24px; max-width: 1100px; margin: 0 auto; }
.step-content.active { display: block; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
h3 { font-size: 15px; font-weight: 600; margin-bottom: 16px; color: #9ca3af; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-bottom: 24px; }
.card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; }
.card-hint { font-size: 12px; color: #9ca3af; margin-bottom: 16px; margin-top: -8px; }

label { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;
  font-size: 13px; color: #9ca3af; }
label:last-child { margin-bottom: 0; }
.label-title { font-size: 14px; font-weight: 600; color: #f9fafb; }
.label-sub { font-size: 12px; color: #9ca3af; margin-top: -4px; }

input[type=text], input[type=number], select {
  background: #374151; border: 1px solid #374151; border-radius: 6px;
  color: #f9fafb; padding: 9px 12px; font-size: 13px; outline: none;
  transition: border-color .2s; width: 100%; }
input:focus, select:focus { border-color: #3b82f6; }

.checkbox-grid { display: flex; flex-direction: column; gap: 10px; }
.checkbox-label { display: flex; flex-direction: row; align-items: center; gap: 10px;
  font-size: 14px; color: #f9fafb; cursor: pointer; }
.checkbox-label input[type=checkbox] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px;
  font-weight: 600; cursor: pointer; transition: background .2s, opacity .2s; }
.btn.primary { background: #3b82f6; color: #fff; }
.btn.primary:hover { background: #2563eb; }
.btn.ghost { background: #374151; color: #f9fafb; border: 1px solid #374151; }
.btn.ghost:hover { background: #4b5563; }
.btn.large { padding: 14px 28px; font-size: 16px; }
.btn.small { padding: 6px 14px; font-size: 12px; }
.btn.full-width { width: 100%; }
.btn:disabled { opacity: .4; cursor: not-allowed; }

.step-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px;
  border-top: 1px solid #374151; margin-top: 24px; }
.hint { color: #9ca3af; margin-bottom: 20px; font-size: 13px; }

/* Loading */
.loading-overlay { display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px; gap: 16px; color: #9ca3af; }
.spinner { width: 40px; height: 40px; border: 4px solid #374151; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Entity Picker */
.entity-picker { position: relative; width: 100%; }
.ep-wrap { position: relative; }
.ep-selected { display: flex; align-items: center; gap: 8px; background: #374151;
  border: 1px solid #374151; border-radius: 6px; padding: 9px 12px; cursor: pointer;
  user-select: none; transition: border-color .2s; min-height: 40px; }
.ep-selected:hover, .ep-selected:focus { border-color: #3b82f6; outline: none; }
.ep-selected-icon { font-size: 16px; flex-shrink: 0; }
.ep-selected-label { flex: 1; font-size: 13px; color: #f9fafb; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; }
.ep-clear { color: #9ca3af; font-size: 14px; padding: 0 4px; flex-shrink: 0; cursor: pointer; }
.ep-clear:hover { color: #ef4444; }
.ep-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #1f2937; border: 1px solid #3b82f6; border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,.5); z-index: 100; overflow: hidden; }
.ep-search { width: 100%; background: #374151; border: none; border-bottom: 1px solid #374151;
  border-radius: 0; padding: 10px 14px; font-size: 13px; color: #f9fafb; outline: none; }
.ep-search::placeholder { color: #9ca3af; }
.ep-list { max-height: 260px; overflow-y: auto; }
.ep-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer;
  border-bottom: 1px solid #374151; transition: background .1s; }
.ep-item:last-child { border-bottom: none; }
.ep-item:hover { background: #374151; }
.ep-item-icon { font-size: 16px; flex-shrink: 0; }
.ep-item-body { flex: 1; overflow: hidden; }
.ep-item-name { display: block; font-size: 13px; color: #f9fafb; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; }
.ep-item-id { display: block; font-size: 11px; color: #9ca3af; font-family: monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-item-domain { font-size: 10px; color: #3b82f6; background: rgba(59,130,246,.1);
  border-radius: 4px; padding: 2px 6px; flex-shrink: 0; text-transform: uppercase; }
.ep-no-results { padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; }

/* Step 2 */
.learn-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; margin-bottom: 24px; }
.learn-sidebar { display: flex; flex-direction: column; gap: 16px; }
.progress-box { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 16px; }
.progress-label { font-size: 13px; color: #9ca3af; margin-bottom: 10px; }
.progress-label span { color: #f9fafb; font-weight: 700; }
.progress-bar-wrap { background: #374151; border-radius: 99px; height: 8px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 99px; width: 0%;
  transition: width .4s; }
.queue-list { background: #1f2937; border: 1px solid #374151; border-radius: 12px;
  overflow: auto; max-height: 480px; }
.queue-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-bottom: 1px solid #374151; cursor: pointer; transition: background .15s; font-size: 12px; }
.queue-item:last-child { border-bottom: none; }
.queue-item:hover { background: #374151; }
.queue-item.current { background: rgba(59,130,246,.15); border-left: 3px solid #3b82f6; }
.queue-item.done { opacity: .5; }
.queue-item.skipped { opacity: .35; }
.queue-icon { font-size: 14px; flex-shrink: 0; }
.queue-label { flex: 1; }
.queue-status { font-size: 16px; }

.current-command-box { background: #1f2937; border: 1px solid #374151; border-radius: 12px;
  padding: 28px; text-align: center; }
.command-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.learn-instructions { color: #9ca3af; margin: 16px 0; font-size: 14px; white-space: pre-line; }
.learn-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
.learn-waiting, .learn-success { padding: 20px; }
.success-icon { font-size: 48px; margin-bottom: 12px; }

/* AC Remote widget */
.ac-remote { display: inline-flex; flex-direction: column; align-items: center; gap: 8px;
  background: #1a1a2e; border-radius: 16px; padding: 20px 24px; min-width: 220px;
  border: 2px solid #374151; margin: 12px auto; }
.remote-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.remote-chip { background: #2d2d44; border-radius: 99px; padding: 6px 14px; font-size: 12px;
  font-weight: 600; border: 1px solid #374151; white-space: nowrap; }
.remote-chip.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.remote-chip.power-on  { background: #10b981; border-color: #10b981; color: #fff; }
.remote-chip.power-off { background: #ef4444; border-color: #ef4444; color: #fff; }
.remote-temp-display { font-size: 36px; font-weight: 800; color: #f9fafb; padding: 4px 0; }
.remote-divider { width: 100%; height: 1px; background: #374151; margin: 4px 0; }

/* Step 3 */
.test-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; margin-bottom: 24px; }
.ac-remote-full { background: #1a1a2e; border-radius: 20px; border: 2px solid #374151;
  padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
.remote-section { display: flex; flex-direction: column; gap: 10px; }
.remote-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }
.remote-btn { background: #2d2d44; border: 1px solid #374151; border-radius: 6px;
  color: #f9fafb; padding: 8px 14px; font-size: 13px; cursor: pointer; transition: background .15s; }
.remote-btn:hover { background: #3d3d5c; }
.remote-btn.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.power-btn { width: 100%; padding: 12px; background: #ef4444; border: none; border-color: #ef4444;
  color: #fff; font-size: 15px; font-weight: 700; border-radius: 6px; cursor: pointer; }
.power-btn:hover { opacity: .85; }
.temp-display { display: flex; align-items: center; gap: 12px; justify-content: center; }
.temp-btn { width: 40px; height: 40px; font-size: 18px; display: flex;
  align-items: center; justify-content: center; border-radius: 50%; }
.temp-value { font-size: 28px; font-weight: 800; min-width: 80px; text-align: center; }
.test-log-wrap { display: flex; flex-direction: column; gap: 12px; }
.test-log { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 16px;
  font-family: monospace; font-size: 12px; min-height: 200px; max-height: 400px;
  overflow-y: auto; }
.log-entry { padding: 4px 0; border-bottom: 1px solid #374151; color: #9ca3af; }
.log-entry .ts { color: #3b82f6; margin-right: 8px; }
.log-entry.ok .msg { color: #10b981; }
.log-entry.err .msg { color: #ef4444; }

/* Step 4 */
.export-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.export-summary { font-size: 14px; line-height: 1.8; color: #9ca3af; margin-bottom: 24px; }
.export-summary strong { color: #f9fafb; }
.export-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.json-preview { background: #374151; border-radius: 6px; padding: 16px; font-size: 11px;
  overflow: auto; max-height: 500px; color: #9ca3af; white-space: pre-wrap; word-break: break-all; }

@media (max-width: 768px) {
  .learn-layout, .test-layout, .export-layout { grid-template-columns: 1fr; }
  .card-grid { grid-template-columns: 1fr; }
  .step-label { display: none; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  HTML template
// ─────────────────────────────────────────────────────────────────────────────
const _HTML = `
<header>
  <div class="header-inner">
    <span class="logo">📡 SmartIR Learn</span>
    <div class="ha-status"><span class="dot ok"></span><span>Connected to HA</span></div>
  </div>
</header>

<div class="steps-bar">
  <div class="step active" data-step="1"><span class="step-num">1</span><span class="step-label">Configure</span></div>
  <div class="step-line"></div>
  <div class="step" data-step="2"><span class="step-num">2</span><span class="step-label">Learn Codes</span></div>
  <div class="step-line"></div>
  <div class="step" data-step="3"><span class="step-num">3</span><span class="step-label">Test</span></div>
  <div class="step-line"></div>
  <div class="step" data-step="4"><span class="step-num">4</span><span class="step-label">Export</span></div>
</div>

<!-- STEP 1 -->
<section id="step1" class="step-content active">
  <h2>Step 1 — Configure your IR blaster &amp; AC</h2>
  <div id="entitiesLoading" class="loading-overlay">
    <div class="spinner"></div><p>Loading entities from Home Assistant…</p>
  </div>
  <div class="card-grid" id="step1Cards" style="display:none">
    <div class="card">
      <h3>IR Blaster Entities</h3>
      <p class="card-hint">Select the entities exposed by your IR blaster (e.g. via Zigbee2MQTT).</p>
      <label>
        <span class="label-title">🔴 Learn trigger</span>
        <span class="label-sub">button / text / switch entity that starts IR learning mode</span>
        <div class="entity-picker" id="pickerLearnTrigger" data-placeholder="Search for learn trigger entity…" data-domains="button,text,switch"></div>
      </label>
      <label>
        <span class="label-title">📥 Learned code output</span>
        <span class="label-sub">sensor / text entity whose state becomes the captured IR code</span>
        <div class="entity-picker" id="pickerLearnedCode" data-placeholder="Search for learned code entity…" data-domains="sensor,text"></div>
      </label>
      <label>
        <span class="label-title">📤 Send IR code</span>
        <span class="label-sub">text entity — set its value to transmit an IR code</span>
        <div class="entity-picker" id="pickerSendCode" data-placeholder="Search for send code entity…" data-domains="text"></div>
      </label>
    </div>
    <div class="card">
      <h3>Device Info</h3>
      <label>Manufacturer<input type="text" id="manufacturer" placeholder="e.g. Tornado" /></label>
      <label>Model<input type="text" id="model" placeholder="e.g. Super Inverter" /></label>
      <label>Min Temperature (°C)<input type="number" id="minTemp" value="16" min="10" max="30" /></label>
      <label>Max Temperature (°C)<input type="number" id="maxTemp" value="30" min="16" max="40" /></label>
      <label>Precision
        <select id="precision"><option value="1">1°C</option><option value="0.5">0.5°C</option></select>
      </label>
    </div>
    <div class="card">
      <h3>Operation Modes</h3>
      <div class="checkbox-grid" id="operationModes">
        <label class="checkbox-label"><input type="checkbox" value="cool" checked /> ❄️ Cool</label>
        <label class="checkbox-label"><input type="checkbox" value="heat" /> 🔥 Heat</label>
        <label class="checkbox-label"><input type="checkbox" value="heat_cool" /> 🔄 Heat/Cool</label>
        <label class="checkbox-label"><input type="checkbox" value="dry" /> 💧 Dry</label>
        <label class="checkbox-label"><input type="checkbox" value="fan_only" /> 🌀 Fan Only</label>
      </div>
    </div>
    <div class="card">
      <h3>Fan Modes</h3>
      <div class="checkbox-grid" id="fanModes">
        <label class="checkbox-label"><input type="checkbox" value="low" checked /> 🐢 Low</label>
        <label class="checkbox-label"><input type="checkbox" value="mid" checked /> 🚶 Mid</label>
        <label class="checkbox-label"><input type="checkbox" value="high" checked /> 🚀 High</label>
        <label class="checkbox-label"><input type="checkbox" value="auto" /> 🔃 Auto</label>
        <label class="checkbox-label"><input type="checkbox" value="turbo" /> ⚡ Turbo</label>
      </div>
    </div>
  </div>
  <div class="step-actions" id="step1Actions" style="display:none">
    <button class="btn primary" id="step1Next">Next: Learn Codes →</button>
  </div>
</section>

<!-- STEP 2 -->
<section id="step2" class="step-content">
  <h2>Step 2 — Learn IR Codes</h2>
  <div class="learn-layout">
    <div class="learn-sidebar">
      <div class="progress-box">
        <div class="progress-label"><span id="progressCount">0</span> / <span id="progressTotal">0</span> codes learned</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" id="progressBar"></div></div>
      </div>
      <div class="queue-list" id="queueList"></div>
    </div>
    <div class="learn-main">
      <div class="current-command-box">
        <div class="command-title" id="commandTitle">Ready</div>
        <div class="ac-remote" id="acRemoteLearn"></div>
        <div class="learn-instructions" id="learnInstructions">Select a command from the list to begin.</div>
        <div class="learn-actions" id="learnActions" style="display:none">
          <button class="btn primary large" id="btnLearn">📡 Learn this code</button>
          <button class="btn ghost" id="btnSkip">Skip</button>
          <button class="btn ghost" id="btnRedo" style="display:none">Re-learn</button>
        </div>
        <div class="learn-waiting" id="learnWaiting" style="display:none">
          <div class="spinner"></div>
          <p>Point your remote at the IR blaster and press the button…</p>
          <button class="btn ghost small" id="btnCancelLearn">Cancel</button>
        </div>
        <div class="learn-success" id="learnSuccess" style="display:none">
          <div class="success-icon">✅</div>
          <p id="learnSuccessMsg">Code captured!</p>
          <button class="btn ghost" id="btnTest" style="display:none">▶ Test</button>
          <button class="btn ghost small" id="btnLearnAgain">Re-learn</button>
          <button class="btn primary" id="btnNextCommand">Next →</button>
        </div>
      </div>
    </div>
  </div>
  <div class="step-actions">
    <button class="btn ghost" id="step2Back">← Back</button>
    <button class="btn primary" id="step2Next">Next: Test →</button>
  </div>
</section>

<!-- STEP 3 -->
<section id="step3" class="step-content">
  <h2>Step 3 — Test your remote</h2>
  <p class="hint">Click any button, then verify your AC unit responds.</p>
  <div class="test-layout">
    <div class="ac-remote-full">
      <div class="remote-section"><button class="power-btn" id="testPowerOff">⏻ OFF</button></div>
      <div class="remote-section"><div class="remote-label">Mode</div><div class="remote-row" id="testModeRow"></div></div>
      <div class="remote-section"><div class="remote-label">Fan</div><div class="remote-row" id="testFanRow"></div></div>
      <div class="remote-section">
        <div class="remote-label">Temperature</div>
        <div class="temp-display">
          <button class="remote-btn temp-btn" id="testTempDown">▼</button>
          <span class="temp-value" id="testTempDisplay">24°C</span>
          <button class="remote-btn temp-btn" id="testTempUp">▲</button>
        </div>
      </div>
      <div class="remote-section"><button class="btn primary full-width" id="testSendBtn">📡 Send Command</button></div>
    </div>
    <div class="test-log-wrap">
      <h3>Activity Log</h3>
      <div class="test-log" id="testLog"></div>
    </div>
  </div>
  <div class="step-actions">
    <button class="btn ghost" id="step3Back">← Back</button>
    <button class="btn primary" id="step3Next">Next: Export →</button>
  </div>
</section>

<!-- STEP 4 -->
<section id="step4" class="step-content">
  <h2>Step 4 — Export SmartIR JSON</h2>
  <div class="export-layout">
    <div class="card">
      <h3>Summary</h3>
      <div class="export-summary" id="exportSummary"></div>
      <div class="export-actions"><button class="btn primary large" id="btnDownload">⬇ Download JSON</button></div>
    </div>
    <div class="card"><h3>Preview</h3><pre class="json-preview" id="jsonPreview"></pre></div>
  </div>
  <div class="step-actions">
    <button class="btn ghost" id="step4Back">← Back</button>
    <button class="btn ghost" id="step4Restart">🔄 Start over</button>
  </div>
</section>
`;

// ─────────────────────────────────────────────────────────────────────────────
//  Web Component
// ─────────────────────────────────────────────────────────────────────────────
class SmartIrLearnPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._ready = false;
    this._allEntities = [];
    this._st = {           // wizard state
      config: {},
      queue: [],
      currentIdx: 0,
      codes: {},
      testMode: 'cool',
      testFan: 'low',
      testTemp: 24,
      cancelLearn: null,
    };
  }

  // HA calls this every time state updates — we only initialise once
  set hass(hass) {
    this._hass = hass;
    if (!this._ready) {
      this._ready = true;
      this._mount();
    }
  }
  get hass() { return this._hass; }

  _mount() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${_CSS}</style>${_HTML}`;
    this._loadEntities();
    this._bindAllEvents();
  }

  // Shadow DOM helpers
  _$(id)    { return this.shadowRoot.getElementById(id); }
  _$$(sel)  { return this.shadowRoot.querySelectorAll(sel); }

  // ── Entity loading ──────────────────────────────────────────────────────────
  _loadEntities() {
    // hass.states is a plain object: { 'sensor.foo': {entity_id, state, attributes} }
    this._allEntities = Object.values(this._hass.states).map(s => ({
      entity_id:    s.entity_id,
      state:        s.state,
      attributes:   s.attributes,
      domain:       s.entity_id.split('.')[0],
      friendlyName: s.attributes.friendly_name || s.entity_id,
    }));
    this._$('entitiesLoading').style.display = 'none';
    this._$('step1Cards').style.display      = '';
    this._$('step1Actions').style.display    = '';
    this._initAllPickers();
  }

  // ── Entity Picker ───────────────────────────────────────────────────────────
  _initAllPickers() {
    this.shadowRoot.querySelectorAll('.entity-picker').forEach(c => this._initPicker(c));
  }

  _initPicker(container) {
    const placeholder    = container.dataset.placeholder || 'Search…';
    const allowedDomains = container.dataset.domains
      ? container.dataset.domains.split(',').map(d => d.trim()) : [];

    container.innerHTML = `
      <div class="ep-wrap">
        <div class="ep-selected" tabindex="0">
          <span class="ep-selected-icon">📋</span>
          <span class="ep-selected-label">— not selected —</span>
          <span class="ep-clear" style="display:none">✕</span>
        </div>
        <div class="ep-dropdown" style="display:none">
          <input class="ep-search" type="text" placeholder="${placeholder}" autocomplete="off" spellcheck="false" />
          <div class="ep-list"></div>
        </div>
      </div>`;

    const wrap      = container.querySelector('.ep-wrap');
    const selBox    = container.querySelector('.ep-selected');
    const dropdown  = container.querySelector('.ep-dropdown');
    const search    = container.querySelector('.ep-search');
    const list      = container.querySelector('.ep-list');
    const clearBtn  = container.querySelector('.ep-clear');
    const selLabel  = container.querySelector('.ep-selected-label');
    const selIcon   = container.querySelector('.ep-selected-icon');

    const domainIcon = d => ({ button:'🔘', text:'📝', sensor:'📡', switch:'🔌', select:'📋' }[d] || '🔷');

    const render = (q = '') => {
      const query = q.toLowerCase();
      const items = this._allEntities
        .filter(e => !allowedDomains.length || allowedDomains.includes(e.domain))
        .filter(e => !query || e.entity_id.toLowerCase().includes(query) || e.friendlyName.toLowerCase().includes(query))
        .slice(0, 60);
      if (!items.length) { list.innerHTML = '<div class="ep-no-results">No matching entities</div>'; return; }
      list.innerHTML = items.map(e => `
        <div class="ep-item" data-id="${e.entity_id}">
          <span class="ep-item-icon">${domainIcon(e.domain)}</span>
          <span class="ep-item-body">
            <span class="ep-item-name">${e.friendlyName}</span>
            <span class="ep-item-id">${e.entity_id}</span>
          </span>
          <span class="ep-item-domain">${e.domain}</span>
        </div>`).join('');
      list.querySelectorAll('.ep-item').forEach(item =>
        item.addEventListener('click', () => select(item.dataset.id)));
    };

    const select = (entityId) => {
      const e = this._allEntities.find(x => x.entity_id === entityId);
      if (!e) return;
      container.dataset.selected = entityId;
      selLabel.textContent = `${e.friendlyName}  (${entityId})`;
      selIcon.textContent  = domainIcon(e.domain);
      clearBtn.style.display = '';
      close();
    };

    const open  = () => { dropdown.style.display = ''; search.value = ''; render(''); search.focus(); };
    const close = () => { dropdown.style.display = 'none'; };

    selBox.addEventListener('click', () => dropdown.style.display === 'none' ? open() : close());
    search.addEventListener('input', () => render(search.value));
    clearBtn.addEventListener('click', e => {
      e.stopPropagation();
      delete container.dataset.selected;
      selLabel.textContent = '— not selected —';
      selIcon.textContent  = '📋';
      clearBtn.style.display = 'none';
    });
    // Close on click outside (within shadow root)
    this.shadowRoot.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
    render('');
  }

  _pickerVal(id) { return this._$(id)?.dataset.selected || null; }

  // ── STEP 1 ──────────────────────────────────────────────────────────────────
  _validateStep1() {
    if (!this._pickerVal('pickerLearnTrigger')) { alert('Select the "Learn trigger" entity.'); return false; }
    if (!this._pickerVal('pickerLearnedCode'))  { alert('Select the "Learned code output" entity.'); return false; }
    if (!this._pickerVal('pickerSendCode'))      { alert('Select the "Send IR code" entity.'); return false; }
    for (const id of ['manufacturer','model']) {
      if (!this._$(id).value.trim()) { this._$(id).focus(); alert('Fill in: ' + id); return false; }
    }
    if (!this._getChecked('operationModes').length) { alert('Select at least one operation mode.'); return false; }
    if (!this._getChecked('fanModes').length)        { alert('Select at least one fan mode.'); return false; }
    return true;
  }

  _getChecked(containerId) {
    return [...this._$$(`#${containerId} input[type=checkbox]:checked`)].map(c => c.value);
  }

  _buildConfig() {
    const g = id => this._$(id).value.trim();
    const learnE = this._allEntities.find(e => e.entity_id === this._pickerVal('pickerLearnTrigger'));
    this._st.config = {
      learnTriggerId:     learnE.entity_id,
      learnTriggerDomain: learnE.domain,
      learnedCodeId:      this._pickerVal('pickerLearnedCode'),
      sendCodeId:         this._pickerVal('pickerSendCode'),
      manufacturer:       g('manufacturer'),
      model:              g('model'),
      minTemp:            parseFloat(this._$('minTemp').value),
      maxTemp:            parseFloat(this._$('maxTemp').value),
      precision:          parseFloat(this._$('precision').value),
      operationModes:     this._getChecked('operationModes'),
      fanModes:           this._getChecked('fanModes'),
    };
  }

  // ── HA service calls ────────────────────────────────────────────────────────
  async _triggerLearn() {
    const { learnTriggerId, learnTriggerDomain } = this._st.config;
    if (learnTriggerDomain === 'button') return this._hass.callService('button', 'press', { entity_id: learnTriggerId });
    if (learnTriggerDomain === 'switch') return this._hass.callService('switch', 'turn_on', { entity_id: learnTriggerId });
    return this._hass.callService('text', 'set_value', { entity_id: learnTriggerId, value: '' });
  }

  async _sendCode(code) {
    return this._hass.callService('text', 'set_value', { entity_id: this._st.config.sendCodeId, value: code });
  }

  // Subscribe to state_changed, resolve when the learned-code entity gets a new non-empty state
  _waitForLearnedCode(timeoutMs = 45000) {
    const entityId    = this._st.config.learnedCodeId;
    const priorState  = this._hass.states[entityId]?.state || '';
    return new Promise(async (resolve, reject) => {
      let unsub  = null;
      let done   = false;
      const timer = setTimeout(() => {
        done = true; if (unsub) unsub();
        reject(new Error('Timeout — no code received within 45 s'));
      }, timeoutMs);
      unsub = await this._hass.connection.subscribeEvents((event) => {
        if (done) return;
        const d = event.data;
        if (d.entity_id !== entityId) return;
        const newState = d.new_state?.state;
        if (!newState || newState === priorState || newState === 'unknown'
            || newState === 'unavailable' || newState.length < 4) return;
        done = true; clearTimeout(timer); unsub();
        resolve(newState);
      }, 'state_changed');
    });
  }

  // ── STEP 2 — Queue ──────────────────────────────────────────────────────────
  _buildQueue() {
    this._st.queue = [];
    this._st.codes = {};
    this._st.queue.push({ key: 'off', label: 'OFF', mode: null, fan: null, temp: null, status: 'pending' });
    const { operationModes, fanModes, minTemp, maxTemp, precision } = this._st.config;
    const temps = [];
    for (let t = minTemp; t <= maxTemp; t += precision) temps.push(Math.round(t * 10) / 10);
    for (const mode of operationModes)
      for (const fan of fanModes)
        for (const temp of temps)
          this._st.queue.push({ key: `${mode}|${fan}|${temp}`, label: `${mode} / ${fan} / ${temp}°C`, mode, fan, temp, status: 'pending' });
    this._updateProgress();
  }

  _renderQueue() {
    const list = this._$('queueList');
    list.innerHTML = '';
    this._st.queue.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'queue-item' + (item.status === 'done' ? ' done' : '') + (item.status === 'skipped' ? ' skipped' : '');
      div.dataset.idx = idx;
      const icon       = item.mode === null ? '⏻' : this._modeIcon(item.mode);
      const statusIcon = { done: '✅', skipped: '⏭', pending: '⬜' }[item.status] || '⬜';
      div.innerHTML    = `<span class="queue-icon">${icon}</span><span class="queue-label">${item.label}</span><span class="queue-status">${statusIcon}</span>`;
      div.addEventListener('click', () => this._goToItem(idx));
      list.appendChild(div);
    });
  }

  _modeIcon(mode) {
    return { cool: '❄️', heat: '🔥', heat_cool: '🔄', dry: '💧', fan_only: '🌀' }[mode] || '📡';
  }

  _updateProgress() {
    const done  = this._st.queue.filter(i => i.status === 'done').length;
    const total = this._st.queue.length;
    this._$('progressCount').textContent     = done;
    this._$('progressTotal').textContent     = total;
    this._$('progressBar').style.width       = total ? (done / total * 100) + '%' : '0%';
  }

  _goToItem(idx) {
    this._st.currentIdx = idx;
    const item = this._st.queue[idx];
    if (!item) return;
    this._$$('.queue-item').forEach((el, i) => el.classList.toggle('current', i === idx));
    this.shadowRoot.querySelector(`.queue-item[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    this._$('commandTitle').textContent      = item.label;
    this._renderLearnRemote(item);
    this._$('learnInstructions').textContent = item.status === 'done'
      ? 'Already learned ✅ — you can re-learn if needed.'
      : `Click "Learn this code" Then set your AC remote to:\n${item.label}\n.`;
    this._$('learnActions').style.display    = '';
    this._$('learnWaiting').style.display    = 'none';
    this._$('learnSuccess').style.display    = 'none';
    this._$('btnRedo').style.display         = item.status === 'done' ? '' : 'none';
    this._$('btnTest').style.display         = item.status === 'done' ? '' : 'none';
  }

  _renderLearnRemote(item) {
    const c = this._$('acRemoteLearn');
    c.innerHTML = '';
    c.appendChild(this._chip(item.mode === null ? '⏻ OFF' : '⏻ ON', item.mode === null ? 'power-off' : 'power-on'));
    if (item.mode !== null) {
      c.appendChild(this._div());
      const mr = document.createElement('div'); mr.className = 'remote-row';
      mr.appendChild(this._chip(this._modeIcon(item.mode) + ' ' + item.mode, 'active'));
      c.appendChild(mr);
      const fr = document.createElement('div'); fr.className = 'remote-row';
      fr.appendChild(this._chip('🌬 ' + item.fan, 'active'));
      c.appendChild(fr);
      c.appendChild(this._div());
      const td = document.createElement('div'); td.className = 'remote-temp-display';
      td.textContent = item.temp + '°C'; c.appendChild(td);
    }
  }

  _chip(text, extraClass = '') {
    const el = document.createElement('div');
    el.className = 'remote-chip' + (extraClass ? ' ' + extraClass : '');
    el.textContent = text; return el;
  }
  _div() { const el = document.createElement('div'); el.className = 'remote-divider'; return el; }

  // ── STEP 2 — Learn actions ──────────────────────────────────────────────────
  async _startLearn() {
    const item = this._st.queue[this._st.currentIdx];
    if (!item) return;
    this._$('learnActions').style.display = 'none';
    this._$('learnWaiting').style.display = '';
    this._$('learnSuccess').style.display = 'none';

    let cancelled = false;
    this._st.cancelLearn = () => { cancelled = true; };

    try {
      const codePromise = this._waitForLearnedCode(45000);
      await this._triggerLearn();
      const code = await codePromise;
      if (cancelled) return;
      this._storeCode(item, code);
      item.status = 'done';
      this._updateProgress();
      this._renderQueue();
      this._$('learnWaiting').style.display  = 'none';
      this._$('learnSuccess').style.display  = '';
      this._$('learnSuccessMsg').textContent = `Code captured! (${code.substring(0, 24)}…)`;
      // also make Test available from the actions row after next navigation
      this._$('btnTest').style.display = '';
      this._$('btnRedo').style.display = '';
    } catch (e) {
      if (cancelled) return;
      this._$('learnWaiting').style.display = 'none';
      this._$('learnActions').style.display = '';
      alert('Error: ' + e.message);
    } finally {
      this._st.cancelLearn = null;
    }
  }

  _cancelLearn() {
    if (this._st.cancelLearn) this._st.cancelLearn();
    this._$('learnWaiting').style.display = 'none';
    this._$('learnActions').style.display = '';
  }

  async _testCurrentCode() {
    const item = this._st.queue[this._st.currentIdx];
    if (!item) return;
    const code = item.mode === null
      ? this._st.codes['off']
      : this._st.codes?.[item.mode]?.[item.fan]?.[String(item.temp)];
    if (!code) { alert('No code learned for this command yet.'); return; }
    const btn = this._$('btnTest');
    btn.textContent = '⏳ Sending…';
    btn.disabled = true;
    try {
      await this._sendCode(code);
      btn.textContent = '✅ Sent!';
      setTimeout(() => { btn.textContent = '▶ Test'; btn.disabled = false; }, 1500);
    } catch (e) {
      btn.textContent = '❌ Error';
      btn.disabled = false;
      alert('Send failed: ' + e.message);
    }
  }

  _skipCurrent() {
    const item = this._st.queue[this._st.currentIdx];
    if (item) item.status = 'skipped';
    this._updateProgress(); this._renderQueue(); this._advanceQueue();
  }

  _advanceQueue() {
    const nextIdx = this._st.queue.findIndex((item, i) => i > this._st.currentIdx && item.status === 'pending');
    if (nextIdx !== -1) { this._goToItem(nextIdx); return; }
    this._$('commandTitle').textContent      = '🎉 All done!';
    this._$('acRemoteLearn').innerHTML       = '<div style="font-size:48px;padding:20px">🎉</div>';
    this._$('learnInstructions').textContent = 'All commands learned. Proceed to test!';
    this._$('learnActions').style.display    = 'none';
    this._$('learnWaiting').style.display    = 'none';
    this._$('learnSuccess').style.display    = 'none';
  }

  _storeCode(item, code) {
    if (item.mode === null) { this._st.codes['off'] = code; return; }
    if (!this._st.codes[item.mode]) this._st.codes[item.mode] = {};
    if (!this._st.codes[item.mode][item.fan]) this._st.codes[item.mode][item.fan] = {};
    this._st.codes[item.mode][item.fan][String(item.temp)] = code;
  }

  // ── STEP 3 — Test remote ────────────────────────────────────────────────────
  _buildTestRemote() {
    const { operationModes, fanModes, minTemp, maxTemp } = this._st.config;
    const modeRow = this._$('testModeRow');
    modeRow.innerHTML = '';
    for (const mode of operationModes) {
      const btn = document.createElement('button');
      btn.className = 'remote-btn' + (mode === this._st.testMode ? ' active' : '');
      btn.dataset.mode = mode;
      btn.textContent = this._modeIcon(mode) + ' ' + mode;
      btn.addEventListener('click', () => {
        this._st.testMode = mode;
        modeRow.querySelectorAll('.remote-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
      });
      modeRow.appendChild(btn);
    }
    const fanRow = this._$('testFanRow');
    fanRow.innerHTML = '';
    for (const fan of fanModes) {
      const btn = document.createElement('button');
      btn.className = 'remote-btn' + (fan === this._st.testFan ? ' active' : '');
      btn.dataset.fan = fan;
      btn.textContent = fan;
      btn.addEventListener('click', () => {
        this._st.testFan = fan;
        fanRow.querySelectorAll('.remote-btn').forEach(b => b.classList.toggle('active', b.dataset.fan === fan));
      });
      fanRow.appendChild(btn);
    }
    this._st.testTemp = Math.max(minTemp, Math.min(maxTemp, this._st.testTemp));
    this._$('testTempDisplay').textContent = this._st.testTemp + '°C';
  }

  async _sendTestCode(type, mode, fan, temp) {
    const desc = type === 'off' ? 'OFF' : `${mode}/${fan}/${temp}°C`;
    const code = type === 'off' ? this._st.codes['off'] : this._st.codes?.[mode]?.[fan]?.[String(temp)];
    if (!code) { this._logTest('No code learned for: ' + desc, 'err'); return; }
    try {
      await this._sendCode(code);
      this._logTest('Sent: ' + desc, 'ok');
    } catch (e) {
      this._logTest('Error sending ' + desc + ': ' + e.message, 'err');
    }
  }

  _logTest(msg, type = 'info') {
    const log = this._$('testLog');
    const ts  = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-entry ' + type;
    div.innerHTML = `<span class="ts">${ts}</span><span class="msg">${msg}</span>`;
    log.prepend(div);
  }

  // ── STEP 4 — Export ─────────────────────────────────────────────────────────
  _buildExport() {
    const { manufacturer, model, minTemp, maxTemp, precision, operationModes, fanModes } = this._st.config;
    const json    = { manufacturer, supportedModels: [model], supportedController: 'MQTT',
      commandsEncoding: 'Raw', minTemperature: minTemp, maxTemperature: maxTemp, precision,
      operationModes, fanModes, commands: this._st.codes };
    const jsonStr = JSON.stringify(json, null, 2);
    this._$('jsonPreview').textContent = jsonStr;
    const learned = this._st.queue.filter(i => i.status === 'done').length;
    this._$('exportSummary').innerHTML = `
      <strong>Manufacturer:</strong> ${manufacturer}<br/>
      <strong>Model:</strong> ${model}<br/>
      <strong>Temperature:</strong> ${minTemp}°C – ${maxTemp}°C (step ${precision}°C)<br/>
      <strong>Operation modes:</strong> ${operationModes.join(', ')}<br/>
      <strong>Fan modes:</strong> ${fanModes.join(', ')}<br/>
      <strong>Codes learned:</strong> ${learned} / ${this._st.queue.length}`;
    this._$('btnDownload').onclick = () => {
      const a  = document.createElement('a');
      a.href   = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
      a.download = `${manufacturer.toLowerCase().replace(/\s+/g,'_')}_${model.toLowerCase().replace(/\s+/g,'_')}.json`;
      a.click();
    };
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  _showStep(n) {
    this._$$('.step-content').forEach(s => s.classList.remove('active'));
    this._$('step' + n).classList.add('active');
    this._$$('.steps-bar .step').forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done',   sn < n);
    });
    this.scrollTop = 0;
  }

  // ── Bind all events ─────────────────────────────────────────────────────────
  _bindAllEvents() {
    // Step 1
    this._$('step1Next').addEventListener('click', () => {
      if (!this._validateStep1()) return;
      this._buildConfig(); this._buildQueue(); this._renderQueue(); this._showStep(2);
      this._goToItem(0);
    });
    // Step 2
    this._$('btnLearn').addEventListener('click',       () => this._startLearn());
    this._$('btnRedo').addEventListener('click',        () => this._startLearn());
    this._$('btnTest').addEventListener('click',        () => this._testCurrentCode());
    this._$('btnSkip').addEventListener('click',        () => this._skipCurrent());
    this._$('btnCancelLearn').addEventListener('click', () => this._cancelLearn());
    this._$('btnLearnAgain').addEventListener('click',  () => this._startLearn());
    this._$('btnNextCommand').addEventListener('click', () => this._advanceQueue());
    this._$('step2Back').addEventListener('click', () => this._showStep(1));
    this._$('step2Next').addEventListener('click', () => {
      const learned = this._st.queue.filter(i => i.status === 'done').length;
      if (!learned && !confirm('No codes learned yet. Continue anyway?')) return;
      this._buildTestRemote(); this._showStep(3);
    });
    // Step 3
    this._$('testPowerOff').addEventListener('click',  () => this._sendTestCode('off', null, null, null));
    this._$('testSendBtn').addEventListener('click',   () => this._sendTestCode('on', this._st.testMode, this._st.testFan, this._st.testTemp));
    this._$('testTempDown').addEventListener('click',  () => {
      const { minTemp, precision } = this._st.config;
      this._st.testTemp = Math.max(minTemp, Math.round((this._st.testTemp - precision) * 10) / 10);
      this._$('testTempDisplay').textContent = this._st.testTemp + '°C';
    });
    this._$('testTempUp').addEventListener('click', () => {
      const { maxTemp, precision } = this._st.config;
      this._st.testTemp = Math.min(maxTemp, Math.round((this._st.testTemp + precision) * 10) / 10);
      this._$('testTempDisplay').textContent = this._st.testTemp + '°C';
    });
    this._$('step3Back').addEventListener('click', () => this._showStep(2));
    this._$('step3Next').addEventListener('click', () => { this._buildExport(); this._showStep(4); });
    // Step 4
    this._$('step4Back').addEventListener('click', () => this._showStep(3));
    this._$('step4Restart').addEventListener('click', () => {
      if (confirm('Start over? All learned codes will be lost.')) {
        this._st.codes = {}; this._st.queue = []; this._showStep(1);
      }
    });
  }
}

customElements.define('smartir-learn-panel', SmartIrLearnPanel);
