import { sendCode } from './smartir-learn-panel-services.js';

export function buildTestRemote(panel) {
  const { operationModes, fanModes, minTemp, maxTemp } = panel._st.config;
  const modeRow = panel._$('testModeRow');
  modeRow.innerHTML = '';
  for (const mode of operationModes) {
    const btn = document.createElement('button');
    btn.className = 'remote-btn' + (mode === panel._st.testMode ? ' active' : '');
    btn.dataset.mode = mode;
    btn.textContent = panel._modeIcon(mode) + ' ' + mode;
    btn.addEventListener('click', () => {
      panel._st.testMode = mode;
      modeRow.querySelectorAll('.remote-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    });
    modeRow.appendChild(btn);
  }
  const fanRow = panel._$('testFanRow');
  fanRow.innerHTML = '';
  for (const fan of fanModes) {
    const btn = document.createElement('button');
    btn.className = 'remote-btn' + (fan === panel._st.testFan ? ' active' : '');
    btn.dataset.fan = fan;
    btn.textContent = fan;
    btn.addEventListener('click', () => {
      panel._st.testFan = fan;
      fanRow.querySelectorAll('.remote-btn').forEach((b) => b.classList.toggle('active', b.dataset.fan === fan));
    });
    fanRow.appendChild(btn);
  }
  panel._st.testTemp = Math.max(minTemp, Math.min(maxTemp, panel._st.testTemp));
  panel._$('testTempDisplay').textContent = panel._st.testTemp + '°C';
}

export async function sendTestCode(panel, type, mode, fan, temp) {
  const desc = type === 'off' ? 'OFF' : `${mode}/${fan}/${temp}°C`;
  const code = type === 'off' ? panel._st.codes['off'] : panel._st.codes?.[mode]?.[fan]?.[String(temp)];
  if (!code) { logTest(panel, 'No code learned for: ' + desc, 'err'); return; }
  try {
    await sendCode(panel, code);
    logTest(panel, 'Sent: ' + desc, 'ok');
  } catch (e) {
    logTest(panel, 'Error sending ' + desc + ': ' + e.message, 'err');
  }
}

export function logTest(panel, msg, type = 'info') {
  const log = panel._$('testLog');
  const ts = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.className = 'log-entry ' + type;
  div.innerHTML = `<span class="ts">${ts}</span><span class="msg">${msg}</span>`;
  log.prepend(div);
}
