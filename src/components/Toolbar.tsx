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
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
  onExportPdf: () => void;
  isExporting: boolean;
}

export function Toolbar({
  barsPerRow,
  onBarsPerRowChange,
  grandStaffEnabled,
  onGrandStaffToggle,
  trebleTrackIndex,
  bassTrackIndex,
  onTrebleTrackChange,
  onBassTrackChange,
  availableTracks,
  rowsPerPage,
  onRowsPerPageChange,
  onExportPdf,
  isExporting,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 bg-white rounded-xl border border-slate-200 px-5 py-3">
      {/* Bars per row */}
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

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200" />

      {/* Grand Staff toggle */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Grand Staff</label>
        <button
          onClick={() => onGrandStaffToggle(!grandStaffEnabled)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            grandStaffEnabled
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {grandStaffEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Track selectors (shown when grand staff is on) */}
      {grandStaffEnabled && availableTracks.length >= 2 && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Treble</label>
            <select
              value={trebleTrackIndex}
              onChange={(e) => onTrebleTrackChange(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableTracks.map((t) => (
                <option key={t.index} value={t.index}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Bass</label>
            <select
              value={bassTrackIndex}
              onChange={(e) => onBassTrackChange(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableTracks.map((t) => (
                <option key={t.index} value={t.index}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200" />

      {/* Rows per page */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Rows/page</label>
        <div className="flex gap-1">
          {[2, 3, 4, 5, 6, 8].map((n) => (
            <button
              key={n}
              onClick={() => onRowsPerPageChange(n)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                rowsPerPage === n
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Export PDF button */}
      <button
        onClick={onExportPdf}
        disabled={isExporting}
        className="ml-auto px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </>
        )}
      </button>
    </div>
  );
}
