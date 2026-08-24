'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Decorative motif layer. Absolutely positioned, never interactive, never
 * announced to screen readers.
 *
 * Rules it enforces (CLAUDE.md §3.4):
 *   - pointer-events: none, so ornament can never eat a click
 *   - aria-hidden, so it never reaches assistive tech
 *   - clipped to the parent, so motifs bleed off-edge rather than scrolling
 *
 * The parent must be `relative`, and page content must sit in a positioned
 * wrapper above it (`relative z-10`). A positioned layer at z-index 0 paints
 * ABOVE non-positioned siblings, so without that the ornament draws over
 * cards instead of behind them.
 *
 * Motifs stay paused until the layer scrolls into view, so a growth you never
 * saw hasn't already finished by the time you reach it. The trigger is
 * one-shot — scrolling back up does not replay it, which would turn the page
 * into a flipbook. Pausing is scoped to `.motif-field`, so functional motifs
 * outside a layer (the Agwọ spinner, empty-state illustrations, Ìsì on a
 * confirmation) run immediately as they should.
 *
 * `position` is a prop rather than a class passed in, because `absolute` and
 * `fixed` are both Tailwind position utilities — passing one in alongside the
 * built-in `absolute` just produces two competing declarations and Tailwind's
 * source order decides the winner, not the caller.
 */
export default function MotifLayer({ children, className = '', position = 'absolute' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver (or reduced motion) — just show them.
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()   // one-shot
        }
      },
      // Start a little before the edge so the growth is already underway by
      // the time the area is properly on screen.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`motif-field ${inView ? 'motif-visible' : ''} ${position} inset-0
                  overflow-hidden pointer-events-none select-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {children}
    </div>
  )
}
