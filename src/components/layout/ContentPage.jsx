import PublicNav from './PublicNav'
import Footer from './Footer'
import MotifLayer from '@/components/motifs/MotifLayer'
import Nku from '@/components/motifs/Nku'

/**
 * Shell for long-form public pages (trust, support, legal).
 */
export default function ContentPage({ eyebrow, title, intro, updated, children }) {
  return (
    <div className="min-h-screen bg-cream">
      <PublicNav />

      <header className="relative overflow-hidden border-b border-line bg-cream-2 pt-24 pb-12">
        <MotifLayer>
          <Nku
            animate={false}
            size={280}
            className="motif-float absolute -top-10 -right-10 text-terracotta opacity-30"
            style={{ '--fd': '22s' }}
          />
        </MotifLayer>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6" style={{ zIndex: 1 }}>
          {eyebrow && <p className="t-micro text-terracotta mb-2">{eyebrow}</p>}
          <h1 className="t-hero text-ink">{title}</h1>
          {intro && (
            <p className="text-base leading-relaxed mt-4 max-w-2xl text-ink-2">{intro}</p>
          )}
          {updated && (
            <p className="text-xs mt-4 text-ink-3">Last updated {updated}</p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {children}
      </main>

      <Footer />
    </div>
  )
}

/** A titled prose section. */
export function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="t-h2 text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-2">{children}</div>
    </section>
  )
}

/** Marks copy that still needs Favour's / counsel's input before launch. */
export function NeedsReview({ children }) {
  return (
    <div className="border border-ochre-soft rounded-md p-4 bg-ochre-soft my-4">
      <p className="t-micro text-ochre-text mb-1">Draft — needs review before launch</p>
      <p className="text-sm leading-relaxed text-ink-2">{children}</p>
    </div>
  )
}
