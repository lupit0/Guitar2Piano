# Sheet Music Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Guitar2Piano from a dark-themed prototype into a conventional, print-ready piano sheet music app with grand staff support and PDF export.

**Architecture:** Four sequential changes — (1) restyle to light/conventional theme, (2) add bars-per-row control, (3) implement grand staff rendering with VexFlow StaveConnector, (4) add PDF export via jsPDF + svg2pdf.js. Each builds on the prior.

**Tech Stack:** React 19, VexFlow 5 (StaveConnector for brace/barlines), Tailwind CSS 4, jsPDF + svg2pdf.js for PDF export, AlphaTab for GP parsing (unchanged).

**Test file:** `test-files/Guns N' Roses - Sweet Child O ' Mine__STANDARD_TUNING_DANDJ.gp`

---

### Task 1: Light Theme — CSS and Component Restyling

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `src/components/ScoreHeader.tsx`
- Modify: `src/components/TrackControls.tsx`
- Modify: `src/components/NotationDisplay.tsx`
- Modify: `src/components/FileUpload.tsx`
- Modify: `src/notationRenderer.ts`

**Step 1: Update index.css to light theme**

Replace the dark body/scrollbar styles:

```css
@import "tailwindcss";

body {
  margin: 0;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
```

**Step 2: Update App.tsx — swap all dark Tailwind classes to light equivalents**

Key class replacements throughout App.tsx:
- `bg-slate-950` → `bg-slate-50`
- `border-slate-800` → `border-slate-200`
- `bg-slate-950/80` → `bg-white/80`
- `text-white` → `text-slate-900`
- `text-slate-400` → `text-slate-500`
- `text-slate-500` → `text-slate-400`
- `bg-slate-800` → `bg-white`
- `border-slate-700` → `border-slate-200`
- `hover:bg-slate-700` → `hover:bg-slate-100`
- `hover:text-white` → `hover:text-slate-900`
- `text-slate-300` → `text-slate-600`
- `from-indigo-500 to-purple-600` stays (accent color)

**Step 3: Update ScoreHeader.tsx — light palette**

Replace gradient and text classes:
- `from-indigo-500/10 via-purple-500/10 to-pink-500/10` → `from-indigo-50 via-purple-50 to-pink-50`
- `border-slate-700` → `border-slate-200`
- `text-white` → `text-slate-900`
- `text-slate-400` → `text-slate-500`
- `text-slate-500` → `text-slate-400`
- `text-amber-400` → `text-amber-600`
- `text-emerald-400` → `text-emerald-600`

**Step 4: Update TrackControls.tsx — light palette**

Key replacements:
- `border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10` → `border-indigo-400 bg-indigo-50 shadow-indigo-100`
- `border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800` → `border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50`
- `bg-indigo-400` → `bg-indigo-500`
- `bg-slate-600` → `bg-slate-300`
- `text-slate-200` → `text-slate-800`
- `text-slate-400` → `text-slate-500`
- `bg-slate-700/50` → `bg-slate-100`
- `bg-indigo-500 text-white` stays (active buttons)
- `text-slate-400 hover:text-slate-200` → `text-slate-500 hover:text-slate-800`
- `bg-slate-700 hover:bg-slate-600` → `bg-slate-200 hover:bg-slate-300`
- `text-slate-300` → `text-slate-600`
- `text-indigo-400` → `text-indigo-600`
- `border-slate-700/50` → `border-slate-200`
- `bg-slate-600 peer-checked:bg-indigo-500` → `bg-slate-300 peer-checked:bg-indigo-500`

**Step 5: Update FileUpload.tsx — light palette**

Same pattern: dark backgrounds/borders → light equivalents. Accent colors stay.

**Step 6: Update NotationDisplay.tsx — light palette**

- `bg-slate-800/50` → `bg-white`
- `border-slate-700` → `border-slate-200`
- `border-slate-700/50` → `border-slate-200`
- `text-slate-200` → `text-slate-800`
- `text-slate-400` → `text-slate-500`
- `bg-slate-700/50` → `bg-slate-100`
- `bg-indigo-500/20 text-indigo-300` → `bg-indigo-100 text-indigo-700`

**Step 7: Update notationRenderer.ts — remove SVG color hack**

Delete the entire SVG styling block at the end of `renderNotation()` (lines 118-137 — the `// Style the SVG` section that forces light colors on paths/text). VexFlow renders black by default, which is what we want on a white background.

**Step 8: Verify locally**

Run: `npm run dev`
Open in browser, upload test GP file, confirm black-on-white notation renders correctly.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: switch to conventional light theme with black notation"
```

---

### Task 2: Bars Per Row Selector

**Files:**
- Modify: `src/App.tsx` — add barsPerRow state, pass as prop
- Create: `src/components/Toolbar.tsx` — new toolbar component
- Modify: `src/notationRenderer.ts` — accept barsPerRow parameter
- Modify: `src/components/NotationDisplay.tsx` — accept and pass barsPerRow

**Step 1: Create Toolbar.tsx**

```tsx
interface ToolbarProps {
  barsPerRow: number;
  onBarsPerRowChange: (n: number) => void;
}

