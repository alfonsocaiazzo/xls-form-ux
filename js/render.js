/**
 * render.js — Tab switching, renderAll(), table view, and cards view
 *
 * Exports: showTab(), renderAll(), renderTable(), renderCards(),
 *          updateNavCounts(), updateSidebarStats(), selectRow(), setView()
 */

// ═══════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════
function showTab(name) {
  S.currentTab = name;

  // Hide all panels and deactivate all tab/nav buttons
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));

  // Activate the target panel
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');

  // Activate matching editor tab button
  const et = document.getElementById('et-' + name);
  if (et) et.classList.add('active');

  // Activate matching sidebar nav item (matched by onclick attribute content)
  document.querySelectorAll('.nav-item').forEach(b => {
    const oc = b.getAttribute('onclick') || '';
    if (oc.includes("'" + name + "'")) b.classList.add('active');
  });

  // Trigger panel-specific render
  if (name === 'groups')   renderGroups();
  if (name === 'choices')  renderChoicesPanel();
  if (name === 'settings') renderSettings();
  if (name === 'docs')     renderDocs();
  if (name === 'validate') runValidation();
}

// ═══════════════════════════════════════════════════════════
// RENDER ALL
// ═══════════════════════════════════════════════════════════
function renderAll() {
  if (S.view === 'table') renderTable();
  else renderCards();
  updateNavCounts();
  updateSidebarStats();
}

function updateNavCounts() {
  const ng = S.survey.filter(r => r.type.startsWith('begin')).length;
  const nc = uniqueLists().length;
  document.getElementById('nc-survey').textContent  = S.survey.length;
  document.getElementById('nc-groups').textContent  = ng;
  document.getElementById('nc-choices').textContent = nc;
}

function updateSidebarStats() {
  if (!S.survey.length) return;
  const nq = S.survey.filter(r =>
    !META.has(r.type.split(' ')[0]) &&
    !r.type.startsWith('begin') &&
    !r.type.startsWith('end')).length;
  const ng = S.survey.filter(r => r.type.startsWith('begin')).length;
  const ns = S.survey.filter(r => r.type.startsWith('select')).length;
  const nc = uniqueLists().length;
  document.getElementById('ss-q').textContent = nq;
  document.getElementById('ss-g').textContent = ng;
  document.getElementById('ss-s').textContent = ns;
  document.getElementById('ss-c').textContent = nc;
  const langs = S.labelCols
    .map(c => c === 'label' ? 'default' : c.replace(/label::/i, ''))
    .join(', ');
  document.getElementById('ss-l').textContent = langs;
}

