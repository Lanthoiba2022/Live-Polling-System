export default function BrandBadge({ label = 'Intervue Poll', className = '' }) {
  return (
    <span
      className={
        'inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold text-white '+
        'shadow-[0_6px_16px_rgba(83,76,255,0.35)] bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-700)] '+
        className
      }
      aria-label={label}
    >
      <SparkIcon />
      {label}
    </span>
  )
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2l1.6 3.8L18 7.5l-3.6 2.1L12 13l-2.4-3.4L6 7.5l4.4-1.7L12 2z" fill="white"/>
      <circle cx="18.5" cy="5.5" r="1.5" fill="white"/>
      <circle cx="5.5" cy="8" r="1" fill="white"/>
    </svg>
  )
}


