# Guitar2Piano

Convert Guitar Pro files into piano sheet music, right in your browser.

**Live demo:** [lupit0.github.io/Guitar2Piano](https://lupit0.github.io/Guitar2Piano)

## Features

- **Guitar Pro import** — Drag and drop `.gp`, `.gp3`, `.gp4`, `.gp5`, `.gpx` files
- **Multi-track support** — View and switch between all tracks in the file
- **Grand Staff mode** — Combine two tracks into a proper piano grand staff with brace, connected barlines, and independent treble/bass clef assignment
- **Bars per row** — Adjustable layout (1-6 bars per row) to control notation density
- **Octave shifting** — Transpose any track up or down by octaves
- **PDF export** — Vector-quality PDF output with configurable rows per page, title header, and page numbers

## Usage

1. Open the app and upload a Guitar Pro file
2. Select which tracks to display and adjust clef/octave settings
3. Use the toolbar to set bars per row
4. Toggle **Grand Staff** to combine two tracks into a piano grand staff — pick which track is treble (top) and which is bass (bottom)
5. Click **Export PDF** to download print-ready sheet music

## Tech Stack

- [React](https://react.dev/) + TypeScript
- [VexFlow](https://www.vexflow.com/) — Music notation rendering
- [AlphaTab](https://www.alphatab.net/) — Guitar Pro file parsing
- [jsPDF](https://github.com/parallax/jsPDF) + [svg2pdf.js](https://github.com/yWorks/svg2pdf.js) — Vector PDF export
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Vite](https://vite.dev/) — Build tool

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Deployed automatically to GitHub Pages via GitHub Actions on push to `master`.

## License

MIT
