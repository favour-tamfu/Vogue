/**
 * Nnyọ — mirror spiral. Avatar frames, decorative (CLAUDE.md §3.3.1).
 */
export default function Nnyo({ size = 240, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 240 300"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '4.8s' }} strokeWidth="6"
          d="M120 262c-38 0-68-28-68-64 0-30 24-54 52-54 24 0 42 18 42 40 0 18-14 32-30 32-13 0-23-10-23-22 0-9 7-16 15-16"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.8s', '--delay': '2.4s' }} strokeWidth="3.6"
          d="M120 262c38 0 70-24 78-58"/>
      </g>
      <circle cx="196" cy="230" r="6"   fill="#D89B3C" className={dot} style={{ '--delay': '4.6s' }}/>
      <circle cx="176" cy="248" r="4.4" fill="#D89B3C" className={dot} style={{ '--delay': '4.8s' }}/>
      <circle cx="154" cy="260" r="3"   fill="#D89B3C" className={dot} style={{ '--delay': '5s'   }}/>
      <circle cx="46"  cy="122" r="4.4" fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
    </svg>
  )
}
