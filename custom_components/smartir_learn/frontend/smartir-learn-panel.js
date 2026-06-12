/**
 * SmartIR Learn Panel — HA Web Component
 * HA sets `element.hass` whenever state updates, giving us direct access
 * to callService(), connection.subscribeEvents(), and states[] — no auth token needed.
 */
import { SMARTIR_LEARN_PANEL_CSS } from './smartir-learn-panel-styles.js';
import { SMARTIR_LEARN_PANEL_HTML } from './smartir-learn-panel-template.js';
import { initAllEntityPickers } from './smartir-learn-panel-entity-picker.js';

const _CSS = SMARTIR_LEARN_PANEL_CSS;
const _HTML = SMARTIR_LEARN_PANEL_HTML;

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
    initAllEntityPickers(this);
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
