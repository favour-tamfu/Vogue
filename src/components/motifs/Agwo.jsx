/**
 * Agwọ — the coil. This is the app's loading spinner (CLAUDE.md §3.3.3).
 * Replace every generic spinner with it.
 *
 * CSS-only animation (.agwo-spin in globals.css) — never framer-motion.
 * Respects prefers-reduced-motion.
 */
export default function Agwo({ size = 24, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="status"
      aria-label="Loading"
      className={className}
      {...props}
    >
      <g className="agwo-spin">
        <path
          d="M60 12c26 0 48 21 48 48s-22 48-48 48c-23 0-42-19-42-42 0-19 15-34 34-34 16 0 28 12 28 28 0 12-10 22-22 22-9 0-17-8-17-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="60" cy="12" r="5" fill="#D89B3C" />
      </g>
    </svg>
  )
}
