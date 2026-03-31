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

  // Create offscreen container
  const offscreen = document.createElement('div');
  offscreen.style.position = 'absolute';
  offscreen.style.left = '-9999px';
  offscreen.style.top = '0';
  // Use a fixed pixel width that matches A4 proportions (~680px for 180mm content)
  const pxWidth = Math.round(contentWidth * 3.78);
  offscreen.style.width = `${pxWidth}px`;
  document.body.appendChild(offscreen);

  try {
    // Render the full score offscreen
    if (options.mode === 'grandStaff') {
      renderGrandStaff(
        offscreen,
        options.trebleBars,
        options.bassBars,
        options.trebleOctaveShift,
        options.bassOctaveShift,
        options.barsPerRow
      );
    } else {
      renderNotation(
        offscreen,
        options.bars,
        options.clef,
        options.octaveShift,
        options.barsPerRow
      );
    }

    const svgElement = offscreen.querySelector('svg');
    if (!svgElement) return;

    // Get SVG dimensions
    const svgW = parseFloat(svgElement.getAttribute('width') || '0');
    const svgH = parseFloat(svgElement.getAttribute('height') || '0');
    if (svgW === 0 || svgH === 0) return;

    // Calculate how many bars and rows we have
    const totalBars = options.mode === 'grandStaff'
      ? Math.max(options.trebleBars.length, options.bassBars.length)
      : options.bars.length;
    const totalRows = Math.ceil(totalBars / options.barsPerRow);
    const rowHeightPx = svgH / totalRows;

    // Scale: how tall is one row in mm?
    const scale = contentWidth / svgW;
    const rowHeightMm = rowHeightPx * scale;

    // Title block height
    const headerHeight = 20;

    let currentY = margin;
    let currentPage = 1;
    let rowsOnCurrentPage = 0;
    const isFirstPage = () => currentPage === 1;

    // Title on first page
    pdf.setFontSize(18);
    pdf.text(options.title, pageWidth / 2, currentY + 8, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(options.artist, pageWidth / 2, currentY + 14, { align: 'center' });
    pdf.setFontSize(9);
    pdf.text(`Tempo: ${options.tempo} BPM`, pageWidth / 2, currentY + 19, { align: 'center' });
    currentY += headerHeight;

    for (let row = 0; row < totalRows; row++) {
      // Check if we need a new page
      const maxRows = isFirstPage() ? options.rowsPerPage - 1 : options.rowsPerPage;
      if (rowsOnCurrentPage >= maxRows || currentY + rowHeightMm > pageHeight - margin) {
        // Page number
        pdf.setFontSize(8);
        pdf.text(`${currentPage}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        pdf.addPage();
        currentPage++;
        currentY = margin;
        rowsOnCurrentPage = 0;
      }

      // Clone SVG and set viewBox to just this row
      const rowSvg = svgElement.cloneNode(true) as SVGSVGElement;
      const clipY = row * rowHeightPx;
      rowSvg.setAttribute('viewBox', `0 ${clipY} ${svgW} ${rowHeightPx}`);
      rowSvg.removeAttribute('width');
      rowSvg.removeAttribute('height');

      await pdf.svg(rowSvg, {
        x: margin,
        y: currentY,
        width: contentWidth,
        height: rowHeightMm,
      });

      currentY += rowHeightMm + 2;
      rowsOnCurrentPage++;
    }

    // Last page number
    pdf.setFontSize(8);
    pdf.text(`${currentPage}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save
    const filename = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_piano.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(offscreen);
  }
}
