import { createClient } from '@/lib/supabase/server'
import PublicNav from './PublicNav'
import Navbar from './Navbar'
import Footer from './Footer'
import MotifLayer from '@/components/motifs/MotifLayer'
import MotifCycle from '@/components/motifs/MotifCycle'
import { SWEEP } from '@/components/motifs'

/**
 * Shell for long-form public pages (trust, support, legal).
 *
 * Auth-aware on purpose. These pages are reachable from inside the product —
 * Trust & Safety and Support sit in the signed-in account menu — so rendering
 * the logged-out nav here stranded people: no route back to the dashboard,
 * and a "Log in / Get Started" pair aimed at someone already logged in.
 */
export default async function ContentPage({ eyebrow, title, intro, updated, children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-cream">
      {profile ? <Navbar profile={profile} /> : <PublicNav />}

      <header className="relative overflow-hidden border-b border-line bg-cream-2 pt-24 pb-12">
        <MotifLayer>
          <MotifCycle
            motifs={SWEEP}
            size={130}
            cycle="84s"
            float="motif-float"
            floatDuration="22s"
            className="absolute -top-6 -right-8 text-terracotta opacity-[0.16] sm:hidden"
          />
          <MotifCycle
            motifs={SWEEP}
            size={280}
            cycle="94s"
            float="motif-float"
            floatDuration="22s"
            className="absolute -top-10 -right-10 text-terracotta opacity-30 hidden sm:inline-block"
          />
        </MotifLayer>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6" style={{ zIndex: 10 }}>
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

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24 md:pb-12">
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
