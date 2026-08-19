import AvenueMark from './AvenueMark'

/**
 * The lockup follows from the name: a·venue. The mark REPLACES the leading
 * "a" — [mark]venue. This is the primary lockup, not an alternate.
 *
 * variant: 'full'      → [mark]venue   (primary lockup)
 *          'mark'      → mark alone
 *          'wordmark'  → "avenue" as text, no mark
 * tone:    'default' | 'dark' | 'mono'
 * size:    font-size in px; the mark scales from it
 *
 * Minimum legible size for 'full' is 96px wide — below that use 'mark'.
 * Never place on ochre or terracotta. Cream, white or ink only.
 */
export default function Logo({ variant = 'full', tone = 'default', size = 32, className }) {
  const color = tone === 'dark' ? '#FFFFFF' : '#2B2118'

  if (variant === 'mark') {
    return <AvenueMark tone={tone} style={{ height: size, width: 'auto' }} className={className} />
  }

  return (
    <span
      className={className}
      style={{
        display:     'inline-flex',
        alignItems:  'flex-end',
        gap:         '0.03em',
        fontSize:    size,
        lineHeight:  0.78,
      }}
    >
      {variant === 'full' && (
        <AvenueMark tone={tone} style={{ height: '0.80em', width: 'auto', display: 'block' }} />
      )}
      <span
        style={{
          fontFamily:           'var(--font-display)',
          fontVariationSettings: "'opsz' 90, 'SOFT' 10, 'WONK' 0",
          fontWeight:           700,
          letterSpacing:        '-0.035em',
          lineHeight:           0.78,
          color,
        }}
      >
        {variant === 'wordmark' ? 'avenue' : 'venue'}
      </span>
    </span>
  )
}
