import { buildConfig, validateStep1 } from './smartir-learn-panel-step1.js';
import { advanceQueue, buildQueue, cancelLearn, goToItem, renderQueue, skipCurrent, startLearn, testCurrentCode } from './smartir-learn-panel-step2.js';
import { buildTestRemote, sendTestCode } from './smartir-learn-panel-step3.js';
import { buildExport } from './smartir-learn-panel-step4.js';

export function showStep(panel, n) {
  panel._$$('.step-content').forEach((s) => s.classList.remove('active'));
  panel._$('step' + n).classList.add('active');
  panel._$$('.steps-bar .step').forEach((s) => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });
  panel.scrollTop = 0;
}

export function bindAllEvents(panel) {
  panel._$('step1Next').addEventListener('click', () => {
    if (!validateStep1(panel)) return;
    buildConfig(panel);
    buildQueue(panel);
    renderQueue(panel);
    showStep(panel, 2);
    goToItem(panel, 0);
  });

  panel._$('btnLearn').addEventListener('click', () => startLearn(panel));
  panel._$('btnRedo').addEventListener('click', () => startLearn(panel));
  panel._$('btnTest').addEventListener('click', () => testCurrentCode(panel));
  panel._$('btnSkip').addEventListener('click', () => skipCurrent(panel));
  panel._$('btnCancelLearn').addEventListener('click', () => cancelLearn(panel));
  panel._$('btnLearnAgain').addEventListener('click', () => startLearn(panel));
  panel._$('btnNextCommand').addEventListener('click', () => advanceQueue(panel));
  panel._$('step2Back').addEventListener('click', () => showStep(panel, 1));
  panel._$('step2Next').addEventListener('click', () => {
    const learned = panel._st.queue.filter((i) => i.status === 'done').length;
    if (!learned && !confirm('No codes learned yet. Continue anyway?')) return;
    buildTestRemote(panel);
    showStep(panel, 3);
  });

  panel._$('testPowerOff').addEventListener('click', () => sendTestCode(panel, 'off', null, null, null));
  panel._$('testSendBtn').addEventListener('click', () => sendTestCode(panel, 'on', panel._st.testMode, panel._st.testFan, panel._st.testTemp));
  panel._$('testTempDown').addEventListener('click', () => {
    const { minTemp, precision } = panel._st.config;
    panel._st.testTemp = Math.max(minTemp, Math.round((panel._st.testTemp - precision) * 10) / 10);
    panel._$('testTempDisplay').textContent = panel._st.testTemp + '°C';
  });
  panel._$('testTempUp').addEventListener('click', () => {
    const { maxTemp, precision } = panel._st.config;
    panel._st.testTemp = Math.min(maxTemp, Math.round((panel._st.testTemp + precision) * 10) / 10);
    panel._$('testTempDisplay').textContent = panel._st.testTemp + '°C';
  });
  panel._$('step3Back').addEventListener('click', () => showStep(panel, 2));
  panel._$('step3Next').addEventListener('click', () => { buildExport(panel); showStep(panel, 4); });

  panel._$('step4Back').addEventListener('click', () => showStep(panel, 3));
  panel._$('step4Restart').addEventListener('click', () => {
    if (confirm('Start over? All learned codes will be lost.')) {
      panel._st.codes = {};
      panel._st.queue = [];
      showStep(panel, 1);
    }
  });
}
