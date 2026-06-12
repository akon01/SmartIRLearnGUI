export const SMARTIR_LEARN_PANEL_HTML = `
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
