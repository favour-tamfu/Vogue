/**
 * Decorative motif layer. Absolutely positioned, never interactive, never
 * announced to screen readers.
 *
 * Rules it enforces (CLAUDE.md §3.4):
 *   - pointer-events: none, so ornament can never eat a click
 *   - aria-hidden, so it never reaches assistive tech
 *   - clipped to the parent, so motifs bleed off-edge rather than scrolling
 *
 * The parent must be `relative`. Opacity stays in the 30–55% band and the
 * float durations are varied per instance so nothing ever syncs up.
 *
 * Hard rule: ornament never competes with a bid amount, a price, or the
 * verified badge. If a motif overlaps any of those, move the motif.
 */
export default function MotifLayer({ children, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {children}
    </div>
  )
}
