/**
 * Mbubu — scarification band, alternating crosses and circles between two
 * rules. Header / footer rule (CLAUDE.md §3.3.2).
 */
export default function Mbubu({ className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''

  return (
    <svg
      viewBox="0 0 420 46"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`w-full ${className}`}
      style={{ height: 46, ...style }}
      {...props}
    >
      <path pathLength="1" className={draw} style={{ '--dur': '3.2s' }}
        d="M6 13h408" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path pathLength="1" className={draw} style={{ '--dur': '3.2s', '--delay': '.25s' }}
        d="M6 33h408" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <g stroke="#D89B3C" strokeWidth="2.4" strokeLinecap="round">
        <path d="M30 18l8 10M38 18l-8 10"/><path d="M110 18l8 10M118 18l-8 10"/>
        <path d="M190 18l8 10M198 18l-8 10"/><path d="M270 18l8 10M278 18l-8 10"/>
        <path d="M350 18l8 10M358 18l-8 10"/>
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="74" cy="23" r="5.5"/><circle cx="154" cy="23" r="5.5"/>
        <circle cx="234" cy="23" r="5.5"/><circle cx="314" cy="23" r="5.5"/>
        <circle cx="394" cy="23" r="5.5"/>
      </g>
    </svg>
  )
}
