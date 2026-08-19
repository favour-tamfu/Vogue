/**
 * Ìsì — the knot, two lines becoming one.
 * Hired / match confirmed (CLAUDE.md §3.3.3).
 */
export default function Isi({ size = 40, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Match confirmed"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round">
        <path
          pathLength="1"
          className="motif-draw"
          style={{ '--dur': '2.6s' }}
          d="M60 22c22 0 38 16 38 34 0 16-13 28-29 28-13 0-24-11-24-24 0-11 9-19 19-19"
        />
        <path
          pathLength="1"
          className="motif-draw"
          style={{ '--dur': '2.6s', '--delay': '.35s' }}
          d="M60 22c-22 0-38 16-38 34 0 16 13 28 29 28 13 0 24-11 24-24 0-11-9-19-19-19"
        />
      </g>
      <circle
        cx="60" cy="41" r="5.5"
        fill="#D89B3C"
        className="motif-dot"
        style={{ '--delay': '2.8s' }}
      />
    </svg>
  )
}
