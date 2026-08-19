/**
 * Ǹkụ́ — corner flourish. Section edges (CLAUDE.md §3.3.1).
 */
export default function Nku({ size = 260, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 260 300"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '4.4s' }} strokeWidth="6.5"
          d="M14 286c60 4 108-14 140-54 30-38 34-84 18-110"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3s', '--delay': '1.8s' }} strokeWidth="4.6"
          d="M172 122c-10-24-2-50 20-58 16-6 32 4 30 20-2 12-14 18-23 13"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '2.4s' }} strokeWidth="3.6"
          d="M154 232c34 6 66-6 84-34"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.2s', '--delay': '2.9s' }} strokeWidth="3"
          d="M96 268c14 18 38 26 62 20"/>
      </g>
      <circle cx="248" cy="192" r="6"   fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
      <circle cx="240" cy="216" r="4.4" fill="#D89B3C" className={dot} style={{ '--delay': '4.6s' }}/>
      <circle cx="228" cy="236" r="3"   fill="#D89B3C" className={dot} style={{ '--delay': '4.8s' }}/>
    </svg>
  )
}
