/**
 * panels.js — Groups tree, Choices panel, Settings panel, Validation, Export
 *
 * Exports: renderGroups(), renderChoicesPanel(), renderChoicesMain(),
 *          newChoiceList(), addChoiceItem(), editChoiceItem(), deleteChoiceItem(),
 *          deleteChoiceList(), renderSettings(), runValidation(), exportXLSX(),
 *          moveRow(), deleteRow(), deleteSelected(), scrollToSurveyRow()
 *
 * NOTE: isEndStruct(row) from utils.js must be used instead of (bt === 'end')
 * wherever group/repeat closing logic is needed. The bare type "end" is the
 * ODK metadata field that records form end time — it is NOT a group closer.
 */

// ═══════════════════════════════════════════════════════════
// GROUPS TREE
// ═══════════════════════════════════════════════════════════
function renderGroups() {
  const gc = document.getElementById('groupsContent');
  if (!S.survey.length) {
    gc.innerHTML = `<div class="empty"><div class="empty-title">No form loaded</div></div>`;
    return;
  }

  const pl          = S.labelCols[0] || 'label';
  const depths      = buildDepths();
  const depthColors = ['var(--green)', 'var(--sdg-blue)', 'var(--yellow-dark)', 'var(--sdg-red)', 'var(--purple)'];

  // Count questions inside each begin group
  const stack = [], qCounts = {};
  S.survey.forEach((row, i) => {
    if (isBeginStruct(row)) {
      stack.push({ name: row.name, idx: i, count: 0 });
    } else if (isEndStruct(row)) {
      if (stack.length) {
        const top = stack.pop();
        qCounts[top.idx] = top.count;
      }
    } else {
      stack.forEach(s => s.count++);
    }
  });

  let html = `<div class="card" style="margin-bottom:16px">
    <div class="card-header">
      <span class="card-title">Group Structure — Visual Tree</span>
      <div style="display:flex;gap:12px;font-size:11px;color:var(--text3)">
        ${depthColors.map((c, i) =>
          `<span style="display:flex;align-items:center;gap:4px">
            <span style="width:10px;height:10px;background:${c};display:inline-block;border-radius:1px"></span>
            Depth ${i}
          </span>`).join('')}
      </div>
    </div>
    <div class="card-body" style="padding:0">
      <div class="group-tree-container">`;

  S.survey.forEach((row, i) => {
    const bt    = row.type.split(' ')[0];
    const depth = depths[i] || 0;
    const label = row[pl] || '';
    const dc    = depthColors[Math.min(depth, depthColors.length - 1)];

    // Skip bare metadata types (start, end, deviceid…) from the tree
    if (META.has(bt) && !isBeginStruct(row) && !isEndStruct(row)) return;

    const isBegin = isBeginStruct(row);
    const isEnd   = isEndStruct(row);

    let rowClass  = 'gtree-row';
    if (isBegin) rowClass += ' gt-begin';
    else if (isEnd) rowClass += ' gt-end';
    else rowClass += ' gt-question';

    const listName  = row.type.split(' ').slice(1).join(' ');
    const badgeHTML = makeTypeBadge(bt, listName);

    let metaHTML = '';
    if (isBegin) {
      const count = qCounts[i] || 0;
      metaHTML = `<div class="gtree-meta">
        ${row.relevant ? `<span class="gtree-rel" title="${esc(row.relevant)}">${esc(row.relevant)}</span>` : ''}
        <span class="gtree-count">${count} Qs</span>
      </div>`;
    } else if (isEnd) {
      metaHTML = `<div class="gtree-meta">
        <span style="font-size:9px;color:var(--text3)">${esc(row.type)}</span>
      </div>`;
    }

    html += `<div class="${rowClass}"
        style="border-left:4px solid ${dc};padding-left:${10 + depth * 20}px"
        onclick="scrollToSurveyRow(${i})">
      <div class="gtree-badge">${badgeHTML}</div>
      <span class="gtree-name">${esc(row.name)}</span>
      <span class="gtree-label">${esc(label)}</span>
      ${metaHTML}
    </div>`;
  });

  html += `</div></div></div>`;

  // Group summary cards
  const groups = S.survey.filter(r => isBeginStruct(r));
  if (groups.length) {
    html += `<div class="card">
      <div class="card-header"><span class="card-title">Group Summary</span></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">`;
    groups.forEach(g => {
      const idx   = S.survey.indexOf(g);
      const depth = depths[idx] || 0;
      const count = qCounts[idx] || 0;
      const dc    = depthColors[Math.min(depth, depthColors.length - 1)];
      const label = g[pl] || '';
      html += `<div style="background:var(--surface2);border:1px solid var(--border);
                  border-left:4px solid ${dc};border-radius:var(--radius);
                  padding:10px 12px;cursor:pointer"
                onclick="scrollToSurveyRow(${idx})">
        <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--green-dark);margin-bottom:3px">${esc(g.name)}</div>
        <div style="font-size:11px;color:var(--text2);margin-bottom:6px">${esc(label)}</div>
        <div style="display:flex;gap:10px;font-size:10px;color:var(--text3)">
          <span>Depth: <strong style="color:${dc}">${depth}</strong></span>
          <span>Questions: <strong>${count}</strong></span>
          ${g.relevant ? `<span>Has logic</span>` : ''}
        </div>
      </div>`;
    });
    html += `</div></div></div>`;
  }

  gc.innerHTML = html;
}

