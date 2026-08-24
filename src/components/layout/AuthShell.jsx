import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import MotifLayer from '@/components/motifs/MotifLayer'
import MotifCycle from '@/components/motifs/MotifCycle'
import { SWEEP } from '@/components/motifs'
import { PRODUCT_NAME } from '@/lib/brand'

/**
 * Split shell for login / signup.
 *
 * Desktop — ink brand panel on the left carrying the page's motif and its
 *           supporting points, form on cream at right.
 *
 * Phone   — the brand panel would push the form below the fold, so instead
 *           it collapses into a short ink band (logo, headline, motif) with
 *           the form directly beneath and the supporting points after it.
 *           The points still appear, just where they reinforce rather than
 *           delay: read after the form, not before it.
 */
export default function AuthShell({ motif, eyebrow, headline, points = [], children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">

      {/* ── Brand panel — desktop ── */}
      <aside className="relative overflow-hidden hidden lg:flex flex-col justify-between p-12 bg-ink">
        <MotifLayer>{motif}</MotifLayer>

        <div className="relative" style={{ zIndex: 1 }}>
          <Link href="/" aria-label={`${PRODUCT_NAME} home`}>
            <Logo size={30} tone="dark" />
          </Link>
        </div>

        <div className="relative max-w-md" style={{ zIndex: 1 }}>
          {eyebrow && <p className="t-micro text-sand mb-3">{eyebrow}</p>}
          <h2 className="t-hero text-white mb-6">{headline}</h2>

          <ul className="space-y-3">
            {points.map(point => (
              <li key={point.title} className="flex items-start gap-3">
                <span className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-xs
                                 bg-white/10 text-sand">
                  <point.icon size={14} strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{point.title}</span>
                  <span className="block text-xs leading-relaxed text-ink-3">{point.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-3" style={{ zIndex: 1 }}>
          {PRODUCT_NAME} records payments but does not hold or transfer funds.
        </p>
      </aside>

      {/* ── Form panel ── */}
      <main className="flex flex-col bg-cream">

        {/* Phone-only brand band */}
        <div className="relative overflow-hidden lg:hidden bg-ink px-5 pt-8 pb-7">
          <MotifLayer>
            <MotifCycle
              motifs={SWEEP}
              size={120}
              cycle="78s"
              float="motif-float2"
              floatDuration="23s"
              className="absolute -right-8 -bottom-8 text-sand opacity-[0.16]"
            />
          </MotifLayer>

          <div className="relative" style={{ zIndex: 1 }}>
            <Link href="/" aria-label={`${PRODUCT_NAME} home`} className="inline-block mb-4">
              <Logo size={26} tone="dark" />
            </Link>
            {eyebrow && <p className="t-micro text-sand mb-1.5">{eyebrow}</p>}
            <h2 className="t-h1 text-white">{headline}</h2>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {children}

            {/* Phone-only supporting points, after the form */}
            {points.length > 0 && (
              <ul className="lg:hidden mt-8 space-y-3">
                {points.map(point => (
                  <li key={point.title} className="flex items-start gap-3">
                    <span className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-xs
                                     bg-terracotta-soft text-terracotta">
                      <point.icon size={14} strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{point.title}</span>
                      <span className="block text-xs leading-relaxed text-ink-2">{point.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="lg:hidden text-xs leading-relaxed text-ink-3 mt-6">
              {PRODUCT_NAME} records payments but does not hold or transfer funds.
            </p>
          </div>
        </div>
      </main>

    </div>
  )
}
