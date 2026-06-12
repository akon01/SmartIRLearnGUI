export async function triggerLearn(panel) {
  const { learnTriggerId, learnTriggerDomain } = panel._st.config;
  if (learnTriggerDomain === 'button') return panel._hass.callService('button', 'press', { entity_id: learnTriggerId });
  if (learnTriggerDomain === 'switch') return panel._hass.callService('switch', 'turn_on', { entity_id: learnTriggerId });
  return panel._hass.callService('text', 'set_value', { entity_id: learnTriggerId, value: '' });
}

export async function sendCode(panel, code) {
  return panel._hass.callService('text', 'set_value', { entity_id: panel._st.config.sendCodeId, value: code });
}

export function waitForLearnedCode(panel, timeoutMs = 45000) {
  const entityId = panel._st.config.learnedCodeId;
  const priorState = panel._hass.states[entityId]?.state || '';
  return new Promise(async (resolve, reject) => {
    let unsub = null;
    let done = false;
    const timer = setTimeout(() => {
      done = true;
      if (unsub) unsub();
      reject(new Error('Timeout — no code received within 45 s'));
    }, timeoutMs);
    unsub = await panel._hass.connection.subscribeEvents((event) => {
      if (done) return;
      const d = event.data;
      if (d.entity_id !== entityId) return;
      const newState = d.new_state?.state;
      if (!newState || newState === priorState || newState === 'unknown'
        || newState === 'unavailable' || newState.length < 4) return;
      done = true;
      clearTimeout(timer);
      unsub();
      resolve(newState);
    }, 'state_changed');
  });
}
