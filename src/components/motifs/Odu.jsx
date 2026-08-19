/**
 * Ọdụ — tusk curve. Hero accent (CLAUDE.md §3.3.1).
 */
export default function Odu({ size = 220, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 220 300"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '4.2s' }} strokeWidth="6"
          d="M110 290c0-50-6-92 14-124 20-32 56-40 62-68"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3s', '--delay': '1.7s' }} strokeWidth="4.4"
          d="M186 98c6-26-10-48-34-48-18 0-30 14-26 30 3 11 15 17 24 12"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s', '--delay': '2.3s' }} strokeWidth="3.6"
          d="M124 166c-28 2-52-14-58-40 28-2 52 14 58 40"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.2s', '--delay': '2.8s' }} strokeWidth="3"
          d="M116 226c22 4 42-6 50-26"/>
      </g>
      <circle cx="52"  cy="116" r="5.6" fill="#D89B3C" className={dot} style={{ '--delay': '4.2s' }}/>
      <circle cx="40"  cy="140" r="4.2" fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
      <circle cx="34"  cy="164" r="3"   fill="#D89B3C" className={dot} style={{ '--delay': '4.6s' }}/>
      <circle cx="176" cy="216" r="4.6" fill="#D89B3C" className={dot} style={{ '--delay': '4.5s' }}/>
    </svg>
  )
}
