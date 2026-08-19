import Link from 'next/link'
import {
  CheckCircle, Star, Briefcase, Users, Shield, ArrowRight,
  IdCard, Landmark, MessagesSquare, Receipt
} from 'lucide-react'
import PublicNav from '@/components/layout/PublicNav'
import Footer from '@/components/layout/Footer'
import MotifLayer from '@/components/motifs/MotifLayer'
import MotifCycle from '@/components/motifs/MotifCycle'
import { Omumu, Eke, Odu, Osisi, Akwukwo, Nnyo, Nku, Ugo, Ntupo } from '@/components/motifs'
import { PRODUCT_NAME, PRODUCT_DESCRIPTION } from '@/lib/brand'

const STEPS = [
  { step: '01', title: 'Post a Job',     desc: 'Describe your event, set a budget, and publish in under 5 minutes.' },
  { step: '02', title: 'Receive Bids',   desc: 'Verified providers submit competitive bids with their pitch and portfolio.' },
  { step: '03', title: 'Review & Hire',  desc: 'Compare bids side by side, check reviews, and hire with one click.' },
  { step: '04', title: 'Leave a Review', desc: 'After the event, both parties review each other — building lasting trust.' },
]

const FEATURES = [
  { icon: Shield,   title: 'Verified Professionals', desc: "Every provider is identity-verified before they can bid. You know exactly who you're hiring." },
  { icon: Briefcase,title: 'Post Any Event Job',      desc: 'Weddings, corporate events, concerts, birthdays — post once and receive competitive bids.' },
  { icon: Users,    title: 'Dual Reviews',            desc: 'Both hirers and providers leave reviews after every job. Accountability on both sides.' },
  { icon: Star,     title: 'Live Feed',               desc: 'Browse a live feed of portfolio work, new providers, and completed events.' },
]

const SERVICES = [
  'Photography', 'Videography', 'Catering', 'DJ & Music',
  'MC & Hosting', 'Décor & Florals', 'Hair & Makeup',
  'Sound & Lighting', 'Security', 'Event Planning',
]

// Statements about how the product works — not usage metrics. Nothing here
// claims a number we cannot stand behind.
const PROMISES = [
  { icon: IdCard,        title: 'ID-verified providers', desc: 'Checked before their first bid' },
  { icon: Receipt,       title: 'No commission',          desc: 'Free for both sides at launch' },
  { icon: Landmark,      title: 'Direct bank transfer',   desc: 'Paid in naira, no middleman' },
  { icon: MessagesSquare,title: 'Two-way reviews',        desc: 'Both parties are accountable' },
]

