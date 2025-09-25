export default function BrandBadge({ label = 'Intervue Poll', className = '' }) {
  return (
    <span
      className={["brand-badge", className].filter(Boolean).join(' ')}
      aria-label={label}
    >
      <img className="brand-badge__icon" src="/ip.svg" alt="spark" aria-hidden="true" />
      {label}
    </span>
  )
}


