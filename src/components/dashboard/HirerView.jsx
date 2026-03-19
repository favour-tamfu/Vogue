'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, Briefcase, MessageSquare, Star, ChevronRight,
  Bell, ArrowRight, FileText, TrendingUp, Users,
  MapPin, Clock, Filter, CheckCircle
} from 'lucide-react'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'

const MOCK_FEED = [
  { id: 1, name: 'Sarah K.',  detail: 'Joined as a verified Wedding Photographer', time: '2 min ago',  type: 'provider' },
  { id: 2, name: 'New Job',   detail: 'Corporate Event — New York · $5,000 budget', time: '15 min ago', type: 'job'      },
  { id: 3, name: 'Alex G.',   detail: 'Completed a Birthday Party · Rated 5.0',     time: '1 hour ago', type: 'review'   },
]

const MOCK_BIDS = [
  { id: 1, name: 'Pro Photo Co.',    initials: 'PP', amount: 1200, category: 'Photography', rating: 4.9, jobs: 34 },
  { id: 2, name: 'DJ Mike Beats',    initials: 'DM', amount: 800,  category: 'DJ & Music',  rating: 4.7, jobs: 21 },
  { id: 3, name: "Emily's Catering", initials: 'EC', amount: 1500, category: 'Catering',    rating: 4.8, jobs: 57 },
]

const STATS = [
  { label: 'Jobs Posted',   value: '0', icon: FileText   },
  { label: 'Bids Received', value: '0', icon: TrendingUp },
  { label: 'Hires Made',    value: '0', icon: CheckCircle},
  { label: 'Reviews Given', value: '0', icon: Star       },
]

// Design tokens
const T = {
  navy:       '#0F172A',
  navyMid:    '#1E293B',
  coral:      '#E8523A',
  coralLight: '#FEF0ED',
  border:     '#E2E8F0',
  bg:         '#F8FAFC',
  textMuted:  '#64748B',
  textLight:  '#94A3B8',
}

