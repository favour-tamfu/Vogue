/**
 * Akwụkwọ — leaf spray. Empty states (CLAUDE.md §3.3.1).
 */
export default function Akwukwo({ size = 200, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 200 320"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '3.6s' }} strokeWidth="6"
          d="M100 314C100 250 100 200 100 140"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '1.2s' }} strokeWidth="3.6"
          d="M100 250c-26-4-44-24-48-50 26 4 44 24 48 50"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '1.4s' }} strokeWidth="3.6"
          d="M100 250c26-4 44-24 48-50-26 4-44 24-48 50"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '1.9s' }} strokeWidth="3.2"
          d="M100 196c-22-4-38-20-42-42 22 4 38 20 42 42"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '2.1s' }} strokeWidth="3.2"
          d="M100 196c22-4 38-20 42-42-22 4-38 20-42 42"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.2s', '--delay': '2.6s' }} strokeWidth="3"
          d="M100 140c-12-16-10-38 4-52 12 16 10 38-4 52"/>
      </g>
      <circle cx="100" cy="76"  r="6" fill="#D89B3C" className={dot} style={{ '--delay': '4.2s' }}/>
      <circle cx="76"  cy="290" r="4" fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
      <circle cx="124" cy="290" r="4" fill="#D89B3C" className={dot} style={{ '--delay': '4.5s' }}/>
    </svg>
  )
}
