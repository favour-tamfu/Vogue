import Link from 'next/link'
import { ShieldCheck, MapPin } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import MotifLayer from '@/components/motifs/MotifLayer'
import Mbubu from '@/components/motifs/Mbubu'
import MotifCycle from '@/components/motifs/MotifCycle'
import { SWEEP } from '@/components/motifs'
import { PRODUCT_NAME } from '@/lib/brand'

const COLUMNS = [
  {
    heading: 'For Hirers',
    links: [
      { label: 'Post a job',        href: '/jobs/new'   },
      { label: 'Browse providers',  href: '/providers'  },
      { label: 'How it works',      href: '/#how-it-works' },
      { label: 'What it costs',     href: '/#pricing'   },
    ],
  },
  {
    heading: 'For Providers',
    links: [
      { label: 'Find open jobs',    href: '/jobs'                },
      { label: 'Get verified',      href: '/verification/apply'  },
      { label: 'Build a portfolio', href: '/portfolio/upload'    },
      { label: 'Live feed',         href: '/feed'                },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Photography & video', href: '/providers' },
      { label: 'Catering',            href: '/providers' },
      { label: 'Décor & florals',     href: '/providers' },
      { label: 'Sound & lighting',    href: '/providers' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Trust & safety', href: '/trust'          },
      { label: 'Support',        href: '/support'        },
      { label: 'Privacy',        href: '/legal/privacy'  },
      { label: 'Terms',          href: '/legal/terms'    },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-ink-3">

      {/* Mbubu — the scarification band is the footer rule (§3.3.2) */}
      <div className="text-sand opacity-70">
        <Mbubu />
      </div>

      <MotifLayer>
        <MotifCycle
          motifs={SWEEP}
          size={140}
          cycle="82s"
          float="motif-float2"
          floatDuration="24s"
          className="absolute -bottom-8 -right-8 text-sand opacity-[0.13] sm:hidden"
        />
        <MotifCycle
          motifs={SWEEP}
          size={340}
          cycle="100s"
          float="motif-float2"
          floatDuration="24s"
          className="absolute -bottom-16 -right-16 text-sand opacity-25 hidden sm:inline-block"
        />
      </MotifLayer>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10" style={{ zIndex: 1 }}>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 mb-10">

          {/* Brand column */}
          <div className="col-span-2">
            <Logo size={26} tone="dark" />

            <p className="text-sm leading-relaxed mt-4 max-w-xs text-ink-3">
              The marketplace for event professionals — post a job, compare real bids,
              and hire someone whose identity has actually been checked.
            </p>

            <div className="flex items-center gap-2 mt-5">
              <ShieldCheck size={14} strokeWidth={1.5} className="text-sand flex-shrink-0" />
              <span className="text-xs font-semibold text-sand">
                Every provider is ID-verified before they can bid
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <MapPin size={14} strokeWidth={1.5} className="text-ink-3 flex-shrink-0" />
              <span className="text-xs text-ink-3">
                Built for Nigeria · Naira first
              </span>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h3 className="t-micro text-sand mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-3 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment honesty line — required wording (§5.2). Never imply that
            Avenue holds, protects or guarantees money. */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed max-w-2xl text-ink-3">
            <span className="font-semibold text-sand">How payment works.</span>{' '}
            Hirers pay providers directly by bank transfer. {PRODUCT_NAME} records
            payments but does not hold or transfer funds, and cannot reverse a
            transfer once it has been sent.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
            <p className="text-xs text-ink-3">
              © {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