function scrollToSurveyRow(idx) {
  showTab('survey');
  S.selectedIdx = idx;
  setTimeout(() => {
    const tr = document.querySelector(`tr[data-idx="${idx}"]`);
    if (tr) { tr.scrollIntoView({ behavior: 'smooth', block: 'center' }); selectRow(idx); }
  }, 80);
}

// ═══════════════════════════════════════════════════════════
// CHOICES PANEL
// ═══════════════════════════════════════════════════════════
function renderChoicesPanel() {
  const lists = uniqueLists();
  const nav   = document.getElementById('choicesNav');

  if (!lists.length) {
    nav.innerHTML = `<div style="padding:12px;font-size:11px;color:var(--text3)">No choice lists</div>`;
    document.getElementById('choicesMain').innerHTML =
      `<div class="empty"><div class="empty-title">No choices found</div>
       <div class="empty-sub">Load a form or add a list</div></div>`;
    return;
  }
  if (!S.activeList || !lists.includes(S.activeList)) S.activeList = lists[0];

  nav.innerHTML = lists.map(l => {
    const count = S.choices.filter(c => c.list_name === l).length;
    return `<div class="list-nav-item${l === S.activeList ? ' active' : ''}"
        onclick="S.activeList='${esc(l)}';renderChoicesPanel()">
      <span class="list-nav-name">${esc(l)}</span>
      <span class="list-nav-count">${count}</span>
    </div>`;
  }).join('');

  renderChoicesMain();
}