// ═══════════════════════════════════════════════════════════
// TABLE VIEW
// ═══════════════════════════════════════════════════════════
function renderTable() {
  const filtered = getFiltered();
  const depths   = buildDepths();
  const pl = S.labelCols[0] || 'label';
  const vc = document.getElementById('surveyViewContainer');

  document.getElementById('ib-vis').textContent = filtered.length;
  document.getElementById('ib-tot').textContent = S.survey.length;
  document.getElementById('ib-sel').textContent =
    S.selectedIdx >= 0 ? (S.survey[S.selectedIdx]?.name || '—') : '—';
  const langs = S.labelCols
    .map(c => c === 'label' ? 'Default' : c.replace(/label::/i, ''))
    .join(', ');
  document.getElementById('ib-langs').textContent = 'Languages: ' + langs;

  if (!S.survey.length) {
    vc.innerHTML = buildUploadZone();
    attachDrop();
    return;
  }
  if (!filtered.length) {
    vc.innerHTML = `<div class="empty">
      <div class="empty-title">No results</div>
      <div class="empty-sub">Try a different search or filter</div>
    </div>`;
    return;
  }

  const COLS = 11; // number of <th> columns — used for colSpan on insert rows

  let html = `<table class="survey-table"><thead><tr>
    <th style="width:32px">#</th>
    <th style="width:140px">Type</th>
    <th style="width:145px">Name</th>
    <th style="width:100px">Appearance</th>
    <th style="width:36px" title="Required">✱</th>
    <th style="min-width:180px">Label</th>
    <th style="width:155px">Relevant</th>
    <th style="width:130px">Calculation</th>
    <th style="width:125px">Constraint</th>
    <th style="width:115px">Parameters</th>
    <th style="width:72px"></th>
  </tr></thead><tbody>`;

  // Insert-before-first indicator
  html += insertRowHTML(-1, COLS);

  filtered.forEach(({ row, i }) => {
    const depth    = depths[i] || 0;
    const bt       = row.type.split(' ')[0];
    const listName = row.type.split(' ').slice(1).join(' ');
    const isMeta   = META.has(bt);
    const isGB     = bt === 'begin';
    const isGE     = bt === 'end';
    const label    = row[pl] || '';
    const isEven   = i % 2 === 0;

    let rclass = isEven ? 'r-even' : 'r-odd';
    if (isGB)  rclass += ' r-group-begin';
    if (isGE)  rclass += ' r-group-end';
    if (isMeta) rclass += ' r-meta';
    if (i === S.selectedIdx) rclass += ' r-selected';

    const indent    = depth > 0
      ? `<span class="indent-block" style="width:${depth * 14}px;display:inline-block;"></span>`
      : '';
    const typeBadge = makeTypeBadge(bt, listName);

    let listCell = '';
    if ((bt === 'select_one' || bt === 'select_multiple') && listName) {
      listCell = `<div style="margin-top:3px">
        <button class="list-link"
          onclick="event.stopPropagation();openChoiceModal('${esc(listName)}','${esc(row.name)}')">
          ⊕ ${esc(listName)}
        </button>
      </div>`;
    }

    const appOpts = APPEARANCES
      .map(a => `<option${a === row.appearance ? ' selected' : ''}>${esc(a)}</option>`)
      .join('');

    html += `<tr class="${rclass}" data-idx="${i}"
        onclick="selectRow(${i})" ondblclick="openEditModal(${i})">
      <td style="font-family:var(--mono);font-size:10px;color:var(--text3);text-align:right;padding-right:6px">${i + 1}</td>
      <td>${indent}${typeBadge}${listCell}</td>
      <td><span class="cell-name" title="${esc(row.name)}">${esc(row.name)}</span></td>
      <td>
        <select style="width:96%;font-size:11px;padding:2px 5px;height:24px"
          onclick="event.stopPropagation()"
          onchange="event.stopPropagation();S.survey[${i}].appearance=this.value"
          >${appOpts}</select>
      </td>
      <td class="cell-req">${row.required === 'yes' ? '<span class="req-star">✱</span>' : ''}</td>
      <td><span class="cell-label"   title="${esc(label)}">${esc(label)}</span></td>
      <td><span class="cell-formula" title="${esc(row.relevant)}">${esc(row.relevant)}</span></td>
      <td><span class="cell-formula" title="${esc(row.calculation)}">${esc(row.calculation)}</span></td>
      <td><span class="cell-formula" title="${esc(row.constraint)}">${esc(row.constraint)}</span></td>
      <td><span class="cell-formula" title="${esc(row.parameters)}">${esc(row.parameters)}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn-icon"
            onclick="event.stopPropagation();openEditModal(${i})"
            title="Edit">✏</button>
          <button class="btn-icon" style="color:var(--red)"
            onclick="event.stopPropagation();deleteRow(${i})"
            title="Delete">✕</button>
        </div>
      </td>
    </tr>`;

    // Insert-after-row indicator
    html += insertRowHTML(i, COLS);
  });

  html += `</tbody></table>`;
  vc.innerHTML = `<div class="table-wrap">${html}</div>`;
}

/**
 * Returns HTML for a hoverable "Insert here" spacer row.
 * afterIdx = -1  → insert before all rows (position 0)
 * afterIdx = i   → insert after survey row i (position i+1)
 */
function insertRowHTML(afterIdx, cols) {
  const label = afterIdx < 0
    ? 'Insert at top'
    : `Insert after row ${afterIdx + 1}`;
  return `<tr class="insert-row">
    <td colspan="${cols}">
      <button class="insert-row-btn"
        title="${label}"
        onclick="event.stopPropagation();openEditModal(${afterIdx}, true)"></button>
    </td>
  </tr>`;
}

