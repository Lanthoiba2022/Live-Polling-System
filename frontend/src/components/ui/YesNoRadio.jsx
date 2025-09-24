export default function YesNoRadio({ name, value, onChange }) {
  const idYes = `${name}-yes`
  const idNo = `${name}-no`
  return (
    <div className="flex items-center gap-6">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          id={idYes}
          type="radio"
          name={name}
          checked={value === 'Yes'}
          onChange={()=>onChange && onChange('Yes')}
          className="accent-[var(--primary-600)]"
        />
        <span>Yes</span>
      </label>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          id={idNo}
          type="radio"
          name={name}
          checked={value === 'No'}
          onChange={()=>onChange && onChange('No')}
          className="accent-[var(--primary-600)]"
        />
        <span>No</span>
      </label>
    </div>
  )
}


