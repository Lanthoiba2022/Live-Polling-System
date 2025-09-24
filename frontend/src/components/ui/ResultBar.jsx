export default function ResultBar({ index, label, value = 0, total = 0, color = 'var(--primary-500)' }) {
  const pct = total > 0 ? Math.round((value * 100) / total) : 0
  return (
    <div className="relative rounded-md border border-gray-200 bg-white overflow-hidden">
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--primary-500), var(--primary-600))` }}
      />
      <div className="relative flex items-center justify-between px-3 h-12">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 grid place-items-center rounded-full bg-white border text-[var(--primary-700)] font-semibold">{index}</span>
          <span className="font-medium" style={{ color: pct ? '#fff' : '#111827' }}>{label}</span>
        </div>
        <span className="font-semibold" style={{ color: pct ? '#fff' : '#111827' }}>{pct}%</span>
      </div>
    </div>
  )
}


