import MotifLayer from './MotifLayer'
import {
  Omumu, Eke, Akwukwo, Nku, Odu, Nnyo, Ugo, Osisi, Anyanwu,
} from './index'

/**
 * Fixed, low-contrast motif backdrop for signed-in app pages.
 *
 * Each section gets a different motif so pages feel distinct without a
 * different layout. Opacity is deliberately at the bottom of the 30–55% band
 * and dialled further down here, because these are dense pages — ornament must
 * never compete with a bid amount, a price, or the verified badge (§3.4).
 */
const SECTIONS = {
  dashboard:    { Motif: Osisi,   size: 380, pos: 'top-24 -right-20',    float: 'motif-float',  fd: '25s' },
  jobs:         { Motif: Odu,     size: 340, pos: 'top-32 -left-24',     float: 'motif-float2', fd: '22s' },
  myJobs:       { Motif: Nku,     size: 360, pos: 'bottom-10 -right-24', float: 'motif-float',  fd: '24s' },
  providers:    { Motif: Ugo,     size: 300, pos: 'top-28 -right-16',    float: 'motif-float2', fd: '21s' },
  feed:         { Motif: Eke,     size: 360, pos: 'top-40 -left-20',     float: 'motif-float',  fd: '27s' },
  messages:     { Motif: Nnyo,    size: 320, pos: 'bottom-16 -left-24',  float: 'motif-float2', fd: '23s' },
  bids:         { Motif: Omumu,   size: 320, pos: 'bottom-0 -right-16',  float: 'motif-float',  fd: '20s' },
  portfolio:    { Motif: Akwukwo, size: 300, pos: 'top-32 -right-16',    float: 'motif-float2', fd: '26s' },
  verification: { Motif: Anyanwu, size: 340, pos: 'top-28 -left-20',     float: 'motif-float',  fd: '22s' },
  profile:      { Motif: Nnyo,    size: 320, pos: 'top-32 -right-20',    float: 'motif-float2', fd: '24s' },
}

export default function AppBackdrop({ section = 'dashboard' }) {
  const cfg = SECTIONS[section]
  if (!cfg) return null

  const { Motif, size, pos, float, fd } = cfg

  return (
    <MotifLayer className="fixed">
      {/* animate={false} — ambient backdrops render fully drawn and only float.
          The draw-on uses stroke-dashoffset, which repaints every frame and is
          not GPU-composited; it is reserved for focal moments (hero, empty
          states, confirmations). Float is a transform, so it stays cheap. */}
      <Motif
        animate={false}
        size={size}
        className={`${float} absolute ${pos} text-terracotta opacity-[0.18] hidden md:block`}
        style={{ '--fd': fd }}
      />
    </MotifLayer>
  )
}
