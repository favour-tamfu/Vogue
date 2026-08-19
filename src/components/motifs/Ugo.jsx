/**
 * Ugo — eagle feather. Top-rated provider (CLAUDE.md §3.3.4).
 */
export default function Ugo({ size = 140, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  const barbs = [
    'M74 240c-18-6-30-22-32-42', 'M74 240c18-10 28-28 28-48',
    'M72 196c-16-6-26-20-28-38', 'M72 196c16-10 26-26 26-44',
    'M76 152c-14-6-22-18-24-34', 'M76 152c14-10 22-24 22-40',
  ]

  return (
    <svg
      width={size}
      viewBox="0 0 140 300"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '4s' }} strokeWidth="6"
          d="M70 290C70 220 66 150 78 100c8-34 26-58 30-84"/>
        <g strokeWidth="3.2">
          {barbs.map((d, i) => (
            <path key={d} d={d} pathLength="1" className={draw}
              style={{ '--dur': '2s', '--delay': `${1.8 + i * 0.14}s` }}/>
          ))}
        </g>
      </g>
      <circle cx="112" cy="30" r="6" fill="#D89B3C" className={dot} style={{ '--delay': '4.2s' }}/>
      <circle cx="104" cy="52" r="4" fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
    </svg>
  )
}
