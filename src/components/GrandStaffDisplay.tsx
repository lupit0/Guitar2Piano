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

export function GrandStaffDisplay({
  trebleBars,
  bassBars,
  trebleOctaveShift,
  bassOctaveShift,
  trebleTrackName,
  bassTrackName,
  barsPerRow,
}: GrandStaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const timer = requestAnimationFrame(() => {
      if (containerRef.current) {
        renderGrandStaff(
          containerRef.current,
          trebleBars,
          bassBars,
          trebleOctaveShift,
          bassOctaveShift,
          barsPerRow
        );
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [trebleBars, bassBars, trebleOctaveShift, bassOctaveShift, barsPerRow]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        renderGrandStaff(
          containerRef.current,
          trebleBars,
          bassBars,
          trebleOctaveShift,
          bassOctaveShift,
          barsPerRow
        );
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [trebleBars, bassBars, trebleOctaveShift, bassOctaveShift, barsPerRow]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h3 className="font-medium text-slate-800">Grand Staff</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            Treble: {trebleTrackName}
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full">
            Bass: {bassTrackName}
          </span>
        </div>
      </div>
      <div ref={containerRef} className="p-6 overflow-x-auto min-h-[300px]" />
    </div>
  );
}
