/**
 * A slot that holds two or three motifs and lets them take turns.
 *
 * One turn is: the motif draws itself on exactly as it does on first load,
 * flows gently for a long while, then fades out. The slot rests a beat, and a
 * different motif draws itself on — offset a few pixels, so it never regrows
 * on the same spot.
 *
 * Three nested elements, each owning exactly one transform, so no two
 * animations ever fight over the same property:
 *   outer  — float drift            (translate / rotate)
 *   middle — turn: fade + offset    (opacity / translate)
 *   inner  — flex centring          (static)
 * The motifs keep their natural aspect ratios, which differ widely
 * (Ọmụmụ is 180×400, Anyanwụ is 200×200), so they letterbox inside a square
 * slot rather than stretching to it.
 *
 * Usage:
 *   <MotifCycle
 *     motifs={GROWTH}
 *     size={280}
 *     className="absolute -left-16 bottom-0 text-sand opacity-40"
 *   />
 */

// A few pixels of drift between turns so a motif never regrows on the exact
// spot the last one left. Deliberately small — this is a nudge, not a move.
const OFFSETS = [
  { ox: '0px',   oy: '0px'  },
  { ox: '11px',  oy: '-9px' },
  { ox: '-8px',  oy: '10px' },
]

export default function MotifCycle({
  motifs = [],
  size = 260,
  sizes,
  cycle,
  float = 'motif-float',
  floatDuration = '22s',
  delay = '0s',
  className = '',
  motifClassName = '',
}) {
  // Two or three per slot. More than three makes any one motif's turn so rare
  // it reads as random; one has nothing to hand over to.
  const chosen = motifs.slice(0, 3)
  const slots  = chosen.length
  if (slots < 2) return null

  const turnClass  = slots === 2 ? 'motif-turn motif-turn-2' : 'motif-turn motif-turn-3'
  const cycleValue = cycle || (slots === 2 ? '60s' : '90s')

  // Stagger each motif by an equal share of the cycle so exactly one is
  // visible at a time and the hand-over is continuous.
  const step = parseFloat(cycleValue) / slots

  return (
    <span
      className={`${float} inline-block ${className}`}
      style={{ '--fd': floatDuration, '--delay': delay }}
    >
      <span className="relative block" style={{ width: size, height: size }}>
        {chosen.map((Motif, i) => (
          <span
            key={i}
            className={`${turnClass} absolute inset-0 flex items-center justify-center`}
            style={{
              '--cycle':      cycleValue,
              '--turn-delay': `${(step * i).toFixed(1)}s`,
              '--ox':         OFFSETS[i].ox,
              '--oy':         OFFSETS[i].oy,
            }}
          >
            <Motif
              size={sizes?.[i] ?? size}
              /* Always true: the paths need the motif-draw / motif-dot classes
                 present, because the turn CSS re-drives them as looping
                 animations so the growth repeats on every turn. */
              animate
              className={motifClassName}
              /* `size` sets the SVG's width attribute, but the viewBoxes are
                 tall — Ọmụmụ is 180×400 — so height resolves from the aspect
                 ratio and the motif renders over twice `size` tall, spilling
                 out of the slot. Pinning both axes in CSS (which beats the
                 width attribute) makes the box exactly the slot, and the
                 default preserveAspectRatio letterboxes the drawing inside. */
              style={{ width: '100%', height: '100%' }}
            />
          </span>
        ))}
      </span>
    </span>
  )
}
