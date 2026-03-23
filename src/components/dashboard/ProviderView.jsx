'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'
import {
  Search, Send, MessageSquare, User, ChevronRight,
  MapPin, DollarSign, Users, Star, Clock, ArrowRight,
  Shield, AlertCircle, CheckCircle, XCircle, Upload,
  Award, Briefcase
} from 'lucide-react'

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

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatBudget(min, max, currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: 'GH₵', XAF: 'FCFA' }
  const sym = symbols[currency] || '$'
  if (min) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  return `Up to ${sym}${Number(max).toLocaleString()}`
}

export default function ProviderView({
  profile, recentJobs = [], pendingReviews = [],
  providerStats = {}, unreadMessages = 0, topProviders = []
}) {
  const isVerified        = profile?.is_verified
  const verificationStatus = profile?.verification_status || 'unsubmitted'
  const { bidsSent = 0, jobsWon = 0 } = providerStats

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6">

      {/* ── LEFT SIDEBAR ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Navigation
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5">
            {[
              { label: 'Find Jobs',  href: '/jobs',      icon: Search,        badge: null           },
              { label: 'My Bids',    href: '/bids/mine', icon: Send,          badge: bidsSent || null },
              { label: 'Messages',   href: '/messages',  icon: MessageSquare, badge: unreadMessages || null },
              { label: 'My Profile', href: `/providers/${profile?.id}`, icon: User, badge: null },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 group"
                style={{ borderRadius: 4, color: T.navyMid }}>
                <span className="flex items-center gap-2.5">
                  <item.icon size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
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

        {/* Profile card */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 flex items-center justify-center text-white font-bold text-base flex-shrink-0 overflow-hidden"
              style={{ background: T.navy, borderRadius: 4 }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile?.full_name?.charAt(0) || '?'
              }
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm truncate" style={{ color: T.navy }}>
                  {profile?.full_name}
                </span>
                {isVerified && <CheckCircle size={12} className="text-blue-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                <span className="text-xs truncate" style={{ color: T.textLight }}>{profile?.location}</span>
              </div>
              {profile?.average_rating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs" style={{ color: T.textLight }}>
                    {Number(profile.average_rating).toFixed(1)} rating
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-t border-b" style={{ borderColor: T.border }}>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: T.navy }}>
                {profile?.completed_events || 0}
              </div>
              <div className="text-xs" style={{ color: T.textLight }}>Events</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: T.navy }}>
                {profile?.years_experience || '—'}
              </div>
              <div className="text-xs" style={{ color: T.textLight }}>Yrs Exp.</div>
            </div>
          </div>

          <Link href="/profile/edit"
            className="w-full flex items-center justify-center text-xs font-medium py-1.5 border transition-colors hover:bg-slate-50"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
            Edit Profile
          </Link>
        </div>

        {/* Portfolio */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Portfolio
            </span>
            <Link href="/portfolio/upload"
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70"
              style={{ color: T.coral }}>
              <Upload size={11} /> Add
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map(i => (
              <Link key={i} href="/portfolio/upload"
                className="aspect-square flex items-center justify-center border-2 border-dashed transition-colors hover:bg-slate-50"
                style={{ borderColor: T.border, borderRadius: 4 }}>
                <Upload size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              </Link>
            ))}
          </div>
          <p className="text-xs text-center mt-2" style={{ color: T.textLight }}>Upload event photos</p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="col-span-1 lg:col-span-2 space-y-4 lg:space-y-5">

        {/* Review prompts */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            {pendingReviews.map(hire => (
              <ReviewPrompt
                key={hire.id}
                hire={hire}
                reviewerRole="provider"
                otherPartyName={hire.hirer?.full_name}
                jobTitle={hire.job?.title}
              />
            ))}
          </div>
        )}

        <VerificationBanner status={verificationStatus} />

        {/* Welcome header */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: T.navy }}>
                Welcome back, {profile?.full_name?.split(' ')[0]}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                {isVerified
                  ? 'Your profile is verified — you can bid on any open job.'
                  : 'Complete your verification to start bidding on jobs.'}
              </p>
            </div>
            <Link href="/jobs"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90"
              style={{ background: T.coral, borderRadius: 6 }}>
              <Search size={14} strokeWidth={2} /> Find Jobs
            </Link>
          </div>

          {/* Real stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: T.border }}>
            {[
              { label: 'Bids Sent',       value: bidsSent || 0,                                        icon: Send  },
              { label: 'Jobs Won',         value: jobsWon || 0,                                         icon: Award },
              { label: 'Avg. Rating',      value: profile?.average_rating ? Number(profile.average_rating).toFixed(1) : '—', icon: Star },
            ].map(stat => (
              <div key={stat.label}
                className="flex flex-col items-center py-3 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <stat.icon size={13} strokeWidth={1.5} style={{ color: T.textLight }} className="mb-1.5" />
                <span className="text-xl font-semibold" style={{ color: T.navy }}>{stat.value}</span>
                <span className="text-xs mt-0.5" style={{ color: T.textLight }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Jobs */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <Briefcase size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              <span className="text-sm font-semibold" style={{ color: T.navy }}>Open Jobs</span>
            </div>
            <Link href="/jobs"
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70"
              style={{ color: T.coral }}>
              Browse all <ArrowRight size={11} />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: T.textLight }}>No open jobs right now</p>
              <p className="text-xs mt-1" style={{ color: T.textLight }}>Check back soon</p>
            </div>
          ) : (
            recentJobs.map((job, i) => (
              <div key={job.id}
                className="flex items-start gap-4 px-5 py-4 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium" style={{ color: T.navy }}>{job.title}</span>
                    {job.category && (
                      <span className="text-xs font-medium px-1.5 py-0.5"
                        style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                        {job.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                      <MapPin size={10} strokeWidth={1.5} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                      <DollarSign size={10} strokeWidth={1.5} />
                      {formatBudget(job.budget_min, job.budget_max, job.currency)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                      <Users size={10} strokeWidth={1.5} /> {job.bids_count} bids
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                      <Clock size={10} strokeWidth={1.5} /> {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 transition-opacity"
                  style={isVerified
                    ? { background: T.coral, color: '#fff', borderRadius: 4 }
                    : { background: T.bg, color: T.textLight, border: `1px solid ${T.border}`, borderRadius: 4 }
                  }
                >
                  {isVerified ? 'Place Bid' : 'Locked'}
                </Link>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">

        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Find Providers
            </span>
            <Search size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
          </div>
          <div className="p-2 space-y-1">
            {['Category', 'Location', 'Rating'].map(f => (
              <button key={f}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                style={{ borderRadius: 4 }}>
                <span style={{ color: T.textMuted }}>{f}</span>
                <ChevronRight size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
              </button>
            ))}
            <div className="pt-1.5 border-t" style={{ borderColor: T.border }}>
              <Link href="/providers"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: T.coral, borderRadius: 4 }}>
                Advanced Search <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Top Rated
            </span>
          </div>
          {topProviders.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: T.textLight }}>No providers yet</p>
            </div>
          ) : (
            topProviders.map(p => (
              <Link key={p.id} href={`/providers/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}>
                <div
                  className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold border"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}>
                  {p.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: T.navy }}>{p.full_name}</div>
                  <div className="text-xs" style={{ color: T.textLight }}>
                    {p.provider_categories?.[0]?.category?.name || 'Provider'}
                  </div>
                </div>
                {p.average_rating > 0 && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Star size={11} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold" style={{ color: T.navyMid }}>
                      {Number(p.average_rating).toFixed(1)}
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Need a service CTA */}
        <div className="border p-4" style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
          <span className="text-xs font-semibold tracking-widest uppercase block mb-2"
            style={{ color: '#FFD3AC' }}>
            Need a Service?
          </span>
          <p className="text-xs leading-relaxed mb-3" style={{ color: T.textLight }}>
            As a provider, you can also hire other professionals for your own events.
          </p>
          <Link href="/jobs/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: T.coral, borderRadius: 4 }}>
            Post a Job <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  )
}

function VerificationBanner({ status }) {
  const config = {
    unsubmitted: {
      bg: '#FFFBEB', border: '#FDE68A',
      icon: <AlertCircle size={14} strokeWidth={1.5} className="text-amber-500 flex-shrink-0" />,
      text: 'Your account is pending verification — submit your credentials to unlock bidding.',
      action: { label: 'Start Verification', href: '/verification/apply' }
    },
    pending: {
      bg: '#EFF6FF', border: '#BFDBFE',
      icon: <Clock size={14} strokeWidth={1.5} className="text-blue-500 flex-shrink-0" />,
      text: 'Verification in progress — your submission is under review. Typically 1–2 business days.',
      action: null
    },
    approved: null,
    rejected: {
      bg: '#FFF5F5', border: '#FECACA',
      icon: <XCircle size={14} strokeWidth={1.5} className="text-red-500 flex-shrink-0" />,
      text: 'Verification unsuccessful — please review the feedback and resubmit.',
      action: { label: 'Reapply', href: '/verification/apply' }
    },
  }

  const c = config[status]
  if (!c) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border"
      style={{ background: c.bg, borderColor: c.border, borderRadius: 4 }}>
      {c.icon}
      <p className="flex-1 text-xs" style={{ color: T.navyMid }}>{c.text}</p>
      {c.action && (
        <Link href={c.action.href}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1 text-white transition-opacity hover:opacity-90"
          style={{ background: '#E8523A', borderRadius: 4 }}>
          <Shield size={11} />
          {c.action.label}
        </Link>
      )}
    </div>
  )
}