'use client'

import Link from 'next/link'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'
import {
  Search, Send, MessageSquare, User, ChevronRight,
  MapPin, DollarSign, Users, Star, Clock, ArrowRight,
  AlertCircle, CheckCircle, XCircle, Upload,
  Award, Briefcase
} from 'lucide-react'
import { formatBudget } from '@/lib/currency'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function ProviderView({
  profile, recentJobs = [], pendingReviews = [],
  providerStats = {}, unreadMessages = 0, topProviders = []
}) {
  const isVerified         = profile?.is_verified
  const verificationStatus = profile?.verification_status || 'unsubmitted'
  const { bidsSent = 0, jobsWon = 0 } = providerStats

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">

      {/* ── LEFT SIDEBAR — desktop only ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line bg-cream">
            <span className="t-micro text-ink-3">
              Navigation
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5">
            {[
              { label: 'Find Jobs',  href: '/jobs',      icon: Search,        badge: null             },
              { label: 'My Bids',    href: '/bids/mine', icon: Send,          badge: bidsSent || null  },
              { label: 'Messages',   href: '/messages',  icon: MessageSquare, badge: unreadMessages || null },
              { label: 'My Profile', href: `/providers/${profile?.id}`, icon: User, badge: null },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xs
                           text-ink-2 transition-colors hover:bg-cream">
                <span className="flex items-center gap-2.5">
                  <item.icon size={14} strokeWidth={1.5} className="text-ink-3" />
                  {item.label}
                </span>
                {item.badge
                  ? <span className="text-xs font-semibold px-1.5 py-0.5 rounded-xs bg-ochre-soft text-ochre-text">
                      {item.badge}
                    </span>
                  : <ChevronRight size={12} strokeWidth={1.5} className="text-ink-3" />
                }
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile card */}
        <ProfileCard profile={profile} isVerified={isVerified} />

        {/* Portfolio upload shortcut */}
        <div className="bg-surface border border-line rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="t-micro text-ink-3">
              Portfolio
            </span>
            <Link href="/portfolio/upload"
              className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-deep">
              <Upload size={11} /> Add
            </Link>
          </div>
          <p className="text-xs text-ink-3">
            Upload event photos and videos to attract hirers.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="col-span-1 lg:col-span-2 space-y-4">

        {/* Review prompts */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            {pendingReviews.map(hire => (
              <ReviewPrompt key={hire.id} hire={hire} reviewerRole="provider"
                otherPartyName={hire.hirer?.full_name} jobTitle={hire.job?.title} />
            ))}
          </div>
        )}

        <VerificationBanner status={verificationStatus} />

        {/* Welcome + stats */}
        <div className="bg-surface border border-line rounded-md p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="t-h2 text-ink">
                Welcome back, {profile?.full_name?.split(' ')[0]}
              </h1>
              <p className="text-sm mt-0.5 text-ink-2">
                {isVerified ? 'Your profile is verified — start bidding.' : 'Complete verification to bid.'}
              </p>
            </div>
            <Link href="/jobs"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-2
                         rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
              <Search size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Find Jobs</span>
              <span className="sm:hidden">Jobs</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-line">
            {[
              { label: 'Bids Sent',  value: bidsSent || 0,  icon: Send  },
              { label: 'Jobs Won',   value: jobsWon  || 0,  icon: Award },
              { label: 'Avg Rating', value: profile?.average_rating ? Number(profile.average_rating).toFixed(1) : '—', icon: Star },
            ].map(stat => (
              <div key={stat.label}
                className="flex flex-col items-center py-3 border border-line rounded-xs bg-cream">
                <stat.icon size={13} strokeWidth={1.5} className="text-ink-3 mb-1" />
                <span className="text-xl t-money text-ink">{stat.value}</span>
                <span className="text-xs mt-0.5 text-ink-3">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE ONLY: Quick actions ── */}
        <div className="grid grid-cols-4 gap-2 lg:hidden">
          {[
            { label: 'My Bids',   href: '/bids/mine',           icon: Send,          badge: bidsSent      },
            { label: 'Messages',  href: '/messages',            icon: MessageSquare, badge: unreadMessages },
            { label: 'Portfolio', href: '/portfolio/upload',    icon: Upload,        badge: null           },
            { label: 'Profile',   href: `/providers/${profile?.id}`, icon: User,     badge: null           },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="relative flex flex-col items-center gap-1.5 p-2.5 bg-surface border border-line rounded-xs">
              {item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center
                                 text-white font-bold rounded-full bg-terracotta"
                  style={{ fontSize: 9 }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              <item.icon size={18} strokeWidth={1.5} className="text-ink" />
              <span className="font-medium text-center text-ink-2" style={{ fontSize: 10 }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ── MOBILE ONLY: Profile summary ── */}
        <div className="lg:hidden">
          <ProfileCard profile={profile} isVerified={isVerified} />
        </div>

        {/* Open jobs list */}
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2">
              <Briefcase size={13} strokeWidth={1.5} className="text-ink-3" />
              <span className="t-h3 text-ink">Open Jobs</span>
            </div>
            <Link href="/jobs"
              className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-deep">
              Browse all <ArrowRight size={11} />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-3">No open jobs right now</p>
            </div>
          ) : (
            recentJobs.map(job => (
              <div key={job.id}
                className="flex items-start gap-3 px-4 py-4 border-b border-line last:border-0 hover:bg-cream">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-ink">{job.title}</span>
                    {job.category && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
                        {job.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-ink-3">
                      <MapPin size={10} strokeWidth={1.5} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-3">
                      <DollarSign size={10} strokeWidth={1.5} />
                      {formatBudget(job.budget_min, job.budget_max, job.currency)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-3">
                      <Users size={10} strokeWidth={1.5} /> {job.bids_count} bids
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-3">
                      <Clock size={10} strokeWidth={1.5} /> {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>
                <Link href={`/jobs/${job.id}`}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-sm transition-colors ${
                    isVerified
                      ? 'bg-terracotta text-white hover:bg-terracotta-deep'
                      : 'bg-cream text-ink-3 border border-line'
                  }`}>
                  {isVerified ? 'Bid' : 'View'}
                </Link>
              </div>
            ))
          )}
        </div>

        {/* ── MOBILE ONLY: Top providers ── */}
        {topProviders.length > 0 && (
          <div className="lg:hidden bg-surface border border-line rounded-md overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line flex items-center justify-between bg-cream">
              <span className="t-micro text-ink-3">
                Fellow Providers
              </span>
              <Link href="/providers" className="text-xs text-terracotta hover:text-terracotta-deep">See all</Link>
            </div>
            {topProviders.map(p => (
              <ProviderRow key={p.id} provider={p} />
            ))}
          </div>
        )}

      </div>

      {/* ── RIGHT SIDEBAR — desktop only ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line bg-cream">
            <span className="t-micro text-ink-3">
              Find Providers
            </span>
          </div>
          <div className="p-2 space-y-1">
            {['Category', 'Location', 'Rating'].map(f => (
              <button key={f}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xs hover:bg-cream">
                <span className="text-ink-2">{f}</span>
                <ChevronRight size={12} strokeWidth={1.5} className="text-ink-3" />
              </button>
            ))}
            <div className="pt-1.5 border-t border-line">
              <Link href="/providers"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white
                           rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
                Browse All <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {topProviders.length > 0 && (
          <div className="bg-surface border border-line rounded-md overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line bg-cream">
              <span className="t-micro text-ink-3">
                Top Rated
              </span>
            </div>
            {topProviders.map(p => (
              <ProviderRow key={p.id} provider={p} />
            ))}
          </div>
        )}

        <div className="border border-ink rounded-md p-4 bg-ink">
          <span className="t-micro block mb-2 text-sand">
            Need a Service?
          </span>
          <p className="text-xs leading-relaxed mb-3 text-ink-3">
            Post a job as a hirer and receive bids from other professionals.
          </p>
          <Link href="/jobs/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white
                       rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
            Post a Job <ArrowRight size={13} />
          </Link>
        </div>
      </div>

    </div>
  )
}

function ProviderRow({ provider: p }) {
  return (
    <Link href={`/providers/${p.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-cream">
      <div className="w-7 h-7 flex items-center justify-center text-xs font-bold border border-line
                      rounded-xs text-ink bg-cream">
        {p.full_name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-ink">{p.full_name}</div>
        <div className="text-xs text-ink-3">
          {p.provider_categories?.[0]?.category?.name || 'Provider'}
        </div>
      </div>
      {p.average_rating > 0 && (
        <div className="flex items-center gap-0.5">
          <Star size={11} strokeWidth={1.5} className="fill-ochre text-ochre" />
          <span className="text-xs font-semibold t-money text-ink-2">
            {Number(p.average_rating).toFixed(1)}
          </span>
        </div>
      )}
    </Link>
  )
}

function ProfileCard({ profile, isVerified }) {
  return (
    <div className="bg-surface border border-line rounded-md p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-base
                        flex-shrink-0 overflow-hidden bg-ink rounded-xs">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            : profile?.full_name?.charAt(0) || '?'
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate text-ink">
              {profile?.full_name}
            </span>
            {isVerified && <CheckCircle size={12} className="text-verified flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} strokeWidth={1.5} className="text-ink-3" />
            <span className="text-xs truncate text-ink-3">{profile?.location}</span>
          </div>
          {profile?.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="fill-ochre text-ochre" />
              <span className="text-xs text-ink-3">
                {Number(profile.average_rating).toFixed(1)} rating
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pb-3 mb-3 border-b border-line">
        <div className="text-center">
          <div className="text-base t-money text-ink">{profile?.completed_events || 0}</div>
          <div className="text-xs text-ink-3">Events</div>
        </div>
        <div className="text-center">
          <div className="text-base t-money text-ink">{profile?.years_experience || '—'}</div>
          <div className="text-xs text-ink-3">Yrs Exp</div>
        </div>
        <div className="text-center">
          <div className="text-base t-money text-ink">
            {profile?.average_rating ? Number(profile.average_rating).toFixed(1) : '—'}
          </div>
          <div className="text-xs text-ink-3">Rating</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href="/profile/edit"
          className="flex-1 flex items-center justify-center text-xs font-medium py-1.5 border border-line
                     rounded-sm text-ink-2 transition-colors hover:bg-cream">
          Edit Profile
        </Link>
        <Link href="/portfolio/upload"
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 border border-line
                     rounded-sm text-ink-2 transition-colors hover:bg-cream">
          <Upload size={11} /> Portfolio
        </Link>
      </div>
    </div>
  )
}

function VerificationBanner({ status }) {
  const config = {
    unsubmitted: {
      className: 'bg-ochre-soft border-ochre-soft',
      icon: <AlertCircle size={14} strokeWidth={1.5} className="text-ochre-text flex-shrink-0" />,
      text: 'Submit your credentials to unlock bidding.',
      action: { label: 'Get Verified', href: '/verification/apply' }
    },
    pending: {
      className: 'bg-cream-2 border-line',
      icon: <Clock size={14} strokeWidth={1.5} className="text-ink-2 flex-shrink-0" />,
      text: 'Verification in progress — usually 1–2 business days.',
      action: null
    },
    approved: null,
    rejected: {
      className: 'bg-danger-bg border-danger-bg',
      icon: <XCircle size={14} strokeWidth={1.5} className="text-danger flex-shrink-0" />,
      text: 'Verification unsuccessful — review feedback and resubmit.',
      action: { label: 'Reapply', href: '/verification/apply' }
    },
  }

  const c = config[status]
  if (!c) return null

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border rounded-xs ${c.className}`}>
      {c.icon}
      <p className="flex-1 text-xs text-ink-2">{c.text}</p>
      {c.action && (
        <Link href={c.action.href}
          className="flex-shrink-0 text-xs font-semibold px-3 py-1 text-white rounded-sm
                     bg-terracotta transition-colors hover:bg-terracotta-deep">
          {c.action.label}
        </Link>
      )}
    </div>
  )
}