export default function LandingPage() {
  return (
    <div>
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20 px-4 bg-ink">
        <MotifLayer>
          {/* Phone — the hero is centred text on a narrow column, so ornament
              hugs the corners and stays well clear of the headline. */}
          <MotifCycle
            motifs={[Omumu, Osisi, Ugo]}
            size={190}
            cycle="63s"
            float="motif-float"
            floatDuration="19s"
            className="absolute -left-14 -bottom-8 text-sand opacity-30 sm:hidden"
          />
          <MotifCycle
            motifs={[Odu, Nku]}
            size={130}
            cycle="51s"
            float="motif-float2"
            floatDuration="24s"
            delay="1.2s"
            animateFirst={false}
            className="absolute -right-10 -top-4 text-sand opacity-20 sm:hidden"
          />

          {/* Tablet and up — Ọmụmụ and Eke anchor the two sides, each handing
              over to a different motif on a long cycle. */}
          <MotifCycle
            motifs={[Omumu, Akwukwo, Osisi]}
            size={250}
            cycle="66s"
            float="motif-float"
            floatDuration="19s"
            className="absolute -left-8 bottom-0 text-sand opacity-40 hidden sm:inline-block"
          />
          <MotifCycle
            motifs={[Eke, Nnyo, Ugo]}
            size={290}
            cycle="71s"
            float="motif-float2"
            floatDuration="25s"
            delay="1.2s"
            className="absolute -right-12 -bottom-8 text-sand opacity-35 hidden sm:inline-block"
          />
          <MotifCycle
            motifs={[Odu, Nku]}
            size={150}
            cycle="54s"
            float="motif-float"
            floatDuration="22s"
            delay="2.4s"
            animateFirst={false}
            className="absolute right-1/4 -top-10 text-sand opacity-20 hidden lg:inline-block"
          />
        </MotifLayer>

        <div className="relative max-w-4xl mx-auto text-center" style={{ zIndex: 1 }}>

          <div className="inline-flex items-center gap-2 t-micro px-3 py-1.5 mb-6 rounded-full
                          bg-white/10 text-sand">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            The Event Services Marketplace
          </div>

          <h1 className="t-hero text-white mb-6">
            Find and Hire Event
            <br />
            <span className="text-sand">Professionals</span>
            <br />
            You Can Trust
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-ink-3">
            {PRODUCT_DESCRIPTION}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/signup"
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 text-white rounded-sm bg-terracotta
                         transition-colors hover:bg-terracotta-deep w-full sm:w-auto justify-center">
              Post a Job Free <ArrowRight size={16} />
            </Link>
            <Link href="/signup"
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 border border-white/20 rounded-sm
                         text-white transition-colors hover:bg-white/5 w-full sm:w-auto justify-center">
              Join as a Provider
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['No upfront cost', 'Verified providers only', 'Dual review system'].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} strokeWidth={1.5} className="text-ochre" />
                <span className="text-xs font-medium text-ink-3">{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PROMISES ── */}
      <section className="py-12 border-b border-line bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {PROMISES.map(item => (
              <div key={item.title} className="text-center">
                <div className="w-9 h-9 mx-auto mb-3 flex items-center justify-center rounded-xs
                                bg-terracotta-soft text-terracotta">
                  <item.icon size={17} strokeWidth={1.5} />
                </div>
                <div className="t-h3 text-ink mb-0.5">{item.title}</div>
                <div className="text-xs text-ink-2">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative overflow-hidden py-20 px-4 bg-cream scroll-mt-14">
        <MotifLayer>
          <Odu
            animate={false}
            size={260}
            className="motif-float2 absolute -left-16 top-10 text-terracotta opacity-30"
            style={{ '--fd': '23s' }}
          />
        </MotifLayer>

        <div className="relative max-w-5xl mx-auto" style={{ zIndex: 1 }}>
          <div className="text-center mb-12">
            <p className="t-micro mb-2 text-terracotta">How It Works</p>
            <h2 className="t-h1 text-ink">From brief to hired in minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(item => (
              <div key={item.step} className="bg-surface border border-line rounded-md p-5">
                <div className="t-label mb-4 w-8 h-8 flex items-center justify-center text-white
                                rounded-xs bg-terracotta t-money">
                  {item.step}
                </div>
                <h3 className="t-h3 mb-2 text-ink">{item.title}</h3>
                <p className="text-xs leading-relaxed text-ink-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ntupo — section separator */}
      <div className="bg-cream text-terracotta opacity-70 py-2">
        <div className="max-w-2xl mx-auto px-4">
          <Ntupo />
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="relative overflow-hidden py-20 px-4 border-t border-line bg-surface">
        <MotifLayer>
          <Osisi
            animate={false}
            size={300}
            className="motif-float absolute -right-14 bottom-0 text-terracotta opacity-25"
            style={{ '--fd': '26s' }}
          />
        </MotifLayer>

        <div className="relative max-w-5xl mx-auto" style={{ zIndex: 1 }}>
          <div className="text-center mb-12">
            <p className="t-micro mb-2 text-terracotta">Why {PRODUCT_NAME}</p>
            <h2 className="t-h1 text-ink">Built for the events industry</h2>
            <p className="text-base mt-3 max-w-xl mx-auto text-ink-2">
              Unlike generic freelance platforms, every feature is designed specifically for how events work.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(feature => (
              <div key={feature.title} className="border border-line rounded-md p-6 flex items-start gap-4 bg-cream">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xs bg-terracotta-soft">
                  <feature.icon size={16} strokeWidth={1.5} className="text-terracotta" />
                </div>
                <div>
                  <h3 className="t-h3 mb-1 text-ink">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-ink-2">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="relative overflow-hidden py-20 px-4 bg-cream">
        <MotifLayer>
          <Akwukwo
            animate={false}
            size={220}
            className="motif-float2 absolute left-4 -bottom-10 text-terracotta opacity-30 hidden md:block"
            style={{ '--fd': '20s' }}
          />
          <Akwukwo
            animate={false}
            size={150}
            className="motif-float absolute right-8 top-4 text-terracotta opacity-20 hidden lg:block"
            style={{ '--fd': '24s', '--delay': '1.8s' }}
          />
        </MotifLayer>

        <div className="relative max-w-5xl mx-auto" style={{ zIndex: 1 }}>
          <div className="text-center mb-10">
            <p className="t-micro mb-2 text-terracotta">Services</p>
            <h2 className="t-h1 text-ink">Every event service in one place</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICES.map(service => (
              <Link key={service} href="/providers"
                className="px-4 py-2 border border-line rounded-xs text-sm font-medium text-ink-2 bg-surface
                           transition-colors hover:border-terracotta hover:text-terracotta">
                {service}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-4 border-t border-line bg-surface scroll-mt-14">
        <div className="max-w-3xl mx-auto text-center">
          <p className="t-micro mb-2 text-terracotta">What It Costs</p>
          <h2 className="t-h1 text-ink mb-4">Free while we build the market</h2>
          <p className="text-base leading-relaxed text-ink-2 mb-8">
            No commission, no subscription, no pay-per-lead. Posting a job is free,
            bidding is free, and {PRODUCT_NAME} takes nothing from what you agree.
            A marketplace with no supply is worth nothing to anyone — charging before
            there are jobs worth winning is how that happens.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-stretch gap-3 text-left">
            <div className="flex-1 border border-line rounded-md p-6 bg-cream min-w-56">
              <p className="t-micro text-ink-3 mb-2">Hirers</p>
              <p className="t-hero text-ink t-money leading-none mb-2">₦0</p>
              <p className="text-xs text-ink-2">Post unlimited jobs and hire without a fee.</p>
            </div>
            <div className="flex-1 border border-terracotta rounded-md p-6 bg-terracotta-soft min-w-56">
              <p className="t-micro text-terracotta mb-2">Providers</p>
              <p className="t-hero text-terracotta t-money leading-none mb-2">₦0</p>
              <p className="text-xs text-ink-2">Bid on every open job once you are verified.</p>
            </div>
          </div>

          <p className="text-xs text-ink-3 mt-6 max-w-lg mx-auto">
            {PRODUCT_NAME} records payments but does not hold or transfer funds.
            Hirers pay providers directly.
          </p>
        </div>
      </section>

      {/* ── DUAL CTA ── */}
      <section className="py-20 px-4 border-t border-line bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="relative overflow-hidden p-8 border border-ink rounded-md bg-ink">
              <MotifLayer>
                <Nnyo
                  animate={false}
                  size={200}
                  className="motif-float absolute -right-10 -bottom-10 text-sand opacity-25"
                  style={{ '--fd': '21s' }}
                />
              </MotifLayer>
              <div className="relative" style={{ zIndex: 1 }}>
                <p className="t-micro mb-3 text-sand">For Hirers</p>
                <h3 className="t-h2 text-white mb-2">Need someone for your event?</h3>
                <p className="text-sm mb-6 text-ink-3">
                  Post your job for free and receive bids from verified professionals within hours.
                </p>
                <Link href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 text-white
                             rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
                  Post a Job Free <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden p-8 border border-terracotta rounded-md bg-terracotta-soft">
              <MotifLayer>
                <Nnyo
                  size={200}
                  className="motif-float2 absolute -right-10 -bottom-10 text-terracotta opacity-25"
                  style={{ '--fd': '27s', '--delay': '1s' }}
                />
              </MotifLayer>
              <div className="relative" style={{ zIndex: 1 }}>
                <p className="t-micro mb-3 text-terracotta">For Providers</p>
                <h3 className="t-h2 mb-2 text-ink">Grow your events career</h3>
                <p className="text-sm mb-6 text-ink-2">
                  Build your verified profile, showcase your portfolio, and bid on jobs that match your skills.
                </p>
                <Link href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 text-white
                             rounded-sm bg-ink transition-opacity hover:opacity-90">
                  Join as a Provider <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
