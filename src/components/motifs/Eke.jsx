/**
 * Eke — python, the double sweep. Hero right anchor (CLAUDE.md §3.3.1).
 */
export default function Eke({ size = 240, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 240 420"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '5s' }} strokeWidth="7"
          d="M66 412c38-60 50-116 36-172-14-56 0-108 44-140"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3.4s', '--delay': '1.9s' }} strokeWidth="5"
          d="M146 100c30-22 64-10 68 18 3 22-16 37-34 30-12-5-16-20-6-27"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3s', '--delay': '2.6s' }} strokeWidth="4.2"
          d="M102 240c36 14 76 4 98-26 18-25 14-56-2-68"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '3.3s' }} strokeWidth="3.2"
          d="M108 330c-30 6-54-8-60-30 24-4 48 10 60 30"/>
      </g>
      <circle cx="204" cy="248" r="7"   fill="#D89B3C" className={dot} style={{ '--delay': '4.8s' }}/>
      <circle cx="212" cy="278" r="5.4" fill="#D89B3C" className={dot} style={{ '--delay': '5s'   }}/>
      <circle cx="216" cy="306" r="4"   fill="#D89B3C" className={dot} style={{ '--delay': '5.2s' }}/>
      <circle cx="217" cy="330" r="2.8" fill="#D89B3C" className={dot} style={{ '--delay': '5.4s' }}/>
      <circle cx="80"  cy="120" r="5"   fill="#D89B3C" className={dot} style={{ '--delay': '5.1s' }}/>
      <circle cx="66"  cy="146" r="3.6" fill="#D89B3C" className={dot} style={{ '--delay': '5.3s' }}/>
    </svg>
  )
}