export function Toolbar({ barsPerRow, onBarsPerRowChange }: ToolbarProps) {
  return (
    <div className="flex items-center gap-6 bg-white rounded-xl border border-slate-200 px-5 py-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Bars per row</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => onBarsPerRowChange(n)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                barsPerRow === n
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update notationRenderer.ts — use barsPerRow parameter**

Change the `renderNotation` signature to accept `barsPerRow`:

```ts
export function renderNotation(
  container: HTMLElement,
  bars: PianoBar[],
  clef: ClefType,
  octaveShift: number,
  barsPerRow: number = 4
): void {
```

Replace the auto-calculated `stavesPerRow` with the parameter:

```ts
const stavesPerRow = barsPerRow;
const staveWidth = Math.floor((container.clientWidth - 40) / stavesPerRow);
```

**Step 3: Update NotationDisplay.tsx — accept barsPerRow prop**

Add `barsPerRow: number` to the props interface. Pass it through to `renderNotation()`.

**Step 4: Update App.tsx — add state and Toolbar**

Add state: `const [barsPerRow, setBarsPerRow] = useState(4);`

Add `<Toolbar barsPerRow={barsPerRow} onBarsPerRowChange={setBarsPerRow} />` above the notation area (inside the score-loaded section).

Pass `barsPerRow` to all `<NotationDisplay>` instances.

**Step 5: Verify locally**

Run dev server, upload test file, click through 1–6 bars per row, confirm staves resize correctly.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add bars-per-row selector in toolbar"
```

---

### Task 3: Grand Staff Mode

**Files:**
- Modify: `src/notationRenderer.ts` — add `renderGrandStaff()` function
- Create: `src/components/GrandStaffDisplay.tsx` — new component for grand staff rendering
- Modify: `src/components/Toolbar.tsx` — add grand staff toggle + track selectors
- Modify: `src/App.tsx` — add grand staff state, conditional rendering
- Modify: `src/types.ts` — add GrandStaffSettings type

**Step 1: Add type to types.ts**

```ts
export interface GrandStaffSettings {
  enabled: boolean;
  trebleTrackIndex: number;
  bassTrackIndex: number;
}
```

**Step 2: Add renderGrandStaff to notationRenderer.ts**

New exported function alongside `renderNotation`:

```ts
import { Renderer, Stave, StaveNote, StaveConnector, Voice, Formatter, Accidental } from 'vexflow';

export function renderGrandStaff(
  container: HTMLElement,
  trebleBars: PianoBar[],
  bassBars: PianoBar[],
  trebleOctaveShift: number,
  bassOctaveShift: number,
  barsPerRow: number = 4
): void {
  container.innerHTML = '';
  const barCount = Math.max(trebleBars.length, bassBars.length);
  if (barCount === 0) return;

  const stavesPerRow = barsPerRow;
  const staveWidth = Math.floor((container.clientWidth - 60) / stavesPerRow);
  const trebleHeight = 120;
  const bassHeight = 120;
  const systemGap = 40;  // gap between grand staff systems
  const rowHeight = trebleHeight + bassHeight + systemGap;
  const totalRows = Math.ceil(barCount / stavesPerRow);
  const svgWidth = Math.min(container.clientWidth, stavesPerRow * staveWidth + 60);
  const svgHeight = totalRows * rowHeight + 40;

  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(svgWidth, svgHeight);
  const context = renderer.getContext();
  context.setFont('Arial', 10);

  for (let i = 0; i < barCount; i++) {
    const row = Math.floor(i / stavesPerRow);
    const col = i % stavesPerRow;
    const x = col * staveWidth + 40; // extra left margin for brace
    const yTreble = row * rowHeight + 20;
    const yBass = yTreble + trebleHeight;

    // Treble stave
    const trebleStave = new Stave(x, yTreble, staveWidth - 10);
    if (col === 0) trebleStave.addClef('treble');
    if (i === 0 && trebleBars[0]) {
      trebleStave.addTimeSignature(
        `${trebleBars[0].timeSignature.numerator}/${trebleBars[0].timeSignature.denominator}`
      );
    }
    trebleStave.setContext(context).draw();

    // Bass stave
    const bassStave = new Stave(x, yBass, staveWidth - 10);
    if (col === 0) bassStave.addClef('bass');
    if (i === 0 && bassBars[0]) {
      bassStave.addTimeSignature(
        `${bassBars[0].timeSignature.numerator}/${bassBars[0].timeSignature.denominator}`
      );
    }
    bassStave.setContext(context).draw();

    // Connectors: brace on first bar of each row, barline on right of every bar
    if (col === 0) {
      const brace = new StaveConnector(trebleStave, bassStave);
      brace.setType('brace');
      brace.setContext(context).draw();

      const lineLeft = new StaveConnector(trebleStave, bassStave);
      lineLeft.setType('singleLeft');
      lineLeft.setContext(context).draw();
    }

    const lineRight = new StaveConnector(trebleStave, bassStave);
    lineRight.setType('singleRight');
    lineRight.setContext(context).draw();

    // Render treble voice
    renderVoiceOnStave(context, trebleStave, trebleBars[i], 'treble', trebleOctaveShift, staveWidth);
    // Render bass voice
    renderVoiceOnStave(context, bassStave, bassBars[i], 'bass', bassOctaveShift, staveWidth);
  }
}
```

Extract a shared helper `renderVoiceOnStave()` from the existing note-rendering logic in `renderNotation` to avoid duplication. Both `renderNotation` and `renderGrandStaff` call it.

**Step 3: Create GrandStaffDisplay.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { renderGrandStaff } from '../notationRenderer';
import type { PianoBar } from '../types';

interface GrandStaffDisplayProps {
  trebleBars: PianoBar[];
  bassBars: PianoBar[];
  trebleOctaveShift: number;
  bassOctaveShift: number;
  trebleTrackName: string;
  bassTrackName: string;
  barsPerRow: number;
}

export function GrandStaffDisplay(props: GrandStaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const timer = requestAnimationFrame(() => {
      if (containerRef.current) {
        renderGrandStaff(
          containerRef.current,
          props.trebleBars,
          props.bassBars,
          props.trebleOctaveShift,
          props.bassOctaveShift,
          props.barsPerRow
        );
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [props]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        renderGrandStaff(
          containerRef.current,
          props.trebleBars,
          props.bassBars,
          props.trebleOctaveShift,
          props.bassOctaveShift,
          props.barsPerRow
        );
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [props]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h3 className="font-medium text-slate-800">Grand Staff</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            Treble: {props.trebleTrackName}
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            Bass: {props.bassTrackName}
          </span>
        </div>
      </div>
      <div ref={containerRef} className="p-6 overflow-x-auto min-h-[300px]" />
    </div>
  );
}
```

**Step 4: Update Toolbar.tsx — add grand staff controls**

Add props for grand staff toggle, track selection dropdowns, and track list:

```tsx
interface ToolbarProps {
  barsPerRow: number;
  onBarsPerRowChange: (n: number) => void;
  grandStaffEnabled: boolean;
  onGrandStaffToggle: (enabled: boolean) => void;
  trebleTrackIndex: number;
  bassTrackIndex: number;
  onTrebleTrackChange: (index: number) => void;
  onBassTrackChange: (index: number) => void;
  availableTracks: { index: number; name: string }[];
}
```

Add a "Grand Staff" toggle button + two `<select>` dropdowns for treble/bass track when enabled.

**Step 5: Update App.tsx — grand staff state and conditional rendering**

Add state:
```ts
const [grandStaff, setGrandStaff] = useState<GrandStaffSettings>({
  enabled: false,
  trebleTrackIndex: 0,
  bassTrackIndex: 1,
});
```

When grand staff is enabled, render `<GrandStaffDisplay>` instead of individual `<NotationDisplay>` components.

Pass grand staff props to `<Toolbar>`.

**Step 6: Verify locally**

Upload Sweet Child O' Mine, enable grand staff, assign Lead Guitar to treble and Rhythm to bass, verify brace + connected barlines render correctly.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add grand staff mode with brace and connected barlines"
```

---

### Task 4: PDF Export

**Files:**
- Install: `jspdf`, `svg2pdf.js`
- Create: `src/pdfExport.ts` — PDF generation logic
- Modify: `src/components/Toolbar.tsx` — add export button + rows-per-page selector
- Modify: `src/App.tsx` — wire up PDF export

**Step 1: Install dependencies**

```bash
npm install jspdf svg2pdf.js
```

**Step 2: Create pdfExport.ts**

Core logic:
- Create an offscreen div, render notation into it row by row
- For grand staff: use `renderGrandStaff` on the offscreen div
- For single track: use `renderNotation` on the offscreen div
- Serialize each row's SVG, embed into jsPDF pages using svg2pdf.js
- Title/artist/tempo on first page header
- Page numbers at bottom center
- A4 portrait (210mm × 297mm)

```ts
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { renderNotation, renderGrandStaff } from './notationRenderer';
import type { PianoBar, ClefType } from './types';

interface PdfExportOptions {
  title: string;
  artist: string;
  tempo: number;
  barsPerRow: number;
  rowsPerPage: number;
  // Single track mode
  mode: 'single' | 'grandStaff';
  // Single track props
  bars?: PianoBar[];
  clef?: ClefType;
  octaveShift?: number;
  trackName?: string;
  // Grand staff props
  trebleBars?: PianoBar[];
  bassBars?: PianoBar[];
  trebleOctaveShift?: number;
  bassOctaveShift?: number;
  trebleTrackName?: string;
  bassTrackName?: string;
}

export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Determine total bars and row height
  const bars = options.mode === 'single' ? options.bars! : options.trebleBars!;
  const totalBars = bars.length;
  const totalRows = Math.ceil(totalBars / options.barsPerRow);

  // Offscreen container for rendering SVGs
  const offscreen = document.createElement('div');
  offscreen.style.position = 'absolute';
  offscreen.style.left = '-9999px';
  offscreen.style.width = `${contentWidth * 3.78}px`; // mm to px approx
  document.body.appendChild(offscreen);

  // Render full score offscreen to get SVG
  if (options.mode === 'grandStaff') {
    renderGrandStaff(
      offscreen, options.trebleBars!, options.bassBars!,
      options.trebleOctaveShift!, options.bassOctaveShift!,
      options.barsPerRow
    );
  } else {
    renderNotation(
      offscreen, options.bars!, options.clef!, options.octaveShift!,
      options.barsPerRow
    );
  }

  const svgElement = offscreen.querySelector('svg');
  if (!svgElement) {
    document.body.removeChild(offscreen);
    return;
  }

  // Calculate layout
  const svgHeight = svgElement.getAttribute('height');
  const svgViewBox = svgElement.viewBox.baseVal;
  const rowHeightPx = svgViewBox.height / totalRows;
  const rowHeightMm = (rowHeightPx / svgViewBox.height) * (contentWidth * (svgViewBox.height / svgViewBox.width));
  const headerHeight = 20; // mm for title block on first page

  let currentY = margin;
  let currentPage = 1;
  let rowsOnCurrentPage = 0;

  // Title on first page
  pdf.setFontSize(18);
  pdf.text(options.title, pageWidth / 2, currentY + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(options.artist, pageWidth / 2, currentY + 14, { align: 'center' });
  pdf.setFontSize(9);
  pdf.text(`Tempo: ${options.tempo} BPM`, pageWidth / 2, currentY + 19, { align: 'center' });
  currentY += headerHeight;

  // Render row by row using svg2pdf
  for (let row = 0; row < totalRows; row++) {
    if (rowsOnCurrentPage >= options.rowsPerPage || currentY + rowHeightMm > pageHeight - margin) {
      // Page footer
      pdf.setFontSize(8);
      pdf.text(`${currentPage}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      // New page
      pdf.addPage();
      currentPage++;
      currentY = margin;
      rowsOnCurrentPage = 0;
    }

    // Create a clipped SVG for just this row
    const rowSvg = svgElement.cloneNode(true) as SVGSVGElement;
    const clipY = row * rowHeightPx;
    rowSvg.setAttribute('viewBox', `0 ${clipY} ${svgViewBox.width} ${rowHeightPx}`);
    rowSvg.setAttribute('width', `${contentWidth}mm`);
    rowSvg.setAttribute('height', `${rowHeightMm}mm`);

    await pdf.svg(rowSvg, {
      x: margin,
      y: currentY,
      width: contentWidth,
      height: rowHeightMm,
    });

    currentY += rowHeightMm + 2;
    rowsOnCurrentPage++;
  }

  // Last page footer
  pdf.setFontSize(8);
  pdf.text(`${currentPage}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  document.body.removeChild(offscreen);

  // Save
  const filename = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_piano.pdf`;
  pdf.save(filename);
}
```

**Step 3: Update Toolbar.tsx — add PDF export button and rows-per-page**

Add props:
```ts
rowsPerPage: number;
onRowsPerPageChange: (n: number) => void;
onExportPdf: () => void;
isExporting: boolean;
```

Add a "Rows per page" selector (1–8, default 4) and an "Export PDF" button.

**Step 4: Update App.tsx — wire up PDF export**

Add state: `const [rowsPerPage, setRowsPerPage] = useState(4);`
Add state: `const [isExporting, setIsExporting] = useState(false);`

Add handler that calls `exportToPdf()` with the current settings (single or grand staff mode).

**Step 5: Verify locally**

Upload Sweet Child O' Mine, try PDF export in both single-track and grand staff modes. Open the PDF and confirm vector quality, title header, page numbers.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add PDF export with configurable rows per page"
```

---

### Task 5: Final Push and Deploy

**Step 1: Build check**

```bash
npm run build
```

Fix any TypeScript errors.

**Step 2: Push and verify deployment**

```bash
git push
```

Watch GitHub Actions, verify the deployed site works at https://lupit0.github.io/Guitar2Piano
