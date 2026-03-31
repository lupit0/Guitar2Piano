import type { TrackData, TrackSettings, ClefType } from '../types';

interface TrackControlsProps {
  track: TrackData;
  settings: TrackSettings;
  isSelected: boolean;
  onSelect: () => void;
  onSettingsChange: (settings: TrackSettings) => void;
}

export function TrackControls({
  track,
  settings,
  isSelected,
  onSelect,
  onSettingsChange,
}: TrackControlsProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        rounded-xl border p-4 cursor-pointer transition-all duration-200
        ${
          isSelected
            ? 'border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-100'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }
        ${track.isPercussion ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isSelected ? 'bg-indigo-500' : 'bg-slate-300'
            }`}
          />
          <h3 className="font-medium text-slate-800 text-sm">{track.name}</h3>
        </div>
        {track.isPercussion && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Percussion
          </span>
        )}
        <label
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              onSettingsChange({ ...settings, enabled: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-checked:bg-indigo-500 rounded-full relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
        </label>
      </div>

      {settings.enabled && !track.isPercussion && (
        <div
          className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clef selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Clef</span>
            <div className="flex bg-slate-100 rounded-lg overflow-hidden">
              {(['treble', 'bass'] as ClefType[]).map((clef) => (
                <button
                  key={clef}
                  onClick={() => onSettingsChange({ ...settings, clef })}
                  className={`
                    px-3 py-1.5 text-xs font-medium transition-all capitalize
                    ${
                      settings.clef === clef
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }
                  `}
                >
                  {clef}
                </button>
              ))}
            </div>
          </div>

          {/* Octave shift */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-500">Octave</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    octaveShift: Math.max(-3, settings.octaveShift - 1),
                  })
                }
                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors text-sm font-bold"
              >
                -
              </button>
              <span
                className={`w-8 text-center text-sm font-mono ${
                  settings.octaveShift === 0 ? 'text-slate-500' : 'text-indigo-600'
                }`}
              >
                {settings.octaveShift > 0
                  ? `+${settings.octaveShift}`
                  : settings.octaveShift}
              </span>
              <button
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    octaveShift: Math.min(3, settings.octaveShift + 1),
                  })
                }
                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
