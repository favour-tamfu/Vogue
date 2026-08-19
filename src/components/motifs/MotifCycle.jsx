/**
 * A slot that holds two or three motifs and lets them take turns.
 *
 * After a long interval the current motif shrinks and fades out and a
 * different one grows into its place — the ornament changes while you are
 * reading, rather than moving while you work.
 *
 * Three nested elements, each owning exactly one transform, so no two
 * animations ever fight over the same property:
 *   outer  — float drift        (translate / rotate)
 *   middle — morph in and out   (opacity / scale)
 *   inner  — flex centring      (static)
 * The motifs keep their natural aspect ratios, which differ widely
 * (Ọmụmụ is 180×400, Anyanwụ is 200×200), so they are centred rather than
 * stretched to a common box.
 *
 * Usage:
 *   <MotifCycle
 *     motifs={[Omumu, Akwukwo, Osisi]}
 *     size={280}
 *     className="absolute -left-16 bottom-0 text-sand opacity-40"
 *   />
 */
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
  animateFirst = true,
}) {
  const slots = motifs.length
  if (!slots) return null

  // One motif has nothing to hand over to — breathe in place instead.
  const morphClass = slots === 1
    ? 'motif-breathe'
    : slots === 2 ? 'motif-morph motif-morph-2' : 'motif-morph motif-morph-3'

  const cycleValue = cycle || (slots === 2 ? '52s' : slots === 3 ? '66s' : '44s')

  // Stagger each motif by an equal share of the cycle so the handover is
  // continuous and no two are ever fully opaque at the same moment.
  const step = parseFloat(cycleValue) / Math.max(slots, 1)

  return (
    <span
      className={`${float} inline-block ${className}`}
      style={{ '--fd': floatDuration, '--delay': delay }}
    >
      <span className="relative block" style={{ width: size, height: size }}>
        {motifs.map((Motif, i) => (
          <span
            key={i}
            className={`${morphClass} absolute inset-0 flex items-center justify-center`}
            style={{
              '--cycle': cycleValue,
              '--delay': `${(step * i).toFixed(1)}s`,
            }}
          >
            <Motif
              size={sizes?.[i] ?? size}
              /* Only the first draws itself on. The rest grow in via the
                 morph, which is the same gesture at a fraction of the cost. */
              animate={animateFirst && i === 0}
              className={motifClassName}
            />
          </span>
        ))}
      </span>
    </span>
  )
}
