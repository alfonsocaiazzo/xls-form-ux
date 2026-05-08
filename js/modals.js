/**
 * modals.js — Edit-question modal and Choice-list modal
 *
 * Exports: openEditModal(), closeEditModal(), saveEdit(), switchModalTab(),
 *          onTypeChange(), buildLabelSection(), openChoiceModal(),
 *          closeChoiceModal(), renderChoiceModalBody(),
 *          editChoiceInModal(), deleteChoiceInModal()
 */

// ═══════════════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════════════
let _modalTab = 'basic';

function openEditModal(idx, isNew) {
  S.editIdx    = idx;
  S.editIsNew  = isNew || false;
  S.addAfterIdx = isNew ? idx : -1;

  const row = (!isNew && idx >= 0) ? S.survey[idx] : null;
  document.getElementById('em-title').textContent = isNew ? 'Add Question' : `Edit: ${row?.name || ''}`;
  document.getElementById('em-sub').textContent   = isNew
    ? (idx >= 0 ? `Inserting after row ${idx + 1}` : 'Appending to end')
    : `Row ${idx + 1} · ${row?.type || ''}`;

  // Populate fields
  const t     = row?.type || 'text';
  const parts = t.split(' ');
  const bt    = parts[0];
  const ln    = parts.slice(1).join(' ');
  const tVal  = bt === 'begin' ? 'begin group' : bt === 'end' && ln ? 'end ' + ln : bt;

  setF('ef-type', tVal);
  onTypeChange();
  setF('ef-list', ln);
  setF('ef-name',            row?.name       || '');
  setF('ef-appearance',      row?.appearance  || '');
  setF('ef-required',        row?.required    || '');
  setF('ef-default',         row?.default     || '');
  setF('ef-relevant',        row?.relevant    || '');
  setF('ef-constraint',      row?.constraint  || '');
  setF('ef-constraint-msg',  row?.[S.cMsgCols[0]] || row?.constraint_message || '');
  setF('ef-calculation',     row?.calculation  || '');
  setF('ef-choice-filter',   row?.choice_filter || '');
  setF('ef-parameters',      row?.parameters   || '');
  setF('ef-repeat-count',    row?.repeat_count  || '');
  setF('ef-read-only',       row?.read_only     || '');
  setF('ef-trigger',         row?.trigger       || '');

  // Label / hint / constraint-message fields (one textarea per language)
  document.getElementById('ef-label-fields').innerHTML =
    buildLabelSection('Labels', S.labelCols, 'lf', row, 'label');
  document.getElementById('ef-hint-fields').innerHTML =
    buildLabelSection('Hints', S.hintCols, 'hf', row, 'hint');
  document.getElementById('ef-cmsg-fields').innerHTML =
    buildLabelSection('Constraint Messages', S.cMsgCols, 'cmf', row, 'constraint_message');

  // For calculate type: jump straight to Logic tab and mark Calculation required
  if (bt === 'calculate') {
    switchModalTab('logic');
    _highlightCalcField(true);
  } else {
    switchModalTab('basic');
    _highlightCalcField(false);
  }

  document.getElementById('editOverlay').classList.add('open');
}

/** Visually marks the Calculation field as required (red label + border hint). */
function _highlightCalcField(on) {
  const lbl = document.querySelector('label[for="ef-calculation"]');
  const inp = document.getElementById('ef-calculation');
  if (!lbl || !inp) return;
  if (on) {
    lbl.innerHTML = 'Calculation <span class="req" title="Required for calculate type">*</span>';
    inp.style.borderColor = 'var(--sdg-red)';
    inp.placeholder = 'Required — e.g. ${age} * 12   or   once(random())';
  } else {
    lbl.innerHTML = 'Calculation';
    inp.style.borderColor = '';
    inp.placeholder = 'XPath expression or once(random())';
  }
}

