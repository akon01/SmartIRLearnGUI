export function buildExport(panel) {
  const { manufacturer, model, minTemp, maxTemp, precision, operationModes, fanModes } = panel._st.config;
  const json = {
    manufacturer,
    supportedModels: [model],
    supportedController: 'MQTT',
    commandsEncoding: 'Raw',
    minTemperature: minTemp,
    maxTemperature: maxTemp,
    precision,
    operationModes,
    fanModes,
    commands: panel._st.codes,
  };
  const jsonStr = JSON.stringify(json, null, 2);
  panel._$('jsonPreview').textContent = jsonStr;
  const learned = panel._st.queue.filter((i) => i.status === 'done').length;
  panel._$('exportSummary').innerHTML = `
    <strong>Manufacturer:</strong> ${manufacturer}<br/>
    <strong>Model:</strong> ${model}<br/>
    <strong>Temperature:</strong> ${minTemp}°C – ${maxTemp}°C (step ${precision}°C)<br/>
    <strong>Operation modes:</strong> ${operationModes.join(', ')}<br/>
    <strong>Fan modes:</strong> ${fanModes.join(', ')}<br/>
    <strong>Codes learned:</strong> ${learned} / ${panel._st.queue.length}`;
  panel._$('btnDownload').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    a.download = `${manufacturer.toLowerCase().replace(/\s+/g, '_')}_${model.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };
}
