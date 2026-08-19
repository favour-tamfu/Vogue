// Single source of truth for the mark.
// Favour chose 7A ("Seated rows") — CLAUDE.md §1.1 #1, resolved.
const VARIANT = '7a'   // '7a' | '7b'

const TONES = {
  '7a': {
    default: { row: '#B4502A', dot: '#D89B3C' },
    dark:    { row: '#F2D9A8', dot: '#D89B3C' },
    mono:    { row: '#2B2118', dot: '#2B2118' },
  },
  '7b': {
    default: { row: '#B4502A', runner: '#D89B3C', dot: '#B4502A' },
    dark:    { row: '#F2D9A8', runner: '#D89B3C', dot: '#F2D9A8' },
    mono:    { row: '#2B2118', runner: '#6B5E4F', dot: '#2B2118' },
  },
}

export default function AvenueMark({ tone = 'default', compact = false, ...props }) {
  const c = TONES[VARIANT][tone]

  if (VARIANT === '7a') {
    return compact ? (
      <svg viewBox="0 0 120 114" fill="none" role="img" aria-label="Avenue" {...props}>
        <g stroke={c.row} strokeLinecap="round">
          <path d="M6 102h30" strokeWidth="15"/><path d="M84 102h30" strokeWidth="15"/>
          <path d="M22 74h20" strokeWidth="12"/><path d="M78 74h20" strokeWidth="12"/>
        </g>
        <circle cx="60" cy="30" r="13" fill={c.dot}/>
      </svg>
    ) : (
      <svg viewBox="0 0 120 114" fill="none" role="img" aria-label="Avenue" {...props}>
        <g stroke={c.row} strokeLinecap="round">
          <path d="M8 104h26"  strokeWidth="11"/><path d="M86 104h26" strokeWidth="11"/>
          <path d="M16 87h22"  strokeWidth="9.5"/><path d="M82 87h22"  strokeWidth="9.5"/>
          <path d="M24 70h18"  strokeWidth="8"/><path d="M78 70h18"    strokeWidth="8"/>
          <path d="M32 53h14"  strokeWidth="6.5"/><path d="M74 53h14"  strokeWidth="6.5"/>
          <path d="M40 36h10"  strokeWidth="5"/><path d="M70 36h10"    strokeWidth="5"/>
        </g>
        <circle cx="60" cy="18" r="8.5" fill={c.dot}/>
      </svg>
    )
  }

  return compact ? (
    <svg viewBox="0 0 120 114" role="img" aria-label="Avenue" {...props}>
      <path d="M28 108 L92 108 L70 26 L50 26 Z"  fill={c.runner}/>
      <path d="M2 108 L24 108 L48 26 L40 26 Z"   fill={c.row}/>
      <path d="M118 108 L96 108 L72 26 L80 26 Z" fill={c.row}/>
    </svg>
  ) : (
    <svg viewBox="0 0 120 114" role="img" aria-label="Avenue" {...props}>
      <path d="M30 106 L90 106 L69 28 L51 28 Z"  fill={c.runner}/>
      <path d="M4 106 L26 106 L49 28 L42 28 Z"   fill={c.row}/>
      <path d="M116 106 L94 106 L71 28 L78 28 Z" fill={c.row}/>
      <circle cx="60" cy="15" r="8" fill={c.dot}/>
    </svg>
  )
}