function buildLabelSection(title, cols, prefix, row, fallback) {
  let h = `<div style="font-size:9px;font-weight:700;text-transform:uppercase;
    letter-spacing:.08em;color:var(--text3);padding:10px 0 6px;
    border-bottom:1px solid var(--surface3);margin-bottom:10px">${title}</div>`;
  cols.forEach(col => {
    const lang = col.toLowerCase() === fallback
      ? 'Default'
      : col.replace(new RegExp(`${fallback}::`, 'i'), '');
    const val = esc(row?.[col] || '');
    const sid = safeId(prefix + col);
    h += `<div class="field" style="margin-bottom:10px">
      <label class="field-label">${esc(lang)}</label>
      <textarea class="fi" id="${sid}" rows="2">${val}</textarea>
    </div>`;
  });
  return h;
}

function onTypeChange() {
  const t     = document.getElementById('ef-type').value;
  const isSel = t === 'select_one' || t === 'select_multiple';
  const isCalc = t === 'calculate';

  document.getElementById('ef-list-wrap').style.display = isSel ? '' : 'none';
  if (isSel) {
    const lists = uniqueLists();
    document.getElementById('ef-list').innerHTML =
      lists.map(l => `<option>${esc(l)}</option>`).join('');
  }

  // When switching to calculate, immediately show the Logic tab and mark field required
  if (isCalc) {
    switchModalTab('logic');
    _highlightCalcField(true);
  } else {
    _highlightCalcField(false);
  }
}

function switchModalTab(tab) {
  _modalTab = tab;
  document.querySelectorAll('.modal-tab').forEach(b =>
    b.classList.toggle('active', b.getAttribute('onclick').includes(`'${tab}'`)));
  document.querySelectorAll('.modal-pane').forEach(p =>
    p.classList.toggle('active', p.id === 'mp-' + tab));
}

function saveEdit() {
  const tBase    = document.getElementById('ef-type').value;
  const calcVal  = document.getElementById('ef-calculation').value.trim();
  let fullType   = tBase;

  if (tBase === 'select_one' || tBase === 'select_multiple') {
    const list = document.getElementById('ef-list').value;
    if (list) fullType = tBase + ' ' + list;
  }

  const name = document.getElementById('ef-name').value.trim();
  if (!name) { toast('Name is required', 'err'); return; }

  // Warn (not block) if calculate has no formula
  if (tBase === 'calculate' && !calcVal) {
    if (!confirm('This "calculate" question has no Calculation formula.\nSave anyway?')) return;
  }

  const row = {
    type:         fullType,
    name,
    appearance:   document.getElementById('ef-appearance').value,
    required:     document.getElementById('ef-required').value,
    default:      document.getElementById('ef-default').value,
    relevant:     document.getElementById('ef-relevant').value,
    constraint:   document.getElementById('ef-constraint').value,
    calculation:  calcVal,
    choice_filter: document.getElementById('ef-choice-filter').value,
    parameters:   document.getElementById('ef-parameters').value,
    repeat_count: document.getElementById('ef-repeat-count').value,
    read_only:    document.getElementById('ef-read-only').value,
    trigger:      document.getElementById('ef-trigger').value,
  };

  S.cMsgCols.forEach(c => { row[c] = document.getElementById(safeId('cmf' + c))?.value || ''; });
  S.labelCols.forEach(c => { row[c] = document.getElementById(safeId('lf'  + c))?.value || ''; });
  S.hintCols.forEach(c  => { row[c] = document.getElementById(safeId('hf'  + c))?.value || ''; });
  row.constraint_message = row[S.cMsgCols[0] || 'constraint_message'] || '';

  if (S.editIsNew) {
    const at = S.addAfterIdx >= 0 ? S.addAfterIdx + 1 : S.survey.length;
    S.survey.splice(at, 0, row);
    S.selectedIdx = at;
    toast('Question added');
  } else {
    const orig = S.survey[S.editIdx];
    Object.keys(orig).forEach(k => { if (!(k in row)) row[k] = orig[k]; });
    S.survey[S.editIdx] = row;
    toast('Question saved');
  }

  closeEditModal();
  renderAll();
}

