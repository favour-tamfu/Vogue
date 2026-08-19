/**
 * Ọnụ ụzọ — threshold. Empty states (CLAUDE.md §3.3.3).
 */
export default function Onuuzo({ size = 200, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '3.4s' }} strokeWidth="6"
          d="M100 168c-34 0-60-24-60-56 0-26 20-46 44-46"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3.4s', '--delay': '.3s' }} strokeWidth="6"
          d="M100 168c34 0 60-24 60-56 0-26-20-46-44-46"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.2s', '--delay': '2.4s' }}
          strokeWidth="4.6" strokeLinejoin="round"
          d="M84 66c4-16 14-26 16-32 2 6 12 16 16 32"/>
      </g>
      <circle cx="100" cy="120" r="7" fill="#D89B3C" className={dot} style={{ '--delay': '4s'   }}/>
      <circle cx="72"  cy="150" r="4" fill="#D89B3C" className={dot} style={{ '--delay': '4.2s' }}/>
      <circle cx="128" cy="150" r="4" fill="#D89B3C" className={dot} style={{ '--delay': '4.3s' }}/>
    </svg>
  )
}
