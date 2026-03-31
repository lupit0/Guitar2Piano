interface ToolbarProps {
  barsPerRow: number;
  onBarsPerRowChange: (n: number) => void;
}

export function Toolbar({ barsPerRow, onBarsPerRowChange }: ToolbarProps) {
  return (
    <div className="flex items-center gap-6 bg-white rounded-xl border border-slate-200 px-5 py-3">
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
    </div>
  );
}