// ═══════════════════════════════════════════════════════════
// CARDS VIEW
// ═══════════════════════════════════════════════════════════
function renderCards() {
  const filtered = getFiltered();
  const depths   = buildDepths();
  const pl = S.labelCols[0] || 'label';
  const vc = document.getElementById('surveyViewContainer');

  document.getElementById('ib-vis').textContent = filtered.length;
  document.getElementById('ib-tot').textContent = S.survey.length;

  if (!S.survey.length) { vc.innerHTML = buildUploadZone(); attachDrop(); return; }
  if (!filtered.length) {
    vc.innerHTML = `<div class="empty"><div class="empty-title">No results</div></div>`;
    return;
  }

  let html = `<div class="content"><div class="cards-grid">`;

  filtered.forEach(({ row, i }) => {
    const bt       = row.type.split(' ')[0];
    const listName = row.type.split(' ').slice(1).join(' ');
    const label    = row[pl] || '';
    const isMeta   = META.has(bt);
    const isGroup  = bt === 'begin' || bt === 'end';
    const depth    = depths[i] || 0;

    const props = [];
    if (row.appearance) props.push(['appearance', row.appearance, '']);
    if (row.required === 'yes') props.push(['required', '✱ yes', '']);
    if (row.relevant)    props.push(['relevant',    row.relevant,    'mono']);
    if (row.calculation) props.push(['calculation', row.calculation, 'mono']);
    if (row.constraint)  props.push(['constraint',  row.constraint,  'mono']);
    if (row.parameters)  props.push(['parameters',  row.parameters,  'mono']);
    S.hintCols.filter(h => row[h]).forEach(h =>
      props.push([h.replace(/hint::/i, 'hint:'), row[h], '']));
    const extraLabels = S.labelCols.slice(1)
      .map(l => [l.replace(/label::/i, ''), row[l]])
      .filter(([, v]) => v);

    let choicesHTML = '';
    if ((bt === 'select_one' || bt === 'select_multiple') && listName) {
      const items   = S.choices.filter(c => c.list_name === listName);
      const lc      = Object.keys(items[0] || {}).find(k => k.toLowerCase().startsWith('label')) || 'label';
      const preview = items.slice(0, 5);
      const more    = items.length - 5;
      choicesHTML = `<div class="card-choices">
        <div class="card-choices-header">
          <span class="card-choices-name">${esc(listName)}</span>
          <button class="list-link" onclick="openChoiceModal('${esc(listName)}','${esc(row.name)}')">Edit →</button>
        </div>
        <div class="choice-chips">
          ${preview.map(c =>
            `<span class="choice-chip">${esc(c.name)}
              <span style="color:var(--text3);font-family:inherit;font-weight:400">${esc(c[lc] || '')}</span>
            </span>`).join('')}
          ${more > 0 ? `<span style="font-size:10px;color:var(--text3);padding:2px 5px">+${more} more</span>` : ''}
        </div>
      </div>`;
    }

    html += `<div class="q-card${isGroup ? ' card-group' : ''}${isMeta ? ' card-meta' : ''}" data-idx="${i}">
      <div class="card-head">
        <div>
          ${makeTypeBadge(bt, listName)}
          ${depth > 0 ? `<div style="font-size:9px;color:var(--text3);margin-top:3px;font-family:var(--mono)">depth ${depth}</div>` : ''}
        </div>
        <div class="card-head-info">
          <div class="card-name">${esc(row.name)}</div>
          <div class="card-label-text">${esc(label)}</div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" onclick="openEditModal(${i})"        title="Edit">✏</button>
          <button class="btn-icon" onclick="openEditModal(${i}, true)"  title="Add after">＋</button>
          <button class="btn-icon" style="color:var(--red)" onclick="deleteRow(${i})" title="Delete">✕</button>
        </div>
      </div>
      ${(props.length || extraLabels.length) ? `<div class="card-props">
        ${extraLabels.map(([l, v]) =>
          `<span class="prop-k">${esc(l)}</span><span class="prop-v">${esc(v)}</span>`).join('')}
        ${props.map(([k, v, c]) =>
          `<span class="prop-k">${esc(k)}</span><span class="prop-v ${c}">${esc(v)}</span>`).join('')}
      </div>` : ''}
      ${choicesHTML}
    </div>`;
  });

  html += `</div></div>`;
  vc.innerHTML = html;
}
