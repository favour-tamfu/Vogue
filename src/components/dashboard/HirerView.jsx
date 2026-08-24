'use client'

import Link from 'next/link'
import ReviewPrompt from '@/components/reviews/ReviewPrompt'
import {
  Plus, Briefcase, MessageSquare, Star, ChevronRight,
  Bell, ArrowRight, FileText, TrendingUp, Users,
  MapPin, CheckCircle, Search
} from 'lucide-react'
import { formatMoney } from '@/lib/currency'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const FEED_PILL = {
  new_provider: 'bg-verified-bg text-verified',
  new_job:      'bg-ochre-soft text-ochre-text',
  review:       'bg-terracotta-soft text-terracotta',
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
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line bg-cream">
            <span className="t-micro text-ink-3">
              Navigation
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5">
            {/* A text link like its siblings. A filled button inside a list
                of plain nav links mixes two component metaphors in one stack;
                the header button is this screen's primary CTA. */}
            <Link href="/jobs/new"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xs
                         text-terracotta transition-colors hover:bg-terracotta-soft">
              <Plus size={14} strokeWidth={2.5} /> Post a Job
            </Link>
            {[
              { label: 'My Jobs',  href: '/jobs/mine', icon: Briefcase,     badge: jobsPosted || null },
              { label: 'Messages', href: '/messages',  icon: MessageSquare, badge: unreadMessages || null },
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

        {/* "Top Rated" and "Need Someone?" each have exactly one home. Both
            previously rendered in this rail AND the right one, which reads as
            a component mounted twice rather than a layout decision. */}
        <div className="border border-line rounded-md p-4 bg-cream-2">
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} strokeWidth={1.5} className="text-terracotta" />
            <span className="text-sm font-semibold text-ink">Need Someone?</span>
          </div>
          <p className="text-xs leading-relaxed mb-4 text-ink-2">
            Post a job and receive bids from verified professionals within hours.
          </p>
          <Link href="/jobs/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold
                       rounded-sm border border-terracotta text-terracotta transition-colors
                       hover:bg-terracotta-soft">
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
        <div className="bg-surface border border-line rounded-md p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="t-h2 text-ink">
                {profile?.full_name?.split(' ')[0]}&apos;s Dashboard
              </h1>
              <p className="text-sm mt-0.5 text-ink-2">
                {totalBidsReceived > 0
                  ? <><span className="font-semibold text-terracotta">{totalBidsReceived} bids</span> across your jobs</>
                  : 'Post a job to start receiving bids'
                }
              </p>
            </div>
            <Link href="/jobs/new"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-2
                         rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
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
                className="flex flex-col items-center py-3 border border-line rounded-xs bg-cream">
                <stat.icon size={13} strokeWidth={1.5} className="text-ink-3 mb-1" />
                <span className="text-xl t-money text-ink">{stat.value}</span>
                <span className="text-xs mt-0.5 text-center leading-tight px-1 text-ink-3">
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
              className="relative flex flex-col items-center gap-1.5 p-3 bg-surface border border-line
                         rounded-xs transition-colors hover:bg-cream">
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-white
                                 font-bold rounded-full bg-terracotta"
                  style={{ fontSize: 9 }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              <item.icon size={20} strokeWidth={1.5} className="text-ink" />
              <span className="text-xs font-medium text-ink-2">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent bids */}
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} strokeWidth={1.5} className="text-ink-3" />
              <span className="t-h3 text-ink">Recent Bids</span>
            </div>
            <Link href="/jobs/mine"
              className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-deep">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentBids.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-3">
                No bids yet —{' '}
                <Link href="/jobs/new" className="text-terracotta hover:text-terracotta-deep">post a job</Link>
              </p>
            </div>
          ) : (
            recentBids.map(bid => (
              <div key={bid.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0 hover:bg-cream">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 border border-line
                                rounded-xs text-xs font-bold text-ink bg-cream">
                  {bid.provider?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate text-ink">
                      {bid.provider?.full_name}
                    </span>
                    {bid.provider?.is_verified && <VerifiedBadge />}
                  </div>
                  <span className="text-xs truncate block text-ink-3">
                    {bid.job?.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm t-money text-ink">
                    {formatMoney(bid.amount, bid.job?.currency)}
                  </span>
                  <Link href={`/jobs/${bid.job_id}`}
                    className="text-xs px-2.5 py-1.5 border border-line rounded-sm font-medium
                               text-ink-2 transition-colors hover:bg-cream">
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Platform activity */}
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2">
              <Bell size={13} strokeWidth={1.5} className="text-ink-3" />
              <span className="t-h3 text-ink">Platform Activity</span>
            </div>
            <Link href="/feed"
              className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-deep">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {feedItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-3">No activity yet</p>
            </div>
          ) : (
            feedItems.map(item => (
              <div key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-line last:border-0">
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 border border-line
                                rounded-xs text-xs font-semibold text-ink bg-cream">
                  {item.type === 'new_provider' ? item.data.full_name?.charAt(0) :
                   item.type === 'new_job'      ? item.data.hirer?.full_name?.charAt(0) :
                   item.data.reviewer?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed text-ink-2">
                    {item.type === 'new_provider' && (
                      <><span className="font-medium">{item.data.full_name}</span>
                      <span className="text-ink-2"> joined as a verified provider</span></>
                    )}
                    {item.type === 'new_job' && (
                      <><span className="font-medium">{item.data.title}</span>
                      <span className="text-ink-2"> posted in {item.data.location}</span></>
                    )}
                    {item.type === 'review' && (
                      <><span className="font-medium">{item.data.reviewer?.full_name}</span>
                      <span className="text-ink-2"> reviewed </span>
                      <span className="font-medium">{item.data.reviewee?.full_name}</span></>
                    )}
                  </p>
                  <span className="text-xs text-ink-3">{timeAgo(item.date)}</span>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-xs ${
                  FEED_PILL[item.type] || FEED_PILL.review
                }`}>
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
          <div className="lg:hidden bg-surface border border-line rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="t-h3 text-ink">My Jobs</span>
              <Link href="/jobs/mine" className="text-xs font-medium text-terracotta hover:text-terracotta-deep">
                View all <ArrowRight size={11} className="inline" />
              </Link>
            </div>
            {myJobs.slice(0, 3).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-line last:border-0 hover:bg-cream">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-ink">{job.title}</p>
                  <p className="text-xs mt-0.5 text-ink-3">
                    {job.bids_count} bids · {job.status}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 ml-2 rounded-xs ${
                  job.status === 'open'
                    ? 'bg-terracotta-soft text-terracotta'
                    : 'bg-cream-2 text-ink-3'
                }`}>
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
        <div className="bg-surface border border-line rounded-md p-4">
          <div className="flex items-center gap-3 pb-4 border-b border-line mb-4">
            <div className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold
                            flex-shrink-0 overflow-hidden bg-ink rounded-xs">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile?.full_name?.charAt(0) || '?'
              }
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate text-ink">{profile?.full_name}</div>
              <div className="text-xs capitalize text-ink-2">{profile?.org_type || 'Hirer'}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} className="text-ink-3" />
                <span className="text-xs truncate text-ink-3">{profile?.location}</span>
              </div>
            </div>
          </div>
          <Link href="/profile/edit"
            className="w-full flex items-center justify-center text-xs font-medium py-1.5 border border-line
                       rounded-sm text-ink-2 transition-colors hover:bg-cream">
            Edit Profile
          </Link>
        </div>

        <TopProviders providers={topProviders} />
      </div>

    </div>
  )
}

function TopProviders({ providers }) {
  if (providers.length === 0) return null
  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-line flex items-center justify-between bg-cream">
        <span className="t-micro text-ink-3">
          Top Rated
        </span>
        <Link href="/providers" className="text-xs text-terracotta hover:text-terracotta-deep">See all</Link>
      </div>
      {providers.map(p => (
        <Link key={p.id} href={`/providers/${p.id}`}
          className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0
                     hover:bg-cream transition-colors">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold
                          border border-line rounded-xs text-ink bg-cream">
            {p.full_name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-ink">{p.full_name}</div>
            <div className="text-xs text-ink-3">
              {p.provider_categories?.[0]?.category?.name || 'Provider'}
            </div>
          </div>
          {p.average_rating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={11} strokeWidth={1.5} className="fill-ochre text-ochre" />
              <span className="text-xs font-semibold t-money text-ink-2">
                {Number(p.average_rating).toFixed(1)}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
