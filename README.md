# XLF Form UX: Web Editor Interface for XLF Form

A browser-based editor for survey in [XLSForms](https://xlsform.org/en/). Open `index.html` in any modern browser — no server or installation needed.

## Project structure

```
root/
├── index.html              # Entry point — HTML shell + all markup
├── README.md
├── css/
│   └── builder.css         # All styles (design tokens, layout, components)
├── js/
│   ├── state.js            # App state object + import / file parsing
│   ├── render.js           # Tab switching, renderAll(), table view, cards view
│   ├── panels.js           # Groups tree, Choices panel, Settings panel, Validation, Export
│   ├── docs.js             # Documentation tab content (renderDocs)
│   ├── modals.js           # Edit-question modal + Choice list modal
│   └── utils.js            # Helpers (esc, safeId, toast, keyboard, init)
└── assets/
    └── icons/
        └── favicon.svg     # App icon
```

## Features

| Feature | Details |
|---|---|
| **Import** | Drag-and-drop or file picker — reads `survey`, `choices`, `settings` sheets |
| **Survey table** | Sticky header, depth indentation, inline appearance dropdown, hover actions |
| **Card view** | Property grid per question, embedded choice preview for selects |
| **Groups tree** | SDG-colour-coded depth levels, group summary cards, click to jump |
| **Choices** | Sidebar list navigation, full item table per list, add/edit/delete |
| **Edit modal** | 4 tabs: Basic · Logic · Labels & Hints (all languages) · Advanced |
| **Validation** | snake_case names, unique names (begin/end group pairs exempted), non-empty labels, matched group pairs, valid choice list refs |
| **Export** | Reconstructs `.xlsx` with all original columns; validation gating with override |
| **Docs tab** | Full XLSForm reference: Types, Appearances, Relevance, Constraints, Translations, List lookups, Additional columns |

## Usage

1. Open `index.html` in Chrome, Firefox, Edge, or Safari.
2. Drag your `.xlsx` ODK form onto the upload zone, or click **Import XLS**.
3. Edit questions in the table or cards view.
4. Use **Validate** to check the form before exporting.
5. Click **Export XLSX** to download the updated form.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `↑` / `↓` | Navigate rows |
| `Enter` | Edit selected row |
| `N` | Add question after selected row |
| `Delete` | Delete selected row |
| `Esc` | Close modal |

## Design

- **Font**: Josefin Sans (UI) + JetBrains Mono (code/formulas)  
- **Palette**: SDG-inspired — green `#37BC7D`, UN blue `#009EDB`, yellow `#FDC745`, red `#E5243B`  
- **External dependencies**: [SheetJS (xlsx)](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) loaded from CDN; Google Fonts loaded from CDN. Everything else is vanilla JS/CSS.

## Browser support

Any modern browser that supports ES6, CSS custom properties, and the FileReader API (Chrome 80+, Firefox 75+, Safari 14+, Edge 80+).

## Acknoeledgment

Application designed and built with the AI assistance of Claude by [Anthropic](https://anthropic.com)