export default function HirerView({ profile, myJobs, pendingReviews = [] }) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-4 gap-5"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >

      {/* ── LEFT SIDEBAR ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-3">

        {/* Nav panel */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Navigation
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5">
            <Link
              href="/jobs/new"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: T.coral, borderRadius: 4 }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Post a Job
            </Link>
            {[
              { label: 'My Jobs',  href: '/jobs/mine', icon: Briefcase,     badge: 2 },
              { label: 'Messages', href: '/messages',  icon: MessageSquare, badge: 3 },
              { label: 'Reviews',  href: '/reviews',   icon: Star,          badge: null },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 group"
                style={{ borderRadius: 4, color: T.navyMid }}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon size={14} strokeWidth={1.5} style={{ color: T.textLight }}
                    className="group-hover:text-slate-600 transition-colors" />
                  {item.label}
                </span>
                {item.badge
                  ? <span className="text-xs font-semibold px-1.5 py-0.5"
                      style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                      {item.badge}
                    </span>
                  : <ChevronRight size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
                }
              </Link>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Filter Providers
            </span>
            <Filter size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
          </div>
          <div className="p-2 space-y-1">
            {['Event Type', 'Location', 'Date', 'Budget'].map(f => (
              <button
                key={f}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                style={{ borderRadius: 4, color: T.navyMid }}
              >
                <span style={{ color: T.textMuted }}>{f}</span>
                <ChevronRight size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
              </button>
            ))}
            <div className="pt-1.5 border-t" style={{ borderColor: T.border }}>
              <Link
                href="/providers"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: T.navy, borderRadius: 4 }}
              >
                Browse Providers <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── MAIN CONTENT ── */}
      
      <div className="col-span-1 lg:col-span-2 space-y-4">

        {/* ── Review Prompts ── */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            {pendingReviews.map(hire => (
              <ReviewPrompt
                key={hire.id}
                hire={hire}
                reviewerRole="hirer"
                otherPartyName={hire.provider?.full_name}
                jobTitle={hire.job?.title}
              />
            ))}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: T.navy }}>
                {profile?.full_name?.split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                You have{' '}
                <span className="font-semibold" style={{ color: T.coral }}>3 new bids</span>
                {' '}awaiting review
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90"
              style={{ background: T.coral, borderRadius: 6 }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Post a Job
            </Link>
          </div>

          {/* Stats wells */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t" style={{ borderColor: T.border }}>
            {STATS.map(stat => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center py-3 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
              >
                <stat.icon size={14} strokeWidth={1.5} style={{ color: T.textLight }} className="mb-1.5" />
                <span className="text-xl font-semibold" style={{ color: T.navy }}>{stat.value}</span>
                <span className="text-xs mt-0.5 text-center leading-tight" style={{ color: T.textLight }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <Bell size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              <span className="text-sm font-semibold" style={{ color: T.navy }}>Platform Activity</span>
            </div>
            <Link href="/feed"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: T.coral }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div>
            {MOCK_FEED.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 px-5 py-3.5 border-b last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderColor: T.border }}
              >
                <div
                  className="w-7 h-7 flex items-center justify-center flex-shrink-0 border font-semibold text-xs"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}
                >
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: T.navyMid }}>
                    <span className="font-medium">{item.name}</span>
                    <span style={{ color: T.textMuted }}> — {item.detail}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                    <span className="text-xs" style={{ color: T.textLight }}>{item.time}</span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs font-medium px-2 py-0.5"
                  style={{
                    borderRadius: 4,
                    background: item.type === 'provider' ? '#EFF6FF'
                              : item.type === 'job'      ? '#FFFBEB'
                              : '#F0FDF4',
                    color:      item.type === 'provider' ? '#3B82F6'
                              : item.type === 'job'      ? '#D97706'
                              : '#16A34A',
                  }}
                >
                  {item.type === 'provider' ? 'Provider'
                 : item.type === 'job'      ? 'Job'
                 : 'Review'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bids received */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              <span className="text-sm font-semibold" style={{ color: T.navy }}>Bids Received</span>
            </div>
            <Link href="/jobs/mine"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: T.coral }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div>
            {MOCK_BIDS.map((bid, i) => (
              <div
                key={bid.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0 border text-xs font-bold"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}
                >
                  {bid.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: T.navy }}>{bid.name}</span>
                    <span className="text-xs px-1.5 py-0.5"
                      style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                      {bid.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                      <Star size={10} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                      {bid.rating}
                    </span>
                    <span className="text-xs" style={{ color: T.textLight }}>{bid.jobs} jobs completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: T.navy }}>
                    ${bid.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      className="text-xs px-3 py-1.5 border font-medium transition-colors hover:bg-slate-50"
                      style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                    >
                      Profile
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 text-white font-semibold transition-opacity hover:opacity-90"
                      style={{ background: T.coral, borderRadius: 4 }}
                    >
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-3">

        {/* Profile card */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-3 pb-4 border-b mb-4" style={{ borderColor: T.border }}>
            <div
              className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: T.navy, borderRadius: 4 }}
            >
              {profile?.full_name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: T.navy }}>
                {profile?.full_name}
              </div>
              <div className="text-xs capitalize" style={{ color: T.textMuted }}>
                {profile?.org_type || 'Hirer'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                <span className="text-xs truncate" style={{ color: T.textLight }}>
                  {profile?.location}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="w-full flex items-center justify-center text-xs font-medium py-1.5 border transition-colors hover:bg-slate-50"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
          >
            Edit Profile
          </Link>
        </div>

        {/* Find providers */}
        <div
          className="border p-4"
          style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={13} strokeWidth={1.5} style={{ color: '#FFD3AC' }} />
            <span className="text-sm font-semibold text-white">Find Providers</span>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: T.textLight }}>
            Browse verified professionals by category, location, and rating.
          </p>
          <Link
            href="/providers"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: T.coral, borderRadius: 4, color: '#fff' }}
          >
            Browse Providers <ArrowRight size={13} />
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: T.textLight }}>
            Quick Tips
          </p>
          <ul className="space-y-3">
            {[
              'Write a detailed job brief to attract more qualified bids',
              'Review portfolio work before making a hire decision',
              'Define your budget range clearly upfront',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: T.bg, borderRadius: 4, color: T.textMuted, border: `1px solid ${T.border}` }}
                >
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}