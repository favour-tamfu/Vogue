'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'
import {
  Plus, Briefcase, MessageSquare, Star, ChevronRight,
  Bell, ArrowRight, FileText, TrendingUp, Users,
  MapPin, Clock, Filter, CheckCircle, DollarSign
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
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function HirerView({
  profile, myJobs = [], recentBids = [], feedItems = [],
  pendingReviews = [], unreadMessages = 0,
  hirerStats = {}, topProviders = []
}) {
  const { jobsPosted = 0, totalBidsReceived = 0, hiresMade = 0, reviewsGiven = 0 } = hirerStats

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
            <Link href="/jobs/new"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: T.coral, borderRadius: 4 }}>
              <Plus size={14} strokeWidth={2.5} /> Post a Job
            </Link>
            {[
              { label: 'My Jobs',  href: '/jobs/mine', icon: Briefcase,     badge: jobsPosted || null },
              { label: 'Messages', href: '/messages',  icon: MessageSquare, badge: unreadMessages || null },
              { label: 'Reviews',  href: '/reviews',   icon: Star,          badge: null },
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
              <button key={f}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                style={{ borderRadius: 4, color: T.textMuted }}>
                <span>{f}</span>
                <ChevronRight size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
              </button>
            ))}
            <div className="pt-1.5 border-t" style={{ borderColor: T.border }}>
              <Link href="/providers"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white"
                style={{ background: T.navy, borderRadius: 4 }}>
                Browse Providers <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="col-span-1 lg:col-span-2 space-y-4">

        {/* Review prompts */}
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

        {/* Welcome header */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: T.navy }}>
                {profile?.full_name?.split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                {totalBidsReceived > 0
                  ? <>You have <span className="font-semibold" style={{ color: T.coral }}>{totalBidsReceived} bids</span> across your jobs</>
                  : 'Post a job to start receiving bids'
                }
              </p>
            </div>
            <Link href="/jobs/new"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90"
              style={{ background: T.coral, borderRadius: 6 }}>
              <Plus size={14} strokeWidth={2.5} /> Post a Job
            </Link>
          </div>

          {/* Real stats */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t" style={{ borderColor: T.border }}>
            {[
              { label: 'Jobs Posted',   value: jobsPosted        || 0, icon: FileText   },
              { label: 'Bids Received', value: totalBidsReceived || 0, icon: TrendingUp },
              { label: 'Hires Made',    value: hiresMade         || 0, icon: CheckCircle},
              { label: 'Reviews Given', value: reviewsGiven      || 0, icon: Star       },
            ].map(stat => (
              <div key={stat.label}
                className="flex flex-col items-center justify-center py-3 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <stat.icon size={14} strokeWidth={1.5} style={{ color: T.textLight }} className="mb-1.5" />
                <span className="text-xl font-semibold" style={{ color: T.navy }}>{stat.value}</span>
                <span className="text-xs mt-0.5 text-center leading-tight" style={{ color: T.textLight }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <Bell size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              <span className="text-sm font-semibold" style={{ color: T.navy }}>Platform Activity</span>
            </div>
            <Link href="/feed"
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70"
              style={{ color: T.coral }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {feedItems.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: T.textLight }}>
                No activity yet — check back soon
              </p>
            </div>
          ) : (
            feedItems.map((item, i) => (
              <div key={item.id}
                className="flex items-start gap-3 px-5 py-3.5 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}>
                <div
                  className="w-7 h-7 flex items-center justify-center flex-shrink-0 border font-semibold text-xs"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}>
                  {item.type === 'new_provider' ? item.data.full_name?.charAt(0) :
                   item.type === 'new_job'      ? item.data.hirer?.full_name?.charAt(0) :
                   item.data.reviewer?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: T.navyMid }}>
                    {item.type === 'new_provider' && (
                      <><span className="font-medium">{item.data.full_name}</span>
                      <span style={{ color: T.textMuted }}> joined as a verified provider</span></>
                    )}
                    {item.type === 'new_job' && (
                      <><span className="font-medium">{item.data.title}</span>
                      <span style={{ color: T.textMuted }}> — new job in {item.data.location}</span></>
                    )}
                    {item.type === 'review' && (
                      <><span className="font-medium">{item.data.reviewer?.full_name}</span>
                      <span style={{ color: T.textMuted }}> reviewed </span>
                      <span className="font-medium">{item.data.reviewee?.full_name}</span>
                      <span style={{ color: T.textMuted }}> · {'⭐'.repeat(item.data.rating)}</span></>
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                    <span className="text-xs" style={{ color: T.textLight }}>{timeAgo(item.date)}</span>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5"
                  style={{
                    borderRadius: 4,
                    background: item.type === 'new_provider' ? '#EFF6FF' :
                                item.type === 'new_job'      ? '#FFFBEB' : '#F0FDF4',
                    color: item.type === 'new_provider' ? '#3B82F6' :
                           item.type === 'new_job'      ? '#D97706' : '#16A34A',
                  }}>
                  {item.type === 'new_provider' ? 'Provider' :
                   item.type === 'new_job'      ? 'Job' : 'Review'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent bids */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
              <span className="text-sm font-semibold" style={{ color: T.navy }}>Recent Bids</span>
            </div>
            <Link href="/jobs/mine"
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70"
              style={{ color: T.coral }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentBids.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: T.textLight }}>
                No bids yet —{' '}
                <Link href="/jobs/new" style={{ color: T.coral }}>post a job</Link>
                {' '}to start receiving them
              </p>
            </div>
          ) : (
            recentBids.map(bid => (
              <div key={bid.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}>
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0 border text-xs font-bold"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}>
                  {bid.provider?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: T.navy }}>
                      {bid.provider?.full_name}
                    </span>
                    {bid.provider?.is_verified && (
                      <CheckCircle size={12} strokeWidth={1.5} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: T.textLight }}>
                      {bid.job?.title}
                    </span>
                    {bid.provider?.average_rating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs" style={{ color: T.textLight }}>
                        <Star size={10} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                        {Number(bid.provider.average_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: T.navy }}>
                    ${Number(bid.amount).toLocaleString()}
                  </span>
                  <Link href={`/jobs/${bid.job_id}`}
                    className="text-xs px-3 py-1.5 border font-medium transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">

        {/* Profile card */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-3 pb-4 border-b mb-4" style={{ borderColor: T.border }}>
            <div
              className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
              style={{ background: T.navy, borderRadius: 4 }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile?.full_name?.charAt(0) || '?'
              }
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
          <Link href="/profile/edit"
            className="w-full flex items-center justify-center text-xs font-medium py-1.5 border transition-colors hover:bg-slate-50"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
            Edit Profile
          </Link>
        </div>

        {/* Top providers */}
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
                    {p.completed_events > 0 && ` · ${p.completed_events} events`}
                  </div>
                </div>
                {p.average_rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star size={11} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold" style={{ color: T.navyMid }}>
                      {Number(p.average_rating).toFixed(1)}
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
          <div className="p-3">
            <Link href="/providers"
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-white"
              style={{ background: T.navy, borderRadius: 4 }}>
              Browse All Providers <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Find providers CTA */}
        <div className="border p-4" style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} strokeWidth={1.5} style={{ color: '#FFD3AC' }} />
            <span className="text-sm font-semibold text-white">Need Someone?</span>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: T.textLight }}>
            Post a job and receive bids from verified professionals within hours.
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