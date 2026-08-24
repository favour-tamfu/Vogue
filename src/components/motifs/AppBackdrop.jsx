import MotifLayer from './MotifLayer'
import MotifCycle from './MotifCycle'
import {
  Omumu, Eke, Akwukwo, Nku, Odu, Nnyo, Ugo, Osisi, Anyanwu,
} from './index'

/**
 * Fixed motif backdrop for signed-in app pages.
 *
 * Each section owns a different trio, and the trio rotates on a long cycle,
 * so a page you return to tomorrow is quietly not the same page — without
 * anything ever moving while you are trying to read a bid amount.
 *
 * Mobile is not a scaled-down desktop here. Phones get their own placement
 * (one motif, anchored bottom-right below the thumb zone, larger and fainter)
 * because the desktop positions sit exactly where the content column lives on
 * a narrow screen.
 */
const SECTIONS = {
  dashboard:    { trio: [Osisi, Omumu, Ugo],      pos: 'top-24 -right-20',    mobilePos: '-bottom-16 -right-20', float: 'motif-float',  fd: '25s', cycle: '68s' },
  jobs:         { trio: [Odu, Nku, Eke],          pos: 'top-32 -left-24',     mobilePos: '-bottom-20 -left-20',  float: 'motif-float2', fd: '22s', cycle: '61s' },
  myJobs:       { trio: [Nku, Osisi, Odu],        pos: 'bottom-10 -right-24', mobilePos: '-bottom-16 -right-24', float: 'motif-float',  fd: '24s', cycle: '58s' },
  providers:    { trio: [Ugo, Nnyo, Akwukwo],     pos: 'top-28 -right-16',    mobilePos: '-bottom-20 -right-16', float: 'motif-float2', fd: '21s', cycle: '64s' },
  feed:         { trio: [Eke, Omumu, Nnyo],       pos: 'top-40 -left-20',     mobilePos: '-bottom-24 -left-16',  float: 'motif-float',  fd: '27s', cycle: '70s' },
  messages:     { trio: [Nnyo, Akwukwo, Nku],     pos: 'bottom-16 -left-24',  mobilePos: '-bottom-20 -left-20',  float: 'motif-float2', fd: '23s', cycle: '55s' },
  bids:         { trio: [Omumu, Ugo, Osisi],      pos: 'bottom-0 -right-16',  mobilePos: '-bottom-16 -right-16', float: 'motif-float',  fd: '20s', cycle: '62s' },
  portfolio:    { trio: [Akwukwo, Nnyo, Eke],     pos: 'top-32 -right-16',    mobilePos: '-bottom-20 -right-16', float: 'motif-float2', fd: '26s', cycle: '59s' },
  verification: { trio: [Anyanwu, Nku, Osisi],    pos: 'top-28 -left-20',     mobilePos: '-bottom-20 -left-16',  float: 'motif-float',  fd: '22s', cycle: '66s' },
  profile:      { trio: [Nnyo, Anyanwu, Akwukwo], pos: 'top-32 -right-20',    mobilePos: '-bottom-20 -right-20', float: 'motif-float2', fd: '24s', cycle: '57s' },
}

export default function AppBackdrop({ section = 'dashboard' }) {
  const cfg = SECTIONS[section]
  if (!cfg) return null

  const { trio, pos, mobilePos, float, fd, cycle } = cfg

  return (
    <MotifLayer position="fixed">
      {/* Phone — one anchor, low and out of the reading column */}
      <MotifCycle
        motifs={trio}
        size={150}
        cycle={cycle}
        float={float}
        floatDuration={fd}
        className={`absolute ${mobilePos} text-terracotta opacity-[0.10] md:hidden`}
      />

      {/* Tablet and up — the original placement */}
      <MotifCycle
        motifs={trio}
        size={340}
        cycle={cycle}
        float={float}
        floatDuration={fd}
        className={`absolute ${pos} text-terracotta opacity-[0.16] hidden md:inline-block`}
      />
    </MotifLayer>
  )
}
