import Link from 'next/link'
import { CheckCircle, Star, Briefcase, Users, Shield, ArrowRight } from 'lucide-react'

const T = {
  navy:       '#0F172A',
  coral:      '#E8523A',
  coralLight: '#FEF0ED',
  border:     '#E2E8F0',
  bg:         '#F8FAFC',
  textMuted:  '#64748B',
  textLight:  '#94A3B8',
}

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

const STATS = [
  { value: '500+',  label: 'Verified Providers' },
  { value: '1,200+',label: 'Jobs Posted'        },
  { value: '4.8',   label: 'Avg. Rating'        },
  { value: '98%',   label: 'Satisfaction Rate'  },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white"
        style={{ borderColor: T.border }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center text-white font-bold text-xs"
                style={{ background: T.coral, borderRadius: 4 }}>
                V
              </div>
              <span className="font-bold text-sm tracking-widest" style={{ color: T.navy }}>
                VOGUE
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/jobs" className="text-sm font-medium hover:opacity-70"
                style={{ color: T.textMuted }}>
                Browse Jobs
              </Link>
              <Link href="/providers" className="text-sm font-medium hover:opacity-70"
                style={{ color: T.textMuted }}>
                Find Providers
              </Link>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-sm font-medium px-4 py-1.5 border transition-colors hover:bg-slate-50"
                style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
                Log in
              </Link>
              <Link href="/signup"
                className="text-sm font-semibold px-4 py-1.5 text-white transition-opacity hover:opacity-90"
                style={{ background: T.coral, borderRadius: 4 }}>
                Get Started
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4" style={{ background: T.navy }}>
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 mb-6"
            style={{ background: 'rgba(253,94,83,0.15)', color: T.coral, borderRadius: 20 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            The Event Services Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Find and Hire Event
            <br />
            <span style={{ color: T.coral }}>Professionals</span>
            <br />
            You Can Trust
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#94A3B8' }}>
            Post a job, receive bids from verified professionals, and hire
            with confidence — all in one dedicated events marketplace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/signup"
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 text-white transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
              style={{ background: T.coral, borderRadius: 4 }}>
              Post a Job Free <ArrowRight size={16} />
            </Link>
            <Link href="/signup"
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 border transition-colors hover:bg-white/5 w-full sm:w-auto justify-center"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 4 }}>
              Join as a Provider
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} strokeWidth={1.5} style={{ color: T.coral }} />
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>No upfront cost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} strokeWidth={1.5} style={{ color: T.coral }} />
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Verified providers only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} strokeWidth={1.5} style={{ color: T.coral }} />
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Dual review system</span>
            </div>
          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-b" style={{ borderColor: T.border, background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: T.navy }}>{stat.value}</div>
                <div className="text-sm" style={{ color: T.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4" style={{ background: T.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: T.coral }}>
              How It Works
            </p>
            <h2 className="text-3xl font-bold" style={{ color: T.navy }}>
              From brief to hired in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(item => (
              <div key={item.step} className="bg-white border p-5"
                style={{ borderColor: T.border, borderRadius: 4 }}>
                <div className="text-xs font-bold mb-4 w-8 h-8 flex items-center justify-center text-white"
                  style={{ background: T.coral, borderRadius: 4 }}>
                  {item.step}
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: T.navy }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 border-t" style={{ borderColor: T.border, background: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: T.coral }}>
              Why Vogue
            </p>
            <h2 className="text-3xl font-bold" style={{ color: T.navy }}>
              Built for the events industry
            </h2>
            <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: T.textMuted }}>
              Unlike generic freelance platforms, every feature is designed specifically for how events work.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(feature => (
              <div key={feature.title} className="border p-6 flex items-start gap-4"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{ background: T.coralLight, borderRadius: 4 }}>
                  <feature.icon size={16} strokeWidth={1.5} style={{ color: T.coral }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: T.navy }}>{feature.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-4" style={{ background: T.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: T.coral }}>
              Services
            </p>
            <h2 className="text-3xl font-bold" style={{ color: T.navy }}>
              Every event service in one place
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICES.map(service => (
              <Link key={service} href="/jobs"
                className="px-4 py-2 border text-sm font-medium transition-all hover:border-slate-300 hover:bg-white"
                style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
                {service}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="py-20 px-4 border-t" style={{ borderColor: T.border, background: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="p-8 border" style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: '#FFD3AC' }}>
                For Hirers
              </p>
              <h3 className="text-xl font-bold text-white mb-2">Need someone for your event?</h3>
              <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                Post your job for free and receive bids from verified professionals within hours.
              </p>
              <Link href="/signup"
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 text-white transition-opacity hover:opacity-90"
                style={{ background: T.coral, borderRadius: 4 }}>
                Post a Job Free <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-8 border" style={{ background: T.coralLight, borderColor: T.coral, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: T.coral }}>
                For Providers
              </p>
              <h3 className="text-xl font-bold mb-2" style={{ color: T.navy }}>
                Grow your events career
              </h3>
              <p className="text-sm mb-6" style={{ color: T.textMuted }}>
                Build your verified profile, showcase your portfolio, and bid on jobs that match your skills.
              </p>
              <Link href="/signup"
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 text-white transition-opacity hover:opacity-90"
                style={{ background: T.navy, borderRadius: 4 }}>
                Join as a Provider <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: T.border, background: T.navy }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-xs"
                style={{ background: T.coral, borderRadius: 3 }}>
                V
              </div>
              <span className="font-bold text-sm tracking-widest text-white">VOGUE</span>
            </div>
            <p className="text-xs" style={{ color: '#475569' }}>
              © {new Date().getFullYear()} Vogue Events. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs hover:opacity-70" style={{ color: '#475569' }}>Privacy</a>
              <a href="#" className="text-xs hover:opacity-70" style={{ color: '#475569' }}>Terms</a>
              <a href="#" className="text-xs hover:opacity-70" style={{ color: '#475569' }}>Support</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}