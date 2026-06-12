/**
 * SmartIR Learn Panel — HA Web Component
 * HA sets `element.hass` whenever state updates, giving us direct access
 * to callService(), connection.subscribeEvents(), and states[] — no auth token needed.
 */
import { SMARTIR_LEARN_PANEL_CSS } from './smartir-learn-panel-styles.js';
import { SMARTIR_LEARN_PANEL_HTML } from './smartir-learn-panel-template.js';
import { initAllEntityPickers } from './smartir-learn-panel-entity-picker.js';
import { bindAllEvents } from './smartir-learn-panel-navigation.js';

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
  _getChecked(containerId) {
    return [...this._$$(`#${containerId} input[type=checkbox]:checked`)].map(c => c.value);
  }
  _modeIcon(mode) {
    return { cool: '❄️', heat: '🔥', heat_cool: '🔄', dry: '💧', fan_only: '🌀' }[mode] || '📡';
  }

  // ── Bind all events ─────────────────────────────────────────────────────────
  _bindAllEvents() {
    return bindAllEvents(this);
  }
}

customElements.define('smartir-learn-panel', SmartIrLearnPanel);
