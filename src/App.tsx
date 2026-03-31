import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { TrackControls } from './components/TrackControls';
import { NotationDisplay } from './components/NotationDisplay';
import { GrandStaffDisplay } from './components/GrandStaffDisplay';
import { ScoreHeader } from './components/ScoreHeader';
import { Toolbar } from './components/Toolbar';
import { parseGuitarProFile } from './gpParser';
import type { ParsedScore, TrackSettings, GrandStaffSettings } from './types';

function App() {
  const [score, setScore] = useState<ParsedScore | null>(null);
  const [trackSettings, setTrackSettings] = useState<Map<number, TrackSettings>>(new Map());
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [barsPerRow, setBarsPerRow] = useState(4);
  const [grandStaff, setGrandStaff] = useState<GrandStaffSettings>({
    enabled: false,
    trebleTrackIndex: 0,
    bassTrackIndex: 1,
  });

  const handleFileLoaded = useCallback((data: Uint8Array, fileName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = parseGuitarProFile(data);
      setScore(parsed);

      // Initialize settings for all tracks
      const settings = new Map<number, TrackSettings>();
      parsed.tracks.forEach((track) => {
        // Default: treble for non-bass instruments, bass for bass
        const isBass = track.name.toLowerCase().includes('bass');
        settings.set(track.index, {
          clef: isBass ? 'bass' : 'treble',
          octaveShift: 0,
          enabled: true,
        });
      });
      setTrackSettings(settings);
      setSelectedTrack(parsed.tracks[0]?.index ?? 0);
    } catch (err) {
      console.error('Failed to parse file:', err);
      setError(`Failed to parse "${fileName}". Make sure it's a valid Guitar Pro file.`);
      setScore(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrackSettings = useCallback(
    (trackIndex: number, settings: TrackSettings) => {
      setTrackSettings((prev) => {
        const next = new Map(prev);
        next.set(trackIndex, settings);
        return next;
      });
    },
    []
  );

  const availableTracks = score?.tracks
    .filter((t) => !t.isPercussion)
    .map((t) => ({ index: t.index, name: t.name })) ?? [];

  const enabledTracks = score?.tracks.filter(
    (t) => trackSettings.get(t.index)?.enabled && !t.isPercussion
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Guitar to Piano
              </h1>
              <p className="text-xs text-slate-400">Tab to notation converter</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* File Upload */}
        {!score && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Transform Guitar Tabs to Piano
              </h2>
              <p className="text-slate-500 text-lg">
                Upload a Guitar Pro file to convert tracks into piano sheet music
                with customizable clef and octave settings.
              </p>
            </div>
            <FileUpload onFileLoaded={handleFileLoaded} />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Parsing file...
            </div>
          </div>
        )}

        {/* Score loaded */}
        {score && !isLoading && (
          <div className="space-y-6">
            {/* Score info + new file button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <ScoreHeader
                  title={score.title}
                  artist={score.artist}
                  tempo={score.tempo}
                  trackCount={score.tracks.length}
                />
              </div>
              <button
                onClick={() => {
                  setScore(null);
                  setError(null);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New File
              </button>
            </div>

            <Toolbar
              barsPerRow={barsPerRow}
              onBarsPerRowChange={setBarsPerRow}
              grandStaffEnabled={grandStaff.enabled}
              onGrandStaffToggle={(enabled) => setGrandStaff((prev) => ({ ...prev, enabled }))}
              trebleTrackIndex={grandStaff.trebleTrackIndex}
              bassTrackIndex={grandStaff.bassTrackIndex}
              onTrebleTrackChange={(trebleTrackIndex) =>
                setGrandStaff((prev) => ({ ...prev, trebleTrackIndex }))
              }
              onBassTrackChange={(bassTrackIndex) =>
                setGrandStaff((prev) => ({ ...prev, bassTrackIndex }))
              }
              availableTracks={availableTracks}
            />

            <div className="grid grid-cols-12 gap-6">
              {/* Track list sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Tracks
                  </h3>
                  <span className="text-xs text-slate-400">
                    {enabledTracks?.length ?? 0} active
                  </span>
                </div>
                {score.tracks.map((track) => {
                  const settings = trackSettings.get(track.index) ?? {
                    clef: 'treble' as const,
                    octaveShift: 0,
                    enabled: true,
                  };
                  return (
                    <TrackControls
                      key={track.index}
                      track={track}
                      settings={settings}
                      isSelected={selectedTrack === track.index}
                      onSelect={() => setSelectedTrack(track.index)}
                      onSettingsChange={(s) => updateTrackSettings(track.index, s)}
                    />
                  );
                })}
              </div>

              {/* Notation display */}
              <div className="col-span-12 lg:col-span-8 space-y-4">
                {grandStaff.enabled && availableTracks.length >= 2 ? (
                  (() => {
                    const trebleTrack = score!.tracks.find(
                      (t) => t.index === grandStaff.trebleTrackIndex
                    );
                    const bassTrack = score!.tracks.find(
                      (t) => t.index === grandStaff.bassTrackIndex
                    );
                    const trebleSettings = trackSettings.get(grandStaff.trebleTrackIndex);
                    const bassSettings = trackSettings.get(grandStaff.bassTrackIndex);
                    if (!trebleTrack || !bassTrack) return null;
                    return (
                      <GrandStaffDisplay
                        key={`gs-${grandStaff.trebleTrackIndex}-${grandStaff.bassTrackIndex}-${trebleSettings?.octaveShift}-${bassSettings?.octaveShift}`}
                        trebleBars={trebleTrack.bars}
                        bassBars={bassTrack.bars}
                        trebleOctaveShift={trebleSettings?.octaveShift ?? 0}
                        bassOctaveShift={bassSettings?.octaveShift ?? 0}
                        trebleTrackName={trebleTrack.name}
                        bassTrackName={bassTrack.name}
                        barsPerRow={barsPerRow}
                      />
                    );
                  })()
                ) : enabledTracks && enabledTracks.length > 0 ? (
                  enabledTracks
                    .filter((t) => t.index === selectedTrack || enabledTracks.length <= 2)
                    .map((track) => {
                      const settings = trackSettings.get(track.index)!;
                      return (
                        <NotationDisplay
                          key={`${track.index}-${settings.clef}-${settings.octaveShift}`}
                          bars={track.bars}
                          clef={settings.clef}
                          octaveShift={settings.octaveShift}
                          trackName={track.name}
                          barsPerRow={barsPerRow}
                        />
                      );
                    })
                ) : (
                  <div className="flex items-center justify-center py-20 text-slate-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                      </svg>
                      <p>Enable a track to view its piano notation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
