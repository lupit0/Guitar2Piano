import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { renderNotation, renderGrandStaff } from './notationRenderer';
import type { PianoBar, ClefType } from './types';

interface PdfExportSingleOptions {
  mode: 'single';
  title: string;
  artist: string;
  tempo: number;
  barsPerRow: number;
  rowsPerPage: number;
  bars: PianoBar[];
  clef: ClefType;
  octaveShift: number;
  trackName: string;
}

interface PdfExportGrandStaffOptions {
  mode: 'grandStaff';
  title: string;
  artist: string;
  tempo: number;
  barsPerRow: number;
  rowsPerPage: number;
  trebleBars: PianoBar[];
  bassBars: PianoBar[];
  trebleOctaveShift: number;
  bassOctaveShift: number;
}

export type PdfExportOptions = PdfExportSingleOptions | PdfExportGrandStaffOptions;

export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const headerHeight = 20;

  const totalBars =
    options.mode === 'grandStaff'
      ? Math.max(options.trebleBars.length, options.bassBars.length)
      : options.bars.length;

  if (totalBars === 0) return;

  // Title on first page
  pdf.setFontSize(18);
  pdf.text(options.title, pageWidth / 2, margin + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(options.artist, pageWidth / 2, margin + 14, { align: 'center' });
  pdf.setFontSize(9);
  pdf.text(`Tempo: ${options.tempo} BPM`, pageWidth / 2, margin + 19, { align: 'center' });

  // The first page reserves one row for the header; subsequent pages use the full rowsPerPage.
  const firstPageRowCount = Math.max(1, options.rowsPerPage - 1);
  const firstPageBars = options.barsPerRow * firstPageRowCount;
  const otherPagesBars = options.barsPerRow * options.rowsPerPage;

  // Build page slices: each entry describes which bars go on that page.
  const pageSlices: Array<{ start: number; end: number; contentY: number }> = [];
  let barOffset = 0;
  let pageIndex = 0;
  while (barOffset < totalBars) {
    const barsThisPage = pageIndex === 0 ? firstPageBars : otherPagesBars;
    const end = Math.min(barOffset + barsThisPage, totalBars);
    const contentY = pageIndex === 0 ? margin + headerHeight : margin;
    pageSlices.push({ start: barOffset, end, contentY });
    barOffset = end;
    pageIndex++;
  }

  // Create offscreen container once and reuse it across pages.
  const offscreen = document.createElement('div');
  offscreen.style.position = 'absolute';
  offscreen.style.left = '-9999px';
  offscreen.style.top = '0';
  // Use a fixed pixel width that matches A4 proportions (~680px for 180mm content)
  const pxWidth = Math.round(contentWidth * 3.78);
  offscreen.style.width = `${pxWidth}px`;
  document.body.appendChild(offscreen);

  try {
    for (let p = 0; p < pageSlices.length; p++) {
      if (p > 0) {
        // Page number on the bottom of the completed page before adding a new one
        pdf.setFontSize(8);
        pdf.text(`${p}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        pdf.addPage();
      }

      const { start, end, contentY } = pageSlices[p];

      // Render only the bars for this page — O(barsThisPage) work per page.
      if (options.mode === 'grandStaff') {
        renderGrandStaff(
          offscreen,
          options.trebleBars.slice(start, end),
          options.bassBars.slice(start, end),
          options.trebleOctaveShift,
          options.bassOctaveShift,
          options.barsPerRow
        );
      } else {
        renderNotation(
          offscreen,
          options.bars.slice(start, end),
          options.clef,
          options.octaveShift,
          options.barsPerRow
        );
      }

      const svgElement = offscreen.querySelector('svg');
      if (!svgElement) continue;

      const svgW = parseFloat(svgElement.getAttribute('width') || '0');
      const svgH = parseFloat(svgElement.getAttribute('height') || '0');
      if (svgW === 0 || svgH === 0) continue;

      const scale = contentWidth / svgW;
      const svgHeightMm = svgH * scale;
      const availableHeight = pageHeight - contentY - margin;

      // pdf.svg() is called once per page (not once per row), keeping work O(N) total.
      await pdf.svg(svgElement, {
        x: margin,
        y: contentY,
        width: contentWidth,
        height: Math.min(svgHeightMm, availableHeight),
      });
    }

    // Page number on the last page
    pdf.setFontSize(8);
    pdf.text(`${pageSlices.length}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    const filename = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_piano.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(offscreen);
  }
}
