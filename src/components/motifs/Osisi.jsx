/**
 * Ọsisi — the tree. Stats and growth panels (CLAUDE.md §3.3.4).
 */
export default function Osisi({ size = 200, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 200 280"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '3.4s' }} strokeWidth="7"
          d="M100 272V150"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '1.4s' }} strokeWidth="4.6"
          d="M100 178c-20-4-34-20-38-42"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '1.6s' }} strokeWidth="4.6"
          d="M100 178c20-4 34-20 38-42"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '2.2s' }} strokeWidth="4"
          d="M100 150c-14-14-16-36-6-52"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '2.4s' }} strokeWidth="4"
          d="M100 150c14-14 16-36 6-52"/>
      </g>
      <circle cx="58"  cy="128" r="6" fill="#D89B3C" className={dot} style={{ '--delay': '4s'   }}/>
      <circle cx="142" cy="128" r="6" fill="#D89B3C" className={dot} style={{ '--delay': '4.2s' }}/>
      <circle cx="100" cy="86"  r="7" fill="#D89B3C" className={dot} style={{ '--delay': '4.6s' }}/>
    </svg>
  )
}
