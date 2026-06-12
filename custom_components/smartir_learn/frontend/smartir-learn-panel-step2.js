import { sendCode, triggerLearn, waitForLearnedCode } from './smartir-learn-panel-services.js';

export function buildQueue(panel) {
  panel._st.queue = [];
  panel._st.codes = {};
  panel._st.queue.push({ key: 'off', label: 'OFF', mode: null, fan: null, temp: null, status: 'pending' });
  const { operationModes, fanModes, minTemp, maxTemp, precision } = panel._st.config;
  const temps = [];
  for (let t = minTemp; t <= maxTemp; t += precision) temps.push(Math.round(t * 10) / 10);
  for (const mode of operationModes) {
    for (const fan of fanModes) {
      for (const temp of temps) {
        panel._st.queue.push({ key: `${mode}|${fan}|${temp}`, label: `${mode} / ${fan} / ${temp}°C`, mode, fan, temp, status: 'pending' });
      }
    }
  }
  updateProgress(panel);
}

export function renderQueue(panel) {
  const list = panel._$('queueList');
  list.innerHTML = '';
  panel._st.queue.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'queue-item' + (item.status === 'done' ? ' done' : '') + (item.status === 'skipped' ? ' skipped' : '');
    div.dataset.idx = idx;
    const icon = item.mode === null ? '⏻' : panel._modeIcon(item.mode);
    const statusIcon = { done: '✅', skipped: '⏭', pending: '⬜' }[item.status] || '⬜';
    div.innerHTML = `<span class="queue-icon">${icon}</span><span class="queue-label">${item.label}</span><span class="queue-status">${statusIcon}</span>`;
    div.addEventListener('click', () => goToItem(panel, idx));
    list.appendChild(div);
  });
}

export function updateProgress(panel) {
  const done = panel._st.queue.filter((i) => i.status === 'done').length;
  const total = panel._st.queue.length;
  panel._$('progressCount').textContent = done;
  panel._$('progressTotal').textContent = total;
  panel._$('progressBar').style.width = total ? (done / total * 100) + '%' : '0%';
}

export function goToItem(panel, idx) {
  panel._st.currentIdx = idx;
  const item = panel._st.queue[idx];
  if (!item) return;
  panel._$$('.queue-item').forEach((el, i) => el.classList.toggle('current', i === idx));
  panel.shadowRoot.querySelector(`.queue-item[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  panel._$('commandTitle').textContent = item.label;
  renderLearnRemote(panel, item);
  panel._$('learnInstructions').textContent = item.status === 'done'
    ? 'Already learned ✅ — you can re-learn if needed.'
    : `Click "Learn this code" Then set your AC remote to:\n${item.label}\n.`;
  panel._$('learnActions').style.display = '';
  panel._$('learnWaiting').style.display = 'none';
  panel._$('learnSuccess').style.display = 'none';
  panel._$('btnRedo').style.display = item.status === 'done' ? '' : 'none';
  panel._$('btnTest').style.display = item.status === 'done' ? '' : 'none';
}

export function renderLearnRemote(panel, item) {
  const c = panel._$('acRemoteLearn');
  c.innerHTML = '';
  c.appendChild(chip(item.mode === null ? '⏻ OFF' : '⏻ ON', item.mode === null ? 'power-off' : 'power-on'));
  if (item.mode !== null) {
    c.appendChild(div());
    const mr = document.createElement('div');
    mr.className = 'remote-row';
    mr.appendChild(chip(panel._modeIcon(item.mode) + ' ' + item.mode, 'active'));
    c.appendChild(mr);
    const fr = document.createElement('div');
    fr.className = 'remote-row';
    fr.appendChild(chip('🌬 ' + item.fan, 'active'));
    c.appendChild(fr);
    c.appendChild(div());
    const td = document.createElement('div');
    td.className = 'remote-temp-display';
    td.textContent = item.temp + '°C';
    c.appendChild(td);
  }
}

export function chip(text, extraClass = '') {
  const el = document.createElement('div');
  el.className = 'remote-chip' + (extraClass ? ' ' + extraClass : '');
  el.textContent = text;
  return el;
}

export function div() {
  const el = document.createElement('div');
  el.className = 'remote-divider';
  return el;
}

export async function startLearn(panel) {
  const item = panel._st.queue[panel._st.currentIdx];
  if (!item) return;
  panel._$('learnActions').style.display = 'none';
  panel._$('learnWaiting').style.display = '';
  panel._$('learnSuccess').style.display = 'none';

  let cancelled = false;
  panel._st.cancelLearn = () => { cancelled = true; };

  try {
    const codePromise = waitForLearnedCode(panel, 45000);
    await triggerLearn(panel);
    const code = await codePromise;
    if (cancelled) return;
    storeCode(panel, item, code);
    item.status = 'done';
    updateProgress(panel);
    renderQueue(panel);
    panel._$('learnWaiting').style.display = 'none';
    panel._$('learnSuccess').style.display = '';
    panel._$('learnSuccessMsg').textContent = `Code captured! (${code}…)`;
    panel._$('btnTest').style.display = '';
    panel._$('btnRedo').style.display = '';
  } catch (e) {
    if (cancelled) return;
    panel._$('learnWaiting').style.display = 'none';
    panel._$('learnActions').style.display = '';
    alert('Error: ' + e.message);
  } finally {
    panel._st.cancelLearn = null;
  }
}

export function cancelLearn(panel) {
  if (panel._st.cancelLearn) panel._st.cancelLearn();
  panel._$('learnWaiting').style.display = 'none';
  panel._$('learnActions').style.display = '';
}

export async function testCurrentCode(panel) {
  const item = panel._st.queue[panel._st.currentIdx];
  if (!item) return;
  const code = item.mode === null
    ? panel._st.codes['off']
    : panel._st.codes?.[item.mode]?.[item.fan]?.[String(item.temp)];
  if (!code) { alert('No code learned for this command yet.'); return; }
  const btn = panel._$('btnTest');
  btn.textContent = '⏳ Sending…';
  btn.disabled = true;
  try {
    await sendCode(panel, code);
    btn.textContent = '✅ Sent!';
    setTimeout(() => { btn.textContent = '▶ Test'; btn.disabled = false; }, 1500);
  } catch (e) {
    btn.textContent = '❌ Error';
    btn.disabled = false;
    alert('Send failed: ' + e.message);
  }
}

export function skipCurrent(panel) {
  const item = panel._st.queue[panel._st.currentIdx];
  if (item) item.status = 'skipped';
  updateProgress(panel);
  renderQueue(panel);
  advanceQueue(panel);
}

export function advanceQueue(panel) {
  const nextIdx = panel._st.queue.findIndex((item, i) => i > panel._st.currentIdx && item.status === 'pending');
  if (nextIdx !== -1) { goToItem(panel, nextIdx); return; }
  panel._$('commandTitle').textContent = '🎉 All done!';
  panel._$('acRemoteLearn').innerHTML = '<div style="font-size:48px;padding:20px">🎉</div>';
  panel._$('learnInstructions').textContent = 'All commands learned. Proceed to test!';
  panel._$('learnActions').style.display = 'none';
  panel._$('learnWaiting').style.display = 'none';
  panel._$('learnSuccess').style.display = 'none';
}

export function storeCode(panel, item, code) {
  if (item.mode === null) { panel._st.codes['off'] = code; return; }
  if (!panel._st.codes[item.mode]) panel._st.codes[item.mode] = {};
  if (!panel._st.codes[item.mode][item.fan]) panel._st.codes[item.mode][item.fan] = {};
  panel._st.codes[item.mode][item.fan][String(item.temp)] = code;
}
