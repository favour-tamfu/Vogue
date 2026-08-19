/**
 * Anyanwụ — the sun, spiral core radiating.
 * Onboarding / new (CLAUDE.md §3.3.4).
 *
 * CSS-only animation. Every animated path carries pathLength="1" so the
 * draw-on works regardless of geometry (§3.4).
 */
export default function Anyanwu({ size = 200, className = '', style, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g fill="none" stroke="#B4502A" strokeLinecap="round">
        <path
          pathLength="1"
          className="motif-draw"
          style={{ '--dur': '4.2s' }}
          strokeWidth="6"
          d="M100 142c-24 0-42-18-42-42 0-18 14-32 32-32 14 0 24 10 24 24 0 10-8 18-18 18-7 0-13-6-13-13"
        />
        <g strokeWidth="4">
          {[
            'M100 24v-14', 'M154 46l10-10', 'M176 100h14', 'M154 154l10 10',
            'M100 176v14', 'M46 154l-10 10', 'M24 100H10', 'M46 46L36 36',
          ].map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength="1"
              className="motif-draw"
              style={{ '--dur': '2.4s', '--delay': `${3.2 + i * 0.12}s` }}
            />
          ))}
        </g>
      </g>
      <circle cx="164" cy="72"  r="4" fill="#D89B3C" className="motif-dot" style={{ '--delay': '4.6s' }} />
      <circle cx="36"  cy="128" r="4" fill="#D89B3C" className="motif-dot" style={{ '--delay': '4.8s' }} />
    </svg>
  )
}
