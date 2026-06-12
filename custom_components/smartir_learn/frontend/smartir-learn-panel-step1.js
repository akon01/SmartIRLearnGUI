export function validateStep1(panel) {
  if (!panel._pickerVal('pickerLearnTrigger')) { alert('Select the "Learn trigger" entity.'); return false; }
  if (!panel._pickerVal('pickerLearnedCode')) { alert('Select the "Learned code output" entity.'); return false; }
  if (!panel._pickerVal('pickerSendCode')) { alert('Select the "Send IR code" entity.'); return false; }
  for (const id of ['manufacturer', 'model']) {
    if (!panel._$(id).value.trim()) { panel._$(id).focus(); alert('Fill in: ' + id); return false; }
  }
  if (!panel._getChecked('operationModes').length) { alert('Select at least one operation mode.'); return false; }
  if (!panel._getChecked('fanModes').length) { alert('Select at least one fan mode.'); return false; }
  return true;
}

export function buildConfig(panel) {
  const g = (id) => panel._$(id).value.trim();
  const learnE = panel._allEntities.find((e) => e.entity_id === panel._pickerVal('pickerLearnTrigger'));
  panel._st.config = {
    learnTriggerId: learnE.entity_id,
    learnTriggerDomain: learnE.domain,
    learnedCodeId: panel._pickerVal('pickerLearnedCode'),
    sendCodeId: panel._pickerVal('pickerSendCode'),
    manufacturer: g('manufacturer'),
    model: g('model'),
    minTemp: parseFloat(panel._$('minTemp').value),
    maxTemp: parseFloat(panel._$('maxTemp').value),
    precision: parseFloat(panel._$('precision').value),
    operationModes: panel._getChecked('operationModes'),
    fanModes: panel._getChecked('fanModes'),
  };
}
