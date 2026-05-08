/**
 * utils.js — Pure helpers, DOM utilities, keyboard shortcuts, and app init
 *
 * Exports: isEndStruct(), getFiltered(), buildDepths(), uniqueLists(),
 *          makeTypeBadge(), buildUploadZone(), attachDrop(),
 *          esc(), safeId(), setF(), toast()
 * Side-effects: keyboard listener, initial upload zone render
 */

// ═══════════════════════════════════════════════════════════
// TYPE PREDICATES
// ═══════════════════════════════════════════════════════════

/**
 * Returns true only for structural "end" rows — end group / end repeat.
 * The bare type "end" is a metadata field (form end time) and must NOT
 * be treated as a group closer.
 */
function isEndStruct(row) {
  const t = row.type;
  return t === 'end group' || t === 'end repeat';
}

function isBeginStruct(row) {
  const bt = row.type.split(' ')[0];
  return bt === 'begin';
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function getFiltered() {
  const pl = S.labelCols[0] || 'label';
  return S.survey.map((row, i) => ({ row, i })).filter(({ row }) => {
    const bt = row.type.split(' ')[0];
    if (S.hideMeta && META.has(bt)) return false;
    if (S.search) {
      const q = S.search.toLowerCase();
      if (!(row.name || '').toLowerCase().includes(q) &&
          !(row[pl]  || '').toLowerCase().includes(q)) return false;
    }
    if (S.filter === 'select')   { if (!row.type.startsWith('select')) return false; }
    else if (S.filter === 'group') {
      // "group" filter shows only begin/end group|repeat rows — not the bare "end" metadata type
      if (!isBeginStruct(row) && !isEndStruct(row)) return false;
    }
    else if (S.filter === 'required') { if (row.required !== 'yes') return false; }
    else if (S.filter === 'logic')    { if (!row.relevant) return false; }
    return true;
  });
}

function buildDepths() {
  let d = 0;
  return S.survey.map(r => {
    if (isBeginStruct(r))  { const v = d; d++; return v; }
    if (isEndStruct(r))    { d = Math.max(0, d - 1); return d; }
    return d;
  });
}

function uniqueLists() {
  const seen = new Set(), lists = [];
  S.choices.forEach(r => {
    if (r.list_name && !seen.has(r.list_name)) { seen.add(r.list_name); lists.push(r.list_name); }
  });
  S.survey.forEach(r => {
    const p = r.type.split(' ');
    if ((p[0] === 'select_one' || p[0] === 'select_multiple') && p[1] && !seen.has(p[1])) {
      seen.add(p[1]); lists.push(p[1]);
    }
  });
  return lists;
}

function makeTypeBadge(bt, listName) {
  let cls = 'tb-text', label = bt;
  if (bt === 'begin') { cls = 'tb-group'; label = '▶ group'; }
  else if (bt === 'end' && listName) {
    // end group / end repeat — listName holds "group" or "repeat"
    cls = 'tb-end'; label = '◀ end ' + listName;
  }
  else if (bt === 'end') {
    // bare "end" metadata type
    cls = 'tb-meta'; label = 'end';
  }
  else if (bt === 'select_one')      { cls = 'tb-so';   label = 'select_one'; }
  else if (bt === 'select_multiple') { cls = 'tb-sm';   label = 'select_mult'; }
  else if (bt === 'integer' || bt === 'decimal' || bt === 'range') { cls = 'tb-int'; }
  else if (bt === 'note')   { cls = 'tb-note'; }
  else if (bt === 'calculate' || bt === 'hidden') { cls = 'tb-calc'; }
  else if (META.has(bt))    { cls = 'tb-meta'; }
  else if (['geopoint', 'geotrace', 'geoshape', 'start-geopoint'].includes(bt)) { cls = 'tb-geo'; }
  else if (['date', 'time', 'datetime'].includes(bt)) { cls = 'tb-date'; }
  else if (['image', 'audio', 'video', 'file'].includes(bt)) { cls = 'tb-media'; }
  return `<span class="type-badge ${cls}">${esc(label)}</span>`;
}

function buildUploadZone() {
  return `<div class="upload-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
    <div class="upload-icon">📋</div>
    <div class="upload-title">Open an XLSForm</div>
    <div class="upload-hint">Drop your .xlsx form here, or click to browse</div>
    <button class="btn primary" onclick="event.stopPropagation();document.getElementById('fileInput').click()">Choose file</button>
    <div class="upload-formats">
      <span class="fmt-badge">.xlsx</span>
      <span class="fmt-badge">.xls</span>
    </div>
  </div>`;
}

function attachDrop() {
  const dz = document.getElementById('dropZone');
  if (!dz) return;
  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('dragover');
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function safeId(s) { return btoa(encodeURIComponent(s)).replace(/[^a-zA-Z0-9]/g, '_'); }
function setF(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }

let _toastT;
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + (type || 'ok');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Keyboard shortcuts ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeEditModal(); closeChoiceModal(); }
  if (e.target.matches('input,select,textarea')) return;
  if (e.key === 'ArrowDown' && S.selectedIdx < S.survey.length - 1) selectRow(S.selectedIdx + 1);
  if (e.key === 'ArrowUp'   && S.selectedIdx > 0)                   selectRow(S.selectedIdx - 1);
  if (e.key === 'Enter'  && S.selectedIdx >= 0)                  openEditModal(S.selectedIdx);
  if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) openEditModal(S.selectedIdx, true);
  if (e.key === 'Delete' && S.selectedIdx >= 0)                   deleteSelected();
});

// ── Init ─────────────────────────────────────────────────────
document.getElementById('surveyViewContainer').innerHTML = buildUploadZone();
attachDrop();
window.addEventListener('load', () => {
  renderDocs();
  renderAbout();
});
