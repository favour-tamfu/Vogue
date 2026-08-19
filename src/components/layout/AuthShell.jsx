import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import MotifLayer from '@/components/motifs/MotifLayer'
import { PRODUCT_NAME } from '@/lib/brand'

/**
 * Split shell for login / signup.
 *
 * Left  — ink brand panel with the page's motif and its supporting points.
 *         Hidden below lg; on mobile the form stands alone with a compact logo.
 * Right — the form, on cream.
 */
export default function AuthShell({ motif, eyebrow, headline, points = [], children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">

      {/* ── Brand panel ── */}
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
      <main className="flex items-center justify-center px-4 py-12 bg-cream">
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" aria-label={`${PRODUCT_NAME} home`}>
              <Logo size={30} />
            </Link>
          </div>
          {children}
        </div>
      </main>

    </div>
  )
}
