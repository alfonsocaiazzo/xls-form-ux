/**
 * docs.js — Documentation tab content (renderDocs)
 *
 * Exports: renderDocs()
 * Content: Full XLSForm reference — types, appearances, logic, constraints,
 *          translations, list lookups, additional columns, validation rules
 */

// ═══════════════════════════════════════════════════════════
// DOCS
// ═══════════════════════════════════════════════════════════
function renderDocs() {
  document.getElementById('docsContent').innerHTML = `
<div class="doc-section">
  <h2>📋 Getting started with XLSForms</h2>
  <div class="doc-tip">This page is based on the XLSForm template provided at <a href="https://github.com/getodk/xlsform-template" target="_blank" rel="noopener">https://github.com/getodk/xlsform-template</a>.</div>
  <p>A XLS form is an Excel workbook in a specific standard format, which provide a readable and easily editable source file for digital questionnaires in ODK.</p>
  <table class="doc-table">
    <tr><th>Sheet</th><th>Purpose</th><th>Required?</th></tr>
    <tr><td>survey</td><td>Defines the questions and logic for your form</td><td>Yes</td></tr>
    <tr><td>choices</td><td>Defines choices to use in select questions</td><td>Mostly yes (when using select-type questions)</td></tr>
    <tr><td>settings</td><td>Form metadata and configuration</td><td>Yes (for deploying the form in the cloud)</td></tr>
    <tr><td>entities</td><td>Create entities for longitudinal workflows</td><td>Only in specific applications</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>⚙️ Field Types</h2>
  <p>The <strong>type</strong> column determines how the user will be prompted or what will be computed by the form.</p>
  <table class="doc-table">
    <tr><th>Type</th><th>Description</th><th>Parameters</th></tr>
    <tr><td>text</td><td>Prompt the user for a text response</td><td>—</td></tr>
    <tr><td>integer</td><td>Prompt the user for an integer response</td><td>—</td></tr>
    <tr><td>decimal</td><td>Prompt the user for a decimal response</td><td>—</td></tr>
    <tr><td>note</td><td>Show the user some text (no input)</td><td>—</td></tr>
    <tr><td>calculate</td><td>Record the result of an XPath expression</td><td>—</td></tr>
    <tr><td>select_one [list]</td><td>Single choice from a list</td><td>randomize, seed</td></tr>
    <tr><td>select_multiple [list]</td><td>Multiple choices from a list</td><td>randomize, seed</td></tr>
    <tr><td>geopoint</td><td>Record a single GPS point</td><td>capture-accuracy, warning-accuracy</td></tr>
    <tr><td>geotrace</td><td>Record a line of GPS points</td><td>—</td></tr>
    <tr><td>geoshape</td><td>Record a polygon of GPS points</td><td>—</td></tr>
    <tr><td>range</td><td>Select a value in a range</td><td>start, end, step</td></tr>
    <tr><td>image</td><td>Capture or select an image</td><td>max-pixels</td></tr>
    <tr><td>audio</td><td>Record or select audio</td><td>quality (normal, low, voice-only)</td></tr>
    <tr><td>video</td><td>Record or select video</td><td>—</td></tr>
    <tr><td>file</td><td>Attach a file</td><td>—</td></tr>
    <tr><td>date</td><td>Date picker</td><td>—</td></tr>
    <tr><td>time</td><td>Time picker</td><td>—</td></tr>
    <tr><td>datetime</td><td>Date and time picker</td><td>—</td></tr>
    <tr><td>barcode</td><td>Scan a barcode</td><td>—</td></tr>
    <tr><td>rank</td><td>Rank a list of choices</td><td>—</td></tr>
    <tr><td>acknowledge</td><td>Prompt user to acknowledge a statement</td><td>—</td></tr>
    <tr><td>hidden</td><td>Hidden field for calculations or defaults</td><td>—</td></tr>
    <tr><td>begin group / end group</td><td>Group questions together</td><td>—</td></tr>
    <tr><td>begin repeat / end repeat</td><td>Group of questions that repeat</td><td>—</td></tr>
    <tr><td>start / end</td><td>Record form start/end time (metadata)</td><td>—</td></tr>
    <tr><td>deviceid</td><td>Record device ID (metadata)</td><td>—</td></tr>
    <tr><td>username</td><td>Record username (metadata)</td><td>—</td></tr>
    <tr><td>audit</td><td>Log user actions as CSV attachment</td><td>location-priority, track-changes</td></tr>
  </table>
  <div class="doc-tip blue">💡 See the Appearances section to learn how to modify how a question is displayed.</div>
</div>

<div class="doc-section">
  <h2>👀 Appearances</h2>
  <p>Appearances configure how a question will be displayed to the user on their device. Most appearances for the same question type can be combined using a space-separated list.</p>
  <table class="doc-table">
    <tr><th>Appearance</th><th>Used with</th><th>Description</th></tr>
    <tr><td>multiline</td><td>text</td><td>Show a multi-line text area</td></tr>
    <tr><td>numbers</td><td>text</td><td>Restrict to numeric input but save as text</td></tr>
    <tr><td>url</td><td>text</td><td>Show a button to launch the website value</td></tr>
    <tr><td>thousands-sep</td><td>integer, decimal</td><td>Add locale thousands separators on screen</td></tr>
    <tr><td>counter</td><td>integer</td><td>Show increment/decrement buttons</td></tr>
    <tr><td>masked</td><td>text</td><td>Show asterisks instead of typed text</td></tr>
    <tr><td>autocomplete</td><td>select_one</td><td>Searchable dropdown</td></tr>
    <tr><td>minimal</td><td>all selects</td><td>Compact dropdown that expands on tap</td></tr>
    <tr><td>likert</td><td>select_one</td><td>Horizontal likert scale</td></tr>
    <tr><td>label / list-nolabel</td><td>all selects</td><td>Used together to build a question grid</td></tr>
    <tr><td>columns / columns-n</td><td>all selects</td><td>Show choices in 2–5 columns</td></tr>
    <tr><td>no-buttons</td><td>all selects</td><td>Choices without radio buttons</td></tr>
    <tr><td>field-list</td><td>begin group</td><td>All questions in the group on one screen</td></tr>
    <tr><td>table-list</td><td>begin group</td><td>Grid layout for multiple select questions</td></tr>
    <tr><td>month-year / year</td><td>date</td><td>Simplified date pickers</td></tr>
    <tr><td>no-calendar</td><td>date</td><td>Spinner date input instead of calendar</td></tr>
    <tr><td>draw / annotate / signature</td><td>image</td><td>Draw, annotate, or sign an image</td></tr>
    <tr><td>placement-map</td><td>geopoint</td><td>Manual map-based location selection</td></tr>
    <tr><td>vertical / rating / picker</td><td>range</td><td>Alternative range input styles</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>🔀 Relevance (skip logic)</h2>
  <p>Relevance determines whether a question will be displayed to a user or not. It enables branching and skip logic in your forms. Apply relevance to groups or repeats to skip/show multiple questions at once.</p>
  <div class="doc-tip">💡 You can use relevance on a note to provide additional guidance or confirm a value that could be out of range.</div>
  <table class="doc-table">
    <tr><th>Expression</th><th>Meaning</th></tr>
    <tr><td>${'${q1}'} != ''</td><td>Show if q1 was not blank</td></tr>
    <tr><td>${'${age}'} &lt; 18</td><td>Show only if age &lt; 18</td></tr>
    <tr><td>selected(${'${q1}'}, 'nurse')</td><td>Show only if 'nurse' was selected in q1</td></tr>
    <tr><td>${'${q1}'} &lt; 12.5 or selected(${'${q2}'}, 'y')</td><td>Multiple conditions with or</td></tr>
    <tr><td>not(selected(${'${q2}'}, 'b'))</td><td>Show if 'b' was not selected in q2</td></tr>
    <tr><td>string-length(${'${q1}'}) > 3</td><td>Show if q1 had more than 3 characters</td></tr>
    <tr><td>false()</td><td>Never show (useful for template questions)</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>🔒 Constraints</h2>
  <p>Constraints limit the answers allowed in a field. Constraints are not evaluated if the answer is blank — to require answers, use the <strong>required</strong> column.</p>
  <div class="doc-tip yellow">⚠️ Use <span class="doc-code">.</span> to refer to the current answer in a constraint expression.</div>
  <table class="doc-table">
    <tr><th>Expression</th><th>Meaning</th></tr>
    <tr><td>. &lt;= 10</td><td>Answer must be ≤ 10</td></tr>
    <tr><td>. > 10.51 and . &lt; 18.39</td><td>Answer between 10.51 and 18.39</td></tr>
    <tr><td>string-length(.) > 5</td><td>Answer must be longer than 5 characters</td></tr>
    <tr><td>. >= today()</td><td>Answer must be today or later</td></tr>
    <tr><td>count-selected(.) &lt;= 3</td><td>At most 3 choices in a multi-select</td></tr>
    <tr><td>not(selected(., 'none') and count-selected(.) > 1)</td><td>Cannot select 'none' with other choices</td></tr>
    <tr><td>regex(., '^[A-Za-z]{0,6}$')</td><td>Up to 6 letters only</td></tr>
    <tr><td>regex(., '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$')</td><td>Email format</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>🌐 Translations</h2>
  <p>XLSForms can be translated into multiple languages. Duplicate translatable columns and add the language name and code after a <span class="doc-code">::</span> separator.</p>
  <div class="doc-tip red">⚠️ There is no fallback language. Specify a translation for every column for every language. Form titles cannot be translated.</div>
  <table class="doc-table">
    <tr><th>Column format</th><th>Example</th></tr>
    <tr><td>label::Language (code)</td><td>label::Español (es)</td></tr>
    <tr><td>hint::Language (code)</td><td>hint::English (en)</td></tr>
    <tr><td>constraint_message::Language</td><td>constraint_message::Español (es)</td></tr>
    <tr><td>image::Language (code)</td><td>image::English (en)</td></tr>
  </table>
  <div class="doc-tip">💡 We recommend designing your form in one language, testing it extensively, then translating.</div>
</div>

<div class="doc-section">
  <h2>✅ Validation Rules (this tool)</h2>
  <p>When exporting, this builder validates the following rules. Errors will prompt for confirmation before export.</p>
  <table class="doc-table">
    <tr><th>Rule</th><th>Details</th></tr>
    <tr><td>name not empty</td><td>Every row must have a name</td></tr>
    <tr><td>name is snake_case</td><td>Names must be lowercase letters, digits, and underscores; must start with a letter</td></tr>
    <tr><td>name is unique</td><td>Duplicate names are only allowed for begin group / end group pairs</td></tr>
    <tr><td>label not empty</td><td>All rows except <em>end group</em> and metadata must have a label</td></tr>
    <tr><td>begin/end group match</td><td>Every begin group must have a corresponding end group with the same name</td></tr>
    <tr><td>choice list exists</td><td>Every select_one/multiple must reference a list in the choices sheet</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>🔍 List lookups (instance function)</h2>
  <p>You can look up values from choice lists, entity lists, and attached CSVs using the <span class="doc-code">instance()</span> function.</p>
  <p>Syntax: <span class="doc-code">instance('list_name')/root/item[filter_expression]/desired_property</span></p>
  <table class="doc-table">
    <tr><th>Expression</th><th>Description</th></tr>
    <tr><td>instance('crops')/root/item[name = ${'${crop}'}]/average_yield</td><td>Look up a crop's average yield by name</td></tr>
    <tr><td>count(instance('participants')/root/item[answered = 'no']/label)</td><td>Count participants who have not answered</td></tr>
    <tr><td>pulldata('list', 'prop', 'match', ${'${q1}'})</td><td>Equivalent shorthand for CSV lookups</td></tr>
  </table>
</div>

<div class="doc-section">
  <h2>➕ Additional columns</h2>
  <table class="doc-table">
    <tr><th>Column</th><th>Used in</th><th>Description</th></tr>
    <tr><td>save_to</td><td>survey</td><td>Save field value to an Entity property</td></tr>
    <tr><td>guidance_hint</td><td>survey</td><td>Additional info less visible than hints (translatable)</td></tr>
    <tr><td>required_message</td><td>survey</td><td>Custom message when required value is missing (translatable)</td></tr>
    <tr><td>read_only</td><td>survey</td><td>Expression to make question non-editable</td></tr>
    <tr><td>big-image</td><td>survey</td><td>Image to display when label image is tapped (translatable)</td></tr>
    <tr><td>image / audio / video</td><td>choices</td><td>Media to show with a choice option (translatable)</td></tr>
    <tr><td>geometry</td><td>choices</td><td>Point/trace/shape for map appearance</td></tr>
    <tr><td>public_key</td><td>settings</td><td>Public key for encrypting form instances</td></tr>
    <tr><td>submission_url</td><td>settings</td><td>Override submission URL</td></tr>
    <tr><td>allow_choice_duplicates</td><td>settings</td><td>Allow duplicate names within a single choice list</td></tr>
    <tr><td>create_if / entity_id / update_if</td><td>entities</td><td>Entity creation/update conditions</td></tr>
  </table>
</div>
`;
}


