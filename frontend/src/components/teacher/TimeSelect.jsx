export default function TimeSelect({ value = 60, onChange }) {
  const options = [15, 30, 45, 60, 90, 120]
  return (
    <div className="relative inline-block">
      <select
        className="appearance-none pr-8 pl-4 h-10 rounded-md border border-[#E5E7EB] text-[14px] bg-[#F2F2F2]"
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
      >
        {options.map((s)=> (
          <option key={s} value={s}>{s} seconds</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><img src="/dropdown.svg" alt="Dropdown Icon" /></span>
    </div>
  )
}


