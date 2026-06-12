export const SMARTIR_LEARN_PANEL_CSS = `
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
