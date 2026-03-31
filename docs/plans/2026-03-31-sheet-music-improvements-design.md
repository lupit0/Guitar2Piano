# Guitar2Piano — Sheet Music Improvements Design

**Date:** 2026-03-31
**Purpose:** Make the app produce conventional, readable piano sheet music for Dave.

## 1. Visual Overhaul — Conventional Sheet Music Look

Replace the dark theme notation with standard sheet music appearance:
- White/cream background for the notation area
- Black staff lines, noteheads, stems, and accidentals
- Remove the SVG post-processing color hack in `notationRenderer.ts`
- App chrome (header, sidebar) moves to a clean light-gray palette
- Body background becomes light

## 2. Bars Per Row Selector

Add a toolbar control to set bars per row (1–6, default 4):
- Stave width = (container width - margins) / barsPerRow
- State lives in App.tsx, passed down to NotationDisplay
- Responsive: on narrow screens, clamp to what fits
- This value also feeds into PDF export

## 3. Grand Staff Mode

Add a toggle + track pair selector for grand staff rendering:
- "Grand Staff" toggle in the toolbar area
- Two dropdowns: Treble Track / Bass Track (non-percussion tracks only)
- Renderer uses VexFlow `StaveConnector` with `type.BRACE` to join treble + bass staves
- Barlines span both staves via `StaveConnector` `type.SINGLE_RIGHT`
- Each track retains its own octave shift
- When grand staff is off, single-track mode works as before

## 4. PDF Export

Export button in toolbar using jsPDF + svg2pdf.js (vector output):
- User selects "rows per page" (1–8, default 4)
- Title/artist/tempo header on first page
- Score rendered row-by-row into SVG, each row serialized into the PDF
- Page numbers at bottom center
- A4 portrait by default
- Uses the current bars-per-row setting

## Dependencies to Add

- `jspdf` — PDF generation
- `svg2pdf.js` — SVG-to-PDF vector conversion

## Files Changed

- `src/index.css` — light theme
- `src/App.tsx` — new state (barsPerRow, grandStaff, trebleTrack, bassTrack), toolbar, PDF button
- `src/notationRenderer.ts` — remove color hack, accept barsPerRow param, add grand staff rendering
- `src/components/NotationDisplay.tsx` — pass barsPerRow, support grand staff mode
- `src/components/TrackControls.tsx` — light theme styling
- `src/components/ScoreHeader.tsx` — light theme styling
- `src/components/Toolbar.tsx` — new component: bars-per-row, grand staff toggle, PDF export
- `src/pdfExport.ts` — new module: PDF generation logic
