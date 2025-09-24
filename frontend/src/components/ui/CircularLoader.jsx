export default function CircularLoader({
  size = 56,
  strokeWidth = 8,
  color = '#5B3DF0',
  trackColor = '#E5E7EB',
  showTrack = false,
  arcLength = 0.78,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
    >
      {showTrack && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
      )}
      <g>
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(circumference * Math.min(Math.max(arcLength, 0.05), 0.95)).toFixed(2)} ${circumference.toFixed(2)}`}
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${center} ${center}`}
          to={`360 ${center} ${center}`}
          dur="0.9s"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  )
}