function renderChoicesMain() {
  const main = document.getElementById('choicesMain');
  const list = S.activeList;
  if (!list) return;

  const items     = S.choices.filter(c => c.list_name === list);
  const keys      = [...new Set(items.flatMap(i => Object.keys(i)))].filter(k => k !== 'list_name');
  const labelCols = keys.filter(k => k.toLowerCase().startsWith('label') || k === 'label');
  const extraCols = keys.filter(k =>
    k !== 'name' &&
    !k.toLowerCase().startsWith('label') &&
    !k.toLowerCase().startsWith('image') &&
    !k.toLowerCase().startsWith('big-image'));

  const usedBy = S.survey
    .filter(r => r.type.split(' ')[1] === list)
    .map(r => r.name);

  let html = `<div class="card">
    <div class="card-header">
      <span class="card-title" style="font-family:var(--mono)">${esc(list)}</span>
      <div style="display:flex;gap:8px;align-items:center">
        ${usedBy.length
          ? `<span style="font-size:10px;color:var(--text3)">Used by:
              ${usedBy.map(n => `<span style="font-family:var(--mono);font-weight:700;color:var(--green-dark)">${esc(n)}</span>`).join(', ')}
             </span>`
          : ''}
        <button class="btn primary btn-sm" onclick="addChoiceItem()">＋ Add item</button>
        <button class="btn danger btn-sm"  onclick="deleteChoiceList()">Delete list</button>
      </div>
    </div>
    <div class="card-body" style="padding:0">
      <div class="table-wrap">
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
                  <button class="btn-icon" onclick="editChoiceItem(${gi})"                            title="Edit">✏</button>
                  <button class="btn-icon" style="color:var(--red)" onclick="deleteChoiceItem(${gi})" title="Delete">✕</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
  main.innerHTML = html;
}

function newChoiceList() {
  const name = prompt('List name (no spaces):');
  if (!name || !name.trim()) return;
  const lk = S.labelCols[0] || 'label';
  S.choices.push({ list_name: name.trim(), name: 'option_1', [lk]: 'Option 1' });
  S.activeList = name.trim();
  renderChoicesPanel();
  updateNavCounts();
  toast('List created');
}
function addChoiceItem() {
  const name = prompt('Item name:');
  if (!name) return;
  const label  = prompt('Label:') || '';
  const lk     = S.labelCols[0] || 'label';
  const newItem = { list_name: S.activeList, name: name.trim() };
  S.labelCols.forEach(c => { newItem[c] = c === lk ? label : ''; });
  S.choices.push(newItem);
  renderChoicesMain();
  document.querySelectorAll('.list-nav-item').forEach(el => {
    if (el.querySelector('.list-nav-name')?.textContent === S.activeList)
      el.querySelector('.list-nav-count').textContent =
        S.choices.filter(c => c.list_name === S.activeList).length;
  });
  toast('Item added');
}
function editChoiceItem(gi) {
  const item    = S.choices[gi];
  const lk      = S.labelCols[0] || 'label';
  const newName = prompt('Name:', item.name);
  if (newName === null) return;
  const newLabel = prompt('Label:', item[lk] || '');
  if (newLabel === null) return;
  item.name = newName.trim();
  item[lk]  = newLabel;
  renderChoicesMain();
}
function deleteChoiceItem(gi) {
  if (!confirm('Delete this choice item?')) return;
  S.choices.splice(gi, 1);
  renderChoicesMain();
  toast('Item deleted');
}
function deleteChoiceList() {
  if (!confirm(`Delete all items in "${S.activeList}"?`)) return;
  S.choices    = S.choices.filter(c => c.list_name !== S.activeList);
  S.activeList = null;
  renderChoicesPanel();
  updateNavCounts();
  toast('List deleted');
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
function renderSettings() {
  const fields = [
    { key: 'form_title',       label: 'Form Title' },
    { key: 'form_id',          label: 'Form ID' },
    { key: 'name',             label: 'Name' },
    { key: 'version',          label: 'Version' },
    { key: 'default_language', label: 'Default Language' },
    { key: 'style',            label: 'Style', opts: ['', 'pages', 'theme-grid'] },
    { key: 'instance_name',    label: 'Instance Name' },
    { key: 'submission_url',   label: 'Submission URL' },
    { key: 'public_key',       label: 'Public Key' },
  ];
  const sf = document.getElementById('settingsForm');
  sf.innerHTML = fields.map(f => {
    const val = esc(String(S.settings[f.key] || ''));
    if (f.opts) {
      const opts = f.opts.map(o =>
        `<option${o === String(S.settings[f.key] || '') ? ' selected' : ''}>${o}</option>`).join('');
      return `<div class="field">
        <label class="field-label">${f.label}</label>
        <select class="fi" onchange="S.settings['${f.key}']=this.value">${opts}</select>
      </div>`;
    }
    return `<div class="field">
      <label class="field-label">${f.label}</label>
      <input class="fi" value="${val}" oninput="S.settings['${f.key}']=this.value">
    </div>`;
  }).join('');

  // Update the languages card (static element in HTML)
  const lb = document.getElementById('settingsLangsBody');
  if (lb) {
    lb.innerHTML = S.labelCols.length
      ? S.labelCols.map(c => {
          const lang = c === 'label' ? 'Default' : c.replace(/label::/i, '');
          return `<span style="display:inline-flex;align-items:center;gap:5px;
                    background:var(--green-bg);border:1px solid #a8dfc2;border-radius:2px;
                    padding:3px 10px;font-size:11px;font-weight:700;margin:3px;
                    color:var(--green-dark)">🌐 ${esc(lang)}</span>`;
        }).join('')
      : '<span style="color:var(--text3);font-size:12px">No languages detected.</span>';
  }
}

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Extract all ${name} references from an XPath/label expression string.
 * Returns an array of name strings (without the ${ } wrapper).
 */
