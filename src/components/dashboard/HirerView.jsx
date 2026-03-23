'use client'

import Link from 'next/link'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'
import {
  Plus, Briefcase, MessageSquare, Star, ChevronRight,
  Bell, ArrowRight, FileText, TrendingUp, Users,
  MapPin, Clock, CheckCircle, DollarSign, Search
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">

      {/* ── LEFT SIDEBAR — desktop only ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border, background: T.bg }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
              Navigation
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5">
            <Link href="/jobs/new"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white"
              style={{ background: T.coral, borderRadius: 4 }}>
              <Plus size={14} strokeWidth={2.5} /> Post a Job
            </Link>
            {[
              { label: 'My Jobs',  href: '/jobs/mine', icon: Briefcase,     badge: jobsPosted || null },
              { label: 'Messages', href: '/messages',  icon: MessageSquare, badge: unreadMessages || null },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50"
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

        {/* Top providers — desktop sidebar */}
        <TopProviders providers={topProviders} />

        <div className="border p-4" style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} strokeWidth={1.5} style={{ color: '#FFD3AC' }} />
            <span className="text-sm font-semibold text-white">Need Someone?</span>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: T.textLight }}>
            Post a job and receive bids from verified professionals within hours.
          </p>
          <Link href="/jobs/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white"
            style={{ background: T.coral, borderRadius: 4 }}>
            Post a Job <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="col-span-1 lg:col-span-2 space-y-4">

        {/* Review prompts */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            {pendingReviews.map(hire => (
              <ReviewPrompt key={hire.id} hire={hire} reviewerRole="hirer"
                otherPartyName={hire.provider?.full_name} jobTitle={hire.job?.title} />
            ))}
          </div>
        )}

        {/* Welcome + stats */}
        <div className="bg-white border p-4 sm:p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: T.navy }}>
                {profile?.full_name?.split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
                {totalBidsReceived > 0
                  ? <><span className="font-semibold" style={{ color: T.coral }}>{totalBidsReceived} bids</span> across your jobs</>
                  : 'Post a job to start receiving bids'
                }
              </p>
            </div>
            <Link href="/jobs/new"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-2"
              style={{ background: T.coral, borderRadius: 6 }}>
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Post a Job</span>
              <span className="sm:hidden">Post</span>
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Jobs Posted',   value: jobsPosted        || 0, icon: FileText    },
              { label: 'Bids Received', value: totalBidsReceived || 0, icon: TrendingUp  },
              { label: 'Hires Made',    value: hiresMade         || 0, icon: CheckCircle },
              { label: 'Reviews Given', value: reviewsGiven      || 0, icon: Star        },
            ].map(stat => (
              <div key={stat.label}
                className="flex flex-col items-center py-3 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <stat.icon size={13} strokeWidth={1.5} style={{ color: T.textLight }} className="mb-1" />
                <span className="text-xl font-bold" style={{ color: T.navy }}>{stat.value}</span>
                <span className="text-xs mt-0.5 text-center leading-tight px-1" style={{ color: T.textLight }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE ONLY: Quick action buttons ── */}
        <div className="grid grid-cols-3 gap-2 lg:hidden">
          {[
            { label: 'My Jobs',   href: '/jobs/mine', icon: Briefcase,     badge: jobsPosted    },
            { label: 'Messages',  href: '/messages',  icon: MessageSquare, badge: unreadMessages },
            { label: 'Providers', href: '/providers', icon: Search,        badge: null           },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="relative flex flex-col items-center gap-1.5 p-3 bg-white border transition-colors hover:bg-slate-50"
              style={{ borderColor: T.border, borderRadius: 4 }}>
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: T.coral, borderRadius: '50%', fontSize: 9 }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              <item.icon size={20} strokeWidth={1.5} style={{ color: T.navy }} />
              <span className="text-xs font-medium" style={{ color: T.textMuted }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent bids */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
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
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: T.textLight }}>
                No bids yet —{' '}
                <Link href="/jobs/new" style={{ color: T.coral }}>post a job</Link>
              </p>
            </div>
          ) : (
            recentBids.map(bid => (
              <div key={bid.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-slate-50"
                style={{ borderColor: T.border }}>
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 border text-xs font-bold"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}>
                  {bid.provider?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate" style={{ color: T.navy }}>
                      {bid.provider?.full_name}
                    </span>
                    {bid.provider?.is_verified && (
                      <CheckCircle size={11} strokeWidth={1.5} className="text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs truncate block" style={{ color: T.textLight }}>
                    {bid.job?.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: T.navy }}>
                    ${Number(bid.amount).toLocaleString()}
                  </span>
                  <Link href={`/jobs/${bid.job_id}`}
                    className="text-xs px-2.5 py-1.5 border font-medium transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Platform activity */}
        <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
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
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: T.textLight }}>No activity yet</p>
            </div>
          ) : (
            feedItems.map(item => (
              <div key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                style={{ borderColor: T.border }}>
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 border text-xs font-semibold"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy, background: T.bg }}>
                  {item.type === 'new_provider' ? item.data.full_name?.charAt(0) :
                   item.type === 'new_job'      ? item.data.hirer?.full_name?.charAt(0) :
                   item.data.reviewer?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed" style={{ color: T.navyMid }}>
                    {item.type === 'new_provider' && (
                      <><span className="font-medium">{item.data.full_name}</span>
                      <span style={{ color: T.textMuted }}> joined as a verified provider</span></>
                    )}
                    {item.type === 'new_job' && (
                      <><span className="font-medium">{item.data.title}</span>
                      <span style={{ color: T.textMuted }}> posted in {item.data.location}</span></>
                    )}
                    {item.type === 'review' && (
                      <><span className="font-medium">{item.data.reviewer?.full_name}</span>
                      <span style={{ color: T.textMuted }}> reviewed </span>
                      <span className="font-medium">{item.data.reviewee?.full_name}</span></>
                    )}
                  </p>
                  <span className="text-xs" style={{ color: T.textLight }}>{timeAgo(item.date)}</span>
                </div>
                <span className="flex-shrink-0 text-xs font-medium px-1.5 py-0.5"
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

        {/* ── MOBILE ONLY: Top providers ── */}
        <div className="lg:hidden">
          <TopProviders providers={topProviders} />
        </div>

        {/* ── MOBILE ONLY: My recent jobs ── */}
        {myJobs.length > 0 && (
          <div className="lg:hidden bg-white border overflow-hidden"
            style={{ borderColor: T.border, borderRadius: 4 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
              <span className="text-sm font-semibold" style={{ color: T.navy }}>My Jobs</span>
              <Link href="/jobs/mine" className="text-xs font-medium" style={{ color: T.coral }}>
                View all <ArrowRight size={11} className="inline" />
              </Link>
            </div>
            {myJobs.slice(0, 3).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-slate-50"
                style={{ borderColor: T.border }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: T.navy }}>{job.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.textLight }}>
                    {job.bids_count} bids · {job.status}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 ml-2"
                  style={{
                    background: job.status === 'open' ? '#F0FDF4' : T.bg,
                    color:      job.status === 'open' ? '#16A34A' : T.textLight,
                    borderRadius: 4,
                  }}>
                  {job.status}
                </span>
              </Link>
            ))}
          </div>
        )}

      </div>

      {/* ── RIGHT SIDEBAR — desktop only ── */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        {/* Profile card */}
        <div className="bg-white border p-4" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-3 pb-4 border-b mb-4" style={{ borderColor: T.border }}>
            <div className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
              style={{ background: T.navy, borderRadius: 4 }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile?.full_name?.charAt(0) || '?'
              }
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: T.navy }}>{profile?.full_name}</div>
              <div className="text-xs capitalize" style={{ color: T.textMuted }}>{profile?.org_type || 'Hirer'}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                <span className="text-xs truncate" style={{ color: T.textLight }}>{profile?.location}</span>
              </div>
            </div>
          </div>
          <Link href="/profile/edit"
            className="w-full flex items-center justify-center text-xs font-medium py-1.5 border transition-colors hover:bg-slate-50"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
            Edit Profile
          </Link>
        </div>

        <TopProviders providers={topProviders} />

        <div className="border p-4" style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
          <span className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: '#FFD3AC' }}>
            Need Someone?
          </span>
          <p className="text-xs leading-relaxed mb-3" style={{ color: T.textLight }}>
            Post a job and receive bids from verified professionals.
          </p>
          <Link href="/jobs/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white"
            style={{ background: T.coral, borderRadius: 4 }}>
            Post a Job <ArrowRight size={13} />
          </Link>
        </div>
      </div>

    </div>
  )
}

function TopProviders({ providers }) {
  if (providers.length === 0) return null
  return (
    <div className="bg-white border overflow-hidden" style={{ borderColor: T.border, borderRadius: 4 }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between"
        style={{ borderColor: T.border, background: T.bg }}>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: T.textLight }}>
          Top Rated
        </span>
        <Link href="/providers" className="text-xs" style={{ color: T.coral }}>See all</Link>
      </div>
      {providers.map(p => (
        <Link key={p.id} href={`/providers/${p.id}`}
          className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
          style={{ borderColor: T.border }}>
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold border"
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
      ))}
    </div>
  )
}