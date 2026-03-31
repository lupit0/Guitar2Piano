import { Renderer, Stave, StaveNote, StaveConnector, Voice, Formatter, Accidental } from 'vexflow';
import type { PianoBar, ClefType } from './types';

const NOTE_NAMES = ['c', 'c', 'd', 'd', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'b'];
const NOTE_ACCIDENTALS = ['', '#', '', '#', '', '', '#', '', '#', '', '#', ''];

function shiftMidiKey(midiKey: number, octaveShift: number): string {
  const shifted = midiKey + octaveShift * 12;
  const noteIndex = shifted % 12;
  const octave = Math.floor(shifted / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${NOTE_ACCIDENTALS[noteIndex]}/${octave}`;
}

function hasAccidental(key: string): string | null {
  if (key.includes('#')) return '#';
  if (key.includes('b') && !key.startsWith('b')) return 'b';
  return null;
}

function renderVoiceOnStave(
  context: ReturnType<Renderer['getContext']>,
  stave: Stave,
  bar: PianoBar | undefined,
  clef: ClefType,
  octaveShift: number,
  staveWidth: number
): void {
  if (!bar) return;

  const clefName = clef === 'treble' ? 'treble' : 'bass';
  const vexNotes: StaveNote[] = [];

  for (const beat of bar.beats) {
    if (beat.isRest) {
      const rest = new StaveNote({
        clef: clefName,
        keys: [clef === 'treble' ? 'b/4' : 'd/3'],
        duration: `${beat.duration}r`,
      });
      vexNotes.push(rest);
    } else {
      const keys = beat.notes.map((n) => shiftMidiKey(n.midi, octaveShift));
      try {
        const staveNote = new StaveNote({
          clef: clefName,
          keys,
          duration: beat.duration,
        });
        keys.forEach((key, idx) => {
          const acc = hasAccidental(key);
          if (acc) {
            staveNote.addModifier(new Accidental(acc), idx);
          }
        });
        vexNotes.push(staveNote);
      } catch {
        const rest = new StaveNote({
          clef: clefName,
          keys: [clef === 'treble' ? 'b/4' : 'd/3'],
          duration: `${beat.duration}r`,
        });
        vexNotes.push(rest);
      }
    }
  }

  if (vexNotes.length > 0) {
    try {
      const voice = new Voice({
        numBeats: bar.timeSignature.numerator,
        beatValue: bar.timeSignature.denominator,
      }).setMode(Voice.Mode.SOFT);
      voice.addTickables(vexNotes);
      new Formatter().joinVoices([voice]).format([voice], staveWidth - 80);
      voice.draw(context, stave);
    } catch {
      // Silently handle formatting errors
    }
  }
}

export function renderNotation(
  container: HTMLElement,
  bars: PianoBar[],
  clef: ClefType,
  octaveShift: number,
  barsPerRow: number = 4
): void {
  container.innerHTML = '';

  if (bars.length === 0) return;

  const staveHeight = 140;
  const stavesPerRow = barsPerRow;
  const staveWidth = Math.floor((container.clientWidth - 40) / stavesPerRow);
  const totalRows = Math.ceil(bars.length / stavesPerRow);
  const svgWidth = Math.min(container.clientWidth, stavesPerRow * staveWidth + 40);
  const svgHeight = totalRows * staveHeight + 40;

  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(svgWidth, svgHeight);
  const context = renderer.getContext();
  context.setFont('Arial', 10);

  const clefName = clef === 'treble' ? 'treble' : 'bass';

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const row = Math.floor(i / stavesPerRow);
    const col = i % stavesPerRow;
    const x = col * staveWidth + 20;
    const y = row * staveHeight + 20;

    const stave = new Stave(x, y, staveWidth - 10);

    if (col === 0) {
      stave.addClef(clefName);
    }
    if (i === 0) {
      stave.addTimeSignature(`${bar.timeSignature.numerator}/${bar.timeSignature.denominator}`);
    }

    stave.setContext(context).draw();

    renderVoiceOnStave(context, stave, bar, clef, octaveShift, staveWidth);
  }

}

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
  const systemGap = 40;
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
    const x = col * staveWidth + 40;
    const yTreble = row * rowHeight + 20;
    const yBass = yTreble + trebleHeight;

    const trebleStave = new Stave(x, yTreble, staveWidth - 10);
    if (col === 0) trebleStave.addClef('treble');
    if (i === 0 && trebleBars[0]) {
      trebleStave.addTimeSignature(
        `${trebleBars[0].timeSignature.numerator}/${trebleBars[0].timeSignature.denominator}`
      );
    }
    trebleStave.setContext(context).draw();

    const bassStave = new Stave(x, yBass, staveWidth - 10);
    if (col === 0) bassStave.addClef('bass');
    if (i === 0 && bassBars[0]) {
      bassStave.addTimeSignature(
        `${bassBars[0].timeSignature.numerator}/${bassBars[0].timeSignature.denominator}`
      );
    }
    bassStave.setContext(context).draw();

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

    renderVoiceOnStave(context, trebleStave, trebleBars[i], 'treble', trebleOctaveShift, staveWidth);
    renderVoiceOnStave(context, bassStave, bassBars[i], 'bass', bassOctaveShift, staveWidth);
  }
}