function extractRefs(expr) {
  if (!expr) return [];
  const matches = expr.matchAll(/\$\{([^}]+)\}/g);
  return [...matches].map(m => m[1].trim());
}

function runValidation() {
  const errors   = [];
  const warnings = [];
  const oks      = [];
  const pl       = S.labelCols[0] || 'label';
  const snakeRe  = /^[a-z][a-z0-9_]*$/;

  if (!S.survey.length) {
    document.getElementById('validationList').innerHTML =
      `<div class="empty"><div class="empty-title">No form loaded</div></div>`;
    document.getElementById('valStats').style.display = 'none';
    return;
  }

  // Build the set of all defined question names for reference checking
  const definedNames = new Set(S.survey.map(r => r.name).filter(Boolean));

  const names = {};

  // ── Pass 1: per-row checks ──────────────────────────────
  S.survey.forEach((row, i) => {
    const bt      = row.type.split(' ')[0];
    const isMeta  = META.has(bt) && !isBeginStruct(row) && !isEndStruct(row);
    const isEnd   = isEndStruct(row);
    const isBegin = isBeginStruct(row);
    const isCalc  = bt === 'calculate';
    const n       = row.name;
    const lineNum = `Row ${i + 1}`;

    // 1. Empty name
    if (!n || n.trim() === '') {
      errors.push({ msg: `${lineNum}: Empty name`, detail: `type: ${row.type}` });
      return;
    }

    // 2. Name format — lowercase snake_case
    if (!snakeRe.test(n)) {
      if (/[A-Z]/.test(n))
        errors.push({ msg: `${lineNum}: Name has uppercase — "${n}"`, detail: 'Names must be lower_snake_case' });
      else if (/ /.test(n))
        errors.push({ msg: `${lineNum}: Name contains spaces — "${n}"`, detail: 'Use underscores instead of spaces' });
      else
        errors.push({ msg: `${lineNum}: Invalid name format — "${n}"`,
                      detail: 'Only lowercase letters, digits, underscores. Must start with a letter.' });
    }

    // 3. Name uniqueness
    if (!isEnd) {
      if (names[n] !== undefined) {
        const prevRow = S.survey[names[n]];
        if (!(isBegin && isBeginStruct(prevRow))) {
          errors.push({ msg: `${lineNum}: Duplicate name "${n}"`,
                        detail: `Also at row ${names[n] + 1}. Only begin/end group pairs may share names.` });
        }
      } else {
        names[n] = i;
      }
    } else {
      // end group/repeat — verify a matching begin exists above
      const matchingBegin = S.survey.slice(0, i).reverse().find(r => isBeginStruct(r) && r.name === n);
      if (!matchingBegin)
        errors.push({ msg: `${lineNum}: "${row.type}" has no matching "begin" with name "${n}"`, detail: '' });
    }

    // 4. Empty label
    if (!isEnd && !isMeta) {
      const label = row[pl] || '';
      if (!label.trim()) {
        if (isCalc)
          warnings.push({ msg: `${lineNum}: No label for calculate "${n}"`,
                          detail: 'Labels on calculate fields are optional but help document the form.' });
        else
          errors.push({ msg: `${lineNum}: Empty label for "${n}"`, detail: `type: ${row.type}` });
      }
    }

    // 5. (NEW) calculate must have a calculation formula
    if (isCalc) {
      const formula = (row.calculation || '').trim();
      if (!formula)
        errors.push({ msg: `${lineNum}: calculate "${n}" has no Calculation formula`,
                      detail: 'A calculate field with no formula always evaluates to empty.' });
    }

    // 6. (NEW) Undefined ${ref} in expression columns
    const exprCols = [
      { col: 'calculation',   label: 'calculation'  },
      { col: 'relevant',      label: 'relevant'      },
      { col: 'constraint',    label: 'constraint'    },
      { col: 'choice_filter', label: 'choice_filter' },
    ];
    // Also check all label columns for ${...} references
    S.labelCols.forEach(lc => exprCols.push({ col: lc, label: `label (${lc})` }));

    exprCols.forEach(({ col, label: colLabel }) => {
      const expr = row[col] || '';
      extractRefs(expr).forEach(ref => {
        if (!definedNames.has(ref)) {
          warnings.push({
            msg:    `${lineNum}: "${n}" — \${${ref}} in "${colLabel}" is not defined`,
            detail: `No question named "${ref}" exists in the survey.`
          });
        }
      });
    });
  });

  // ── Pass 2: group balance ───────────────────────────────
  const stack = [];
  S.survey.forEach((row, i) => {
    if (isBeginStruct(row)) {
      stack.push({ name: row.name, type: row.type, idx: i });
    } else if (isEndStruct(row)) {
      if (stack.length) {
        const top = stack[stack.length - 1];
        if (top.name !== row.name)
          errors.push({ msg: `Row ${i + 1}: Group mismatch — "${top.type}" "${top.name}" (row ${top.idx + 1}) vs "${row.type}" "${row.name}"`,
                        detail: 'begin and end must share the same name' });
        stack.pop();
      }
    }
  });
  stack.forEach(g =>
    errors.push({ msg: `Unclosed "${g.type}": "${g.name}" (row ${g.idx + 1})`, detail: 'Missing end group / end repeat' }));

  // ── Pass 3: choice list references ─────────────────────
  const knownLists = new Set(S.choices.map(c => c.list_name));
  S.survey.forEach((row, i) => {
    const p = row.type.split(' ');
    if ((p[0] === 'select_one' || p[0] === 'select_multiple') && p[1] && !knownLists.has(p[1]))
      errors.push({ msg: `Row ${i + 1}: Choice list "${p[1]}" not found in choices sheet`, detail: `Used by: ${row.name}` });
  });

  // ── Summary OKs ─────────────────────────────────────────
  if (!errors.find(e => e.msg.includes('Empty name')))                                          oks.push('All rows have names');
  if (!errors.find(e => e.msg.includes('uppercase') || e.msg.includes('Invalid name')))         oks.push('All names are valid snake_case');
  if (!errors.find(e => e.msg.includes('mismatch') || e.msg.includes('Unclosed') || e.msg.includes('no matching'))) oks.push('All begin/end group pairs match');
  if (!errors.find(e => e.msg.includes('Empty label')))                                         oks.push('All questions have labels');
  if (!errors.find(e => e.msg.includes('Calculation formula')))                                 oks.push('All calculate fields have a formula');
  if (!warnings.find(w => w.msg.includes('is not defined')))                                    oks.push('All ${...} references resolve to known names');
  if (!errors.find(e => e.msg.includes('Choice list')))                                         oks.push('All choice list references are valid');
  if (!errors.find(e => e.msg.includes('Duplicate')))                                           oks.push('No duplicate names');

  // ── Update UI badges ────────────────────────────────────
  const ne = errors.length, nw = warnings.length;
  document.getElementById('nc-errors').textContent   = ne;
  document.getElementById('nc-errors').style.display = ne > 0 ? '' : 'none';
  document.getElementById('tb-errors').textContent   = ne;
  document.getElementById('tb-errors').classList.toggle('hidden', ne === 0);

  // Stats row
  const vs = document.getElementById('valStats');
  vs.style.display = '';
  vs.innerHTML = `
    <div class="stat-box${ne > 0 ? ' red' : ''}"><div class="stat-n">${ne}</div><div class="stat-l">Errors</div></div>
    <div class="stat-box${nw > 0 ? ' yellow' : ''}"><div class="stat-n">${nw}</div><div class="stat-l">Warnings</div></div>
    <div class="stat-box"><div class="stat-n">${oks.length}</div><div class="stat-l">Checks passed</div></div>
    <div class="stat-box blue"><div class="stat-n">${S.survey.length}</div><div class="stat-l">Total rows</div></div>
    <div class="stat-box purple"><div class="stat-n">${uniqueLists().length}</div><div class="stat-l">Choice lists</div></div>`;

  // Validation item list
  const vl = document.getElementById('validationList');
  let html = '';

  if (!ne && !nw)
    html += `<div class="v-item ok"><span class="v-icon">✓</span>
      <div class="v-msg"><strong>No issues found.</strong> All checks passed.</div></div>`;

  errors.forEach(e => {
    html += `<div class="v-item err"><span class="v-icon">✕</span>
      <div class="v-msg">${esc(e.msg)}${e.detail ? `<div class="v-detail">${esc(e.detail)}</div>` : ''}</div></div>`;
  });
  warnings.forEach(w => {
    html += `<div class="v-item warn"><span class="v-icon">⚠</span>
      <div class="v-msg">${esc(w.msg)}${w.detail ? `<div class="v-detail">${esc(w.detail)}</div>` : ''}</div></div>`;
  });
  oks.forEach(o => {
    html += `<div class="v-item ok"><span class="v-icon">✓</span><div class="v-msg">${esc(o)}</div></div>`;
  });

  // ── Disclaimer ──────────────────────────────────────────
  html += `<div class="v-item warn" style="margin-top:20px;border-style:dashed">
    <span class="v-icon">ℹ</span>
    <div class="v-msg">
      <strong>This validation is not exhaustive.</strong>
      <div class="v-detail" style="margin-top:4px;line-height:1.6">
        XLS Form UX checks common issues (names, labels, group pairing, calculate formulas,
        undefined references, choice lists) but cannot catch all XLSForm errors.<br>
        For a complete validation, upload your form to
        <a href="https://docs.getodk.org/central-intro/" target="_blank" rel="noopener"
           style="color:var(--amber)">ODK Central</a>
        or run
        <a href="https://github.com/XLSForm/pyxform" target="_blank" rel="noopener"
           style="color:var(--amber)">pyxform / xls2xform</a>
        locally:
        <code style="display:block;background:var(--surface2);padding:4px 8px;border-radius:3px;
                     margin-top:6px;font-family:var(--mono);font-size:10px">
          pip install pyxform<br>
          xls2xform your_form.xlsx output.xml
        </code>
      </div>
    </div>
  </div>`;

  vl.innerHTML = html;
}


// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
function exportXLSX() {
  const pl       = S.labelCols[0] || 'label';
  const snakeRe  = /^[a-z][a-z0-9_]*$/;
  const exportErrors = [];
  const namesSeen    = {};

  S.survey.forEach((row, i) => {
    const n       = row.name;
    const isEnd   = isEndStruct(row);
    const isBegin = isBeginStruct(row);
    if (!n) { exportErrors.push(`Row ${i + 1}: empty name`); return; }
    if (!snakeRe.test(n)) exportErrors.push(`Row ${i + 1}: invalid name "${n}" (must be lower_snake_case)`);
    if (!isEnd) {
      if (namesSeen[n] !== undefined && !(isBegin && isBeginStruct(S.survey[namesSeen[n]])))
        exportErrors.push(`Row ${i + 1}: duplicate name "${n}"`);
      else if (namesSeen[n] === undefined) namesSeen[n] = i;
    }
    const bt     = row.type.split(' ')[0];
    const isMeta = META.has(bt) && !isBegin && !isEnd;
    if (!isEnd && !isMeta && bt !== 'calculate') {
      if (!(row[pl] || '').trim()) exportErrors.push(`Row ${i + 1}: empty label for "${n}"`);
    }
  });

  if (exportErrors.length) {
    if (!confirm(
      `${exportErrors.length} validation error(s) found:\n\n` +
      `${exportErrors.slice(0, 5).join('\n')}` +
      `${exportErrors.length > 5 ? `\n…and ${exportErrors.length - 5} more` : ''}` +
      `\n\nExport anyway?`)) return;
  }

  const wb = XLSX.utils.book_new();
  const allSurveyCols = [...new Set([
    'type', 'name', 'label', 'hint', 'required', 'relevant', 'appearance', 'default',
    'constraint', 'constraint_message', 'calculation', 'trigger', 'choice_filter',
    'parameters', 'repeat_count', 'read_only',
    ...S.labelCols, ...S.hintCols, ...S.cMsgCols,
    ...S.survey.flatMap(r => Object.keys(r)),
  ].filter(k => k && typeof k === 'string'))];

  const sData = [allSurveyCols, ...S.survey.map(r => allSurveyCols.map(h => r[h] !== undefined ? r[h] : ''))];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sData), 'survey');

  if (S.choices.length) {
    const cCols = [...new Set(S.choices.flatMap(r => Object.keys(r)))];
    const cData = [cCols, ...S.choices.map(r => cCols.map(h => r[h] !== undefined ? r[h] : ''))];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cData), 'choices');
  }

  const sk = Object.keys(S.settings).filter(k => S.settings[k] !== undefined && String(S.settings[k]).trim());
  if (sk.length)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([sk, sk.map(k => S.settings[k])]), 'settings');

  const fname = ((S.settings.form_id || S.settings.form_title || 'form') + '_export')
    .replace(/[^a-z0-9_-]/gi, '_') + '.xlsx';
  XLSX.writeFile(wb, fname);
  toast(`Exported: ${fname}`);
}

// ═══════════════════════════════════════════════════════════
// ROW OPERATIONS
// ═══════════════════════════════════════════════════════════
function moveRow(dir) {
  const i = S.selectedIdx;
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= S.survey.length) return;
  [S.survey[i], S.survey[j]] = [S.survey[j], S.survey[i]];
  S.selectedIdx = j;
  renderAll();
}

function deleteRow(i) {
  if (!confirm(`Delete "${S.survey[i]?.name || 'row'}"?`)) return;
  S.survey.splice(i, 1);
  if (S.selectedIdx >= S.survey.length) S.selectedIdx = S.survey.length - 1;
  renderAll();
  toast('Row deleted');
}

function deleteSelected() {
  if (S.selectedIdx < 0) { toast('Select a row first', 'warn'); return; }
  deleteRow(S.selectedIdx);
}

function selectRow(i) {
  S.selectedIdx = i;
  document.querySelectorAll('.survey-table tbody tr').forEach(tr => {
    tr.classList.toggle('r-selected', parseInt(tr.dataset.idx) === i);
  });
  const el = document.getElementById('ib-sel');
  if (el) el.textContent = S.survey[i]?.name || '—';
}
