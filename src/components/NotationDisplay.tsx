import { useEffect, useRef } from 'react';
import { renderNotation } from '../notationRenderer';
import type { PianoBar, ClefType } from '../types';

interface NotationDisplayProps {
  bars: PianoBar[];
  clef: ClefType;
  octaveShift: number;
  trackName: string;
  barsPerRow: number;
}

export function NotationDisplay({ bars, clef, octaveShift, trackName, barsPerRow }: NotationDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || bars.length === 0) return;

    // Small delay to ensure container is measured
    const timer = requestAnimationFrame(() => {
      if (containerRef.current) {
        renderNotation(containerRef.current, bars, clef, octaveShift, barsPerRow);
      }
    });

    return () => cancelAnimationFrame(timer);
  }, [bars, clef, octaveShift, barsPerRow]);

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && bars.length > 0) {
        renderNotation(containerRef.current, bars, clef, octaveShift, barsPerRow);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bars, clef, octaveShift, barsPerRow]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h3 className="font-medium text-slate-800">{trackName}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full capitalize">
            {clef} clef
          </span>
          {octaveShift !== 0 && (
            <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
              {octaveShift > 0 ? '+' : ''}{octaveShift} octave{Math.abs(octaveShift) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="p-6 overflow-x-auto min-h-[200px]"
      />
    </div>
  );
}