// ═══════════════════════════════════════════════════════════
// ABOUT ODK
// ═══════════════════════════════════════════════════════════
function renderAbout() {
  const el = document.getElementById('aboutContent');
  if (!el) return;
  el.innerHTML = `

<div class="doc-section">
  <h2>🌍 About</h2>
  <p>
    <strong>Open Data Kit (ODK)</strong> is a suite of open-source tools that enables organizations
    to author, field, and manage mobile data collection solutions. It was originally developed in
    2008 at the University of Washington's Computer Science &amp; Engineering department, and is
    today maintained by <strong>Get ODK Inc.</strong> with a large global community of contributors.
  </p>
  <p>
    ODK is used by thousands of organizations worldwide — from global health agencies and humanitarian
    NGOs to government ministries and academic researchers — to collect high-quality data in
    challenging, often offline environments.
  </p>
  <div class="doc-tip">
    💡 ODK is free and open-source. The tools, the standard, and the community are all openly
    available. See <a href="https://getodk.org" target="_blank" rel="noopener" style="color:var(--green-dark)">getodk.org</a>
    to get started.
  </div>
</div>

<div class="doc-section">
  <h2>🛠 The ODK Ecosystem</h2>
  <table class="doc-table">
    <tr><th>Tool</th><th>Role</th><th>Link</th></tr>
    <tr>
      <td>ODK Central</td>
      <td>The server — manages forms, submissions, and users via a web interface and REST API</td>
      <td><a href="https://docs.getodk.org/central-intro/" target="_blank" rel="noopener" style="color:var(--green-dark)">docs.getodk.org</a></td>
    </tr>
    <tr>
      <td>ODK Collect</td>
      <td>The Android app — allows field workers to fill forms offline and sync when connected</td>
      <td><a href="https://play.google.com/store/apps/details?id=org.odk.collect.android" target="_blank" rel="noopener" style="color:var(--green-dark)">Play Store</a></td>
    </tr>
    <tr>
      <td>ODK XLSForm</td>
      <td>The authoring standard — define forms in Excel spreadsheets (.xlsx)</td>
      <td><a href="https://xlsform.org" target="_blank" rel="noopener" style="color:var(--green-dark)">xlsform.org</a></td>
    </tr>
    <tr>
      <td>pyxform</td>
      <td>Python library that converts XLSForms to XForms (the XML standard)</td>
      <td><a href="https://github.com/XLSForm/pyxform" target="_blank" rel="noopener" style="color:var(--green-dark)">github.com/XLSForm/pyxform</a></td>
    </tr>
    <tr>
      <td>ODK Build</td>
      <td>A drag-and-drop form builder in the browser</td>
      <td><a href="https://build.getodk.org" target="_blank" rel="noopener" style="color:var(--green-dark)">build.getodk.org</a></td>
    </tr>
    <tr>
      <td>Enketo</td>
      <td>Web-based form renderer — fills ODK forms directly in a browser</td>
      <td><a href="https://enketo.org" target="_blank" rel="noopener" style="color:var(--green-dark)">enketo.org</a></td>
    </tr>
  </table>
</div>

<div class="doc-section">
  <h2>📜 The XLSForm Standard</h2>
  <p>
    XLSForm is an open standard for authoring forms using spreadsheet software such as Microsoft Excel
    or Google Sheets. It was designed to be human-readable and human-writable, while still being
    expressive enough to encode complex survey logic.
  </p>
  <p>
    An XLSForm is a <code>.xlsx</code> file containing up to four named sheets:
    <code>survey</code>, <code>choices</code>, <code>settings</code>, and <code>entities</code>.
    The XLSForm toolchain (pyxform) converts this into an XForm — an XML document that conforming
    data collection clients can render.
  </p>
  <div class="doc-tip blue">
    📖 The full XLSForm specification is maintained at
    <a href="https://xlsform.org/en/" target="_blank" rel="noopener" style="color:var(--sdg-blue)">xlsform.org/en/</a>
  </div>
</div>

<div class="doc-section">
  <h2>🤝 Acknowledgements</h2>
  <p>
    This tool — <strong>XLS Form UX</strong> — is an independent, open-source XLSForm editor built
    to make authoring and reviewing ODK forms easier and more accessible. It is not officially
    affiliated with Get ODK Inc. or the ODK Technical Steering Committee.
  </p>
  <p>We gratefully acknowledge the following projects and communities:</p>
  <table class="doc-table">
    <tr><th>Project / Community</th><th>Contribution</th></tr>
    <tr>
      <td><a href="https://getodk.org" target="_blank" rel="noopener" style="color:var(--green-dark)">Get ODK Inc. &amp; the ODK community</a></td>
      <td>For creating and maintaining the ODK ecosystem, the XLSForm standard, and making all of it freely available</td>
    </tr>
    <tr>
      <td><a href="https://xlsform.org" target="_blank" rel="noopener" style="color:var(--green-dark)">xlsform.org</a></td>
      <td>For the comprehensive XLSForm specification that underpins this tool's documentation and validation rules</td>
    </tr>
    <tr>
      <td><a href="https://github.com/SheetJS/sheetjs" target="_blank" rel="noopener" style="color:var(--green-dark)">SheetJS (xlsx)</a></td>
      <td>For the JavaScript library that enables .xlsx import and export entirely in the browser, with no server required</td>
    </tr>
    <tr>
      <td><a href="https://fonts.google.com" target="_blank" rel="noopener" style="color:var(--green-dark)">Google Fonts</a></td>
      <td>For Josefin Sans and JetBrains Mono, served via Google Fonts CDN</td>
    </tr>
    <tr>
      <td>The open-source humanitarian data community</td>
      <td>For years of real-world form design experience shared through public templates, forum discussions, and documentation</td>
    </tr>
    <tr>
  <td><a href="https://anthropic.com" target="_blank" rel="noopener" style="color:var(--green-dark)">Claude by Anthropic</a></td>
  <td>AI assistant used to design and build this application — authoring the code, documentation, and validation logic</td>
</tr>
  </table>
</div>

<div class="doc-section">
  <h2>🔗 Useful links</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:4px">
    ${[
      ['https://getodk.org',              'Get ODK',            'Official home of the ODK ecosystem'],
      ['https://xlsform.org/en/',         'XLSForm spec',       'Full XLSForm reference and examples'],
      ['https://docs.getodk.org/',        'ODK Docs',           'Central, Collect, and API documentation'],
      ['https://forum.getodk.org/',       'ODK Forum',          'Community Q&A and announcements'],
      ['https://github.com/getodk',       'ODK on GitHub',      'Source code for all ODK tools'],
      ['https://github.com/XLSForm/pyxform','pyxform',          'XLSForm → XForm converter (Python)'],
    ].map(([url, title, desc]) => `
      <a href="${url}" target="_blank" rel="noopener"
         style="display:block;background:var(--surface);border:1px solid var(--border);
                border-radius:var(--radius);padding:12px 14px;text-decoration:none;
                transition:border-color .12s;border-top:3px solid var(--green)">
        <div style="font-size:12px;font-weight:700;color:var(--green-dark);margin-bottom:3px">${title}</div>
        <div style="font-size:11px;color:var(--text3)">${desc}</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:4px;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${url}</div>
      </a>`).join('')}
  </div>
</div>

<div class="doc-section">
  <h2>📋 About XLS Form UX</h2>
  <p>
    <strong>XLS Form UX</strong> is a lightweight, browser-based editor for ODK XLSForms.
    It runs entirely locally — no data is ever sent to a server. Everything happens in your browser.
  </p>
  <table class="doc-table">
    <tr><th>Capability</th><th>Detail</th></tr>
    <tr><td>Import</td><td>Read <code>.xlsx</code> files with survey, choices, and settings sheets</td></tr>
    <tr><td>Survey editing</td><td>Table and card views with inline edits, drag-to-reorder, insert at any position</td></tr>
    <tr><td>Groups</td><td>Visual depth-coloured tree of all begin/end group and repeat blocks</td></tr>
    <tr><td>Choices</td><td>Browse and edit all choice lists; see which questions use each list</td></tr>
    <tr><td>Validation</td><td>Checks names, labels, group matching, duplicate names, choice references</td></tr>
    <tr><td>Export</td><td>Reconstructs a valid <code>.xlsx</code> preserving all columns and languages</td></tr>
    <tr><td>Languages</td><td>Full support for multi-language labels, hints, and constraint messages</td></tr>
    <tr><td>Offline</td><td>Works with no internet connection after the initial page load</td></tr>
  </table>
  <div class="doc-tip red">
    ⚠️ XLS Form UX is not an official ODK product. Always validate your forms with the ODK validator
    or by uploading to ODK Central before deploying to the field.
  </div>
</div>
`;
}
