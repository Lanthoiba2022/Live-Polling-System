export default function YesNoRadio({ name, value, onChange }) {
  const idYes = `${name}-yes`
  const idNo = `${name}-no`
  return (
    <div className="custom-radio-group">
      <div className="custom-radio-option">
        <label>
          <input
            id={idYes}
            type="radio"
            name={name}
            checked={value === 'Yes'}
            onChange={()=>onChange && onChange('Yes')}
          />
          <span className="custom-radio-text">Yes</span>
        </label>
      </div>
      <div className="custom-radio-option">
        <label>
          <input
            id={idNo}
            type="radio"
            name={name}
            checked={value === 'No'}
            onChange={()=>onChange && onChange('No')}
          />
          <span className="custom-radio-text">No</span>
        </label>
      </div>
    </div>
  )
}


