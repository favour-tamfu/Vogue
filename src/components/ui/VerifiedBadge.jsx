/**
 * The platform's core trust signal and the main differentiator against
 * competitors that don't verify at all.
 *
 * FLAT AND IDENTICAL EVERYWHERE. No motifs, no gradients, no variants,
 * no animation, no size variations. Never re-implement this inline.
 * `verified` / `verified-bg` are reserved for this component — do not
 * reuse those tokens for generic success states. (CLAUDE.md §3.5)
 */
export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-verified-bg
                     px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide text-verified">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3.4"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      VERIFIED
    </span>
  )
}
