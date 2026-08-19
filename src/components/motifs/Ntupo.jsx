/**
 * Ntupo — dot-and-curl divider. Section separator (CLAUDE.md §3.3.2).
 * Renders full-width; the viewBox stretches so it always spans its container.
 */
export default function Ntupo({ className = '', style, animate = true, ...props }) {
  const draw = animate ? 'motif-draw' : ''
  const dot  = animate ? 'motif-dot'  : ''

  return (
    <svg
      viewBox="0 0 420 42"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`w-full ${className}`}
      style={{ height: 42, ...style }}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" fill="none">
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s' }} d="M6 21c48 0 78 0 118 0"/>
        <path pathLength="1" className={draw} style={{ '--dur': '2.6s' }} d="M296 21c40 0 70 0 118 0"/>
        <path pathLength="1" className={draw} style={{ '--dur': '1.8s', '--delay': '1.2s' }}
          d="M124 21c14-10 26-14 36-8 8 5 6 15-3 16-6 1-10-4-8-9"/>
        <path pathLength="1" className={draw} style={{ '--dur': '1.8s', '--delay': '1.2s' }}
          d="M296 21c-14-10-26-14-36-8-8 5-6 15 3 16 6 1 10-4 8-9"/>
      </g>
      <circle cx="182" cy="21" r="3.2" fill="#D89B3C" className={dot} style={{ '--delay': '2.6s' }}/>
      <circle cx="196" cy="21" r="5"   fill="#D89B3C" className={dot} style={{ '--delay': '2.75s' }}/>
      <circle cx="210" cy="21" r="3.2" fill="#D89B3C" className={dot} style={{ '--delay': '2.9s' }}/>
      <circle cx="224" cy="21" r="5"   fill="#D89B3C" className={dot} style={{ '--delay': '3.05s' }}/>
    </svg>
  )
}