function closeEditModal() {
  document.getElementById('editOverlay').classList.remove('open');
}


// ═══════════════════════════════════════════════════════════
// CHOICE MODAL (inline viewer / editor)
// ═══════════════════════════════════════════════════════════
function openChoiceModal(listName, questionName) {
  document.getElementById('cm-title').textContent = listName;
  document.getElementById('cm-sub').textContent   = `Used by: ${questionName}`;
  S.activeList = listName;

  document.getElementById('cm-add-btn').onclick = () => {
    const name = prompt('Item name:');
    if (!name) return;
    const label = prompt('Label:') || '';
    const lk    = S.labelCols[0] || 'label';
    const ni    = { list_name: listName, name: name.trim() };
    S.labelCols.forEach(c => { ni[c] = c === lk ? label : ''; });
    S.choices.push(ni);
    renderChoiceModalBody(listName);
    toast('Item added');
  };

  renderChoiceModalBody(listName);
  document.getElementById('choiceOverlay').classList.add('open');
}

function renderChoiceModalBody(listName) {
  const items     = S.choices.filter(c => c.list_name === listName);
  const keys      = [...new Set(items.flatMap(i => Object.keys(i)))].filter(k => k !== 'list_name');
  const labelCols = keys.filter(k => k.toLowerCase().startsWith('label') || k === 'label');
  const extraCols = keys.filter(k =>
    k !== 'name' &&
    !k.toLowerCase().startsWith('label') &&
    !k.toLowerCase().startsWith('image') &&
    !k.toLowerCase().startsWith('big-image'));

  const html = items.length
    ? `<div class="table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr>
            <th>name</th>
            ${labelCols.map(c => `<th>${esc(c.replace(/label::/i, ''))}</th>`).join('')}
            ${extraCols.map(c => `<th>${esc(c)}</th>`).join('')}
            <th style="width:60px"></th>
          </tr></thead>
          <tbody>
            ${items.map(item => {
              const gi = S.choices.indexOf(item);
              return `<tr>
                <td><span style="font-family:var(--mono);font-size:11px;color:var(--green-dark);font-weight:600">${esc(item.name)}</span></td>
                ${labelCols.map(c => `<td>${esc(item[c] || '')}</td>`).join('')}
                ${extraCols.map(c => `<td style="font-family:var(--mono);font-size:10px;color:var(--text3)">${esc(String(item[c] || ''))}</td>`).join('')}
                <td>
                  <button class="btn-icon" onclick="editChoiceInModal(${gi},'${esc(listName)}')"                             title="Edit">✏</button>
                  <button class="btn-icon" style="color:var(--red)" onclick="deleteChoiceInModal(${gi},'${esc(listName)}')"  title="Delete">✕</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`
    : `<div class="empty"><div class="empty-title">No items yet</div></div>`;

  document.getElementById('cm-body').innerHTML = html;
}

function editChoiceInModal(gi, listName) {
  editChoiceItem(gi);
  renderChoiceModalBody(listName);
}
function deleteChoiceInModal(gi, listName) {
  deleteChoiceItem(gi);
  renderChoiceModalBody(listName);
}
function closeChoiceModal() {
  document.getElementById('choiceOverlay').classList.remove('open');
}


// ═══════════════════════════════════════════════════════════
// INTERACTIONS (filter chips, search, view toggle)
// ═══════════════════════════════════════════════════════════
document.getElementById('filterChips')?.addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  S.filter = chip.dataset.filter;
  renderAll();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      S.filter = c.dataset.filter;
      renderAll();
    });
  });
});

document.getElementById('searchInput').addEventListener('input',  e => { S.search   = e.target.value;   renderAll(); });
document.getElementById('hideMeta').addEventListener('change',    e => { S.hideMeta = e.target.checked; renderAll(); });

function setView(v) {
  S.view = v;
  document.getElementById('vb-table').classList.toggle('active', v === 'table');
  document.getElementById('vb-cards').classList.toggle('active', v === 'cards');
  renderAll();
}
