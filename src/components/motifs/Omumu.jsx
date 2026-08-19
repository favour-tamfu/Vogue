/**
 * Ọmụmụ — "growth", the rising tendril. Hero left anchor (CLAUDE.md §3.3.1).
 *
 * Stem draws first, tendrils follow, ntupo dots bloom last.
 * Strokes inherit currentColor so the motif works on cream and on ink.
 */
export default function Omumu({ size = 180, className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      width={size}
      viewBox="0 0 180 400"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '4.6s' }} strokeWidth="7"
          d="M90 396C84 340 80 300 92 262 104 224 130 202 140 172"/>
        <path pathLength="1" className={draw} style={{ '--dur': '3.2s', '--delay': '1.6s' }} strokeWidth="5"
          d="M140 172c9-27 1-54-20-61-16-5-30 7-26 22 3 10 14 15 22 10"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.8s', '--delay': '2.2s' }} strokeWidth="4"
          d="M92 262c-26-10-46-36-46-66 24 8 42 36 46 66"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.4s', '--delay': '2.9s' }} strokeWidth="3.2"
          d="M80 300c-22 2-38-12-38-30 18 0 32 14 38 30"/>
      </g>
      <circle cx="150" cy="212" r="6"   fill="#D89B3C" className={dot} style={{ '--delay': '4.4s' }}/>
      <circle cx="158" cy="240" r="4.6" fill="#D89B3C" className={dot} style={{ '--delay': '4.6s' }}/>
      <circle cx="162" cy="266" r="3.4" fill="#D89B3C" className={dot} style={{ '--delay': '4.8s' }}/>
      <circle cx="164" cy="288" r="2.4" fill="#D89B3C" className={dot} style={{ '--delay': '5s'   }}/>
    </svg>
  )
}
