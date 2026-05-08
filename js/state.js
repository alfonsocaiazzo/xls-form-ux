/**
 * state.js — Application state, constants, and XLS import/parse logic
 *
 * Globals exposed: S (state object), META (set), APPEARANCES (array),
 *                  loadFile(), parseWB(), normalizeRow()
 */

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
const S = {
  survey: [], choices: [], settings: {},
  labelCols: [], hintCols: [], cMsgCols: [],
  selectedIdx: -1,
  view: 'table',
  filter: 'all',
  search: '',
  hideMeta: false,
  editIdx: -1,
  editIsNew: false,
  addAfterIdx: -1,
  activeList: null,
  currentTab: 'survey',
};
const META = new Set(['start','end','deviceid','username','today','phonenumber','subscriberid','simserial','audit','email','background-audio','start-geopoint']);
const APPEARANCES = ['','multiline','numbers','url','thousands-sep','printer','masked',
  'autocomplete','minimal','likert','label','list-nolabel','list','columns','columns-pack',
  'no-buttons','quick','search','field-list','table-list','month-year','year','no-calendar',
  'draw','annotate','signature','new','placement-map','maps','vertical','rating','no-ticks',
  'picker','counter'];

// ═══════════════════════════════════════════════════════════
// IMPORT
// ═══════════════════════════════════════════════════════════
document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
  e.target.value = '';
});
// Drop on sidebar
document.querySelector('.sidebar').addEventListener('dragover', e => e.preventDefault());
document.querySelector('.sidebar').addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});

function loadFile(file) {
  const r = new FileReader();
  r.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary', cellDates:true });
      parseWB(wb);
      toast(`Loaded: ${file.name}`);
    } catch(ex) { toast('Error reading file: ' + ex.message, 'err'); }
  };
  r.readAsBinaryString(file);
}

function parseWB(wb) {
  const sw = wb.Sheets['survey'];
  if (!sw) { toast('No "survey" sheet found','err'); return; }
  const raw = XLSX.utils.sheet_to_json(sw, { defval:'' });

  S.labelCols = []; S.hintCols = []; S.cMsgCols = [];
  if (raw.length) {
    Object.keys(raw[0]).forEach(k => {
      const lk = k.toLowerCase();
      if (lk === 'label' || lk.startsWith('label::') || lk.startsWith('label:')) S.labelCols.push(k);
      else if (lk === 'hint' || lk.startsWith('hint::') || lk.startsWith('hint:')) S.hintCols.push(k);
      else if (lk === 'constraint_message' || lk.startsWith('constraint_message::')) S.cMsgCols.push(k);
    });
  }
  if (!S.labelCols.length) S.labelCols = ['label'];
  if (!S.hintCols.length) S.hintCols = ['hint'];
  if (!S.cMsgCols.length) S.cMsgCols = ['constraint_message'];

  S.survey = raw.map(r => normalizeRow(r));

  const cw = wb.Sheets['choices'];
  S.choices = cw ? XLSX.utils.sheet_to_json(cw, { defval:'' }) : [];

  const setw = wb.Sheets['settings'];
  S.settings = setw ? (XLSX.utils.sheet_to_json(setw, { defval:'' })[0] || {}) : {};

  S.selectedIdx = -1;
  S.activeList = null;

  document.getElementById('addRowBtn').disabled = false;
  document.getElementById('exportBtn').disabled = false;
  document.getElementById('sidebarStats').style.display = '';
  document.getElementById('infoBar').classList.remove('hidden');
  document.getElementById('addRowBar').classList.remove('hidden');

  const title = S.settings.form_title || S.settings.name || 'Untitled Form';
  document.getElementById('formPill').textContent = title;

  renderAll();
  updateNavCounts();
}

function normalizeRow(raw) {
  const r = {};
  ['type','name','appearance','choice_filter','relevant','required','constraint',
   'parameters','calculation','trigger','repeat_count','read_only','default'].forEach(c => {
    r[c] = raw[c] !== undefined ? String(raw[c]).trim() : '';
  });
  [...S.labelCols, ...S.hintCols, ...S.cMsgCols].forEach(c => {
    r[c] = raw[c] !== undefined ? String(raw[c]).trim() : '';
  });
  Object.keys(raw).forEach(k => { if (!(k in r)) r[k] = raw[k]; });
  return r;
}

