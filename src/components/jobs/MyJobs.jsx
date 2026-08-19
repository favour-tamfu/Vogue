'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, MapPin, DollarSign,
  Users, Clock, ChevronDown, ChevronUp,
  CheckCircle, Star, ArrowRight, Eye
} from 'lucide-react'
import { formatBudget, formatMoney } from '@/lib/currency'
import Onuuzo from '@/components/motifs/Onuuzo'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_CONFIG = {
  open:      { className: 'bg-terracotta-soft text-terracotta', label: 'Open'      },
  hired:     { className: 'bg-verified-bg text-verified',       label: 'Hired'     },
  closed:    { className: 'bg-cream-2 text-ink-3',              label: 'Closed'    },
  cancelled: { className: 'bg-danger-bg text-danger',           label: 'Cancelled' },
}

const BID_PILL = {
  accepted: 'bg-verified-bg text-verified',
  rejected: 'bg-danger-bg text-danger',
}

export default function MyJobs({ jobs }) {
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState(null)

  const counts = {
    all:       jobs.length,
    open:      jobs.filter(j => j.status === 'open').length,
    hired:     jobs.filter(j => j.status === 'hired').length,
    closed:    jobs.filter(j => j.status === 'closed').length,
  }

  const filtered = jobs.filter(j => filter === 'all' ? true : j.status === filter)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="t-h1 text-ink">My Jobs</h1>
          <p className="text-sm mt-0.5 text-ink-2">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 flex-shrink-0
                     rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
        >
          <Plus size={14} strokeWidth={2.5} />
          Post a Job
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center bg-surface border border-line rounded-xs p-1 mb-5 overflow-x-auto">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 flex-shrink-0 px-4 py-1.5 text-xs font-semibold
                        rounded-[3px] transition-all ${
              filter === key ? 'bg-ink text-white' : 'text-ink-2'
            }`}
          >
            <span className="capitalize">{key}</span>
            <span className={`px-1.5 py-0.5 text-xs rounded-[3px] ${
              filter === key ? 'bg-white/20 text-white' : 'bg-line text-ink-2'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-line rounded-md py-20 text-center">
          {/* Ọnụ ụzọ — the threshold. */}
          <Onuuzo size={104} className="text-terracotta mx-auto mb-4 opacity-70" />
          <p className="text-sm font-medium text-ink-2">
            {filter === 'all' ? 'No jobs posted yet' : `No ${filter} jobs`}
          </p>
          {filter === 'all' && (
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 text-white
                         rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
            >
              <Plus size={13} /> Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => {
            const cfg        = STATUS_CONFIG[job.status] || STATUS_CONFIG.open
            const isExpanded = expanded === job.id
            const pendingBids = job.bids?.filter(b => b.status === 'pending') || []

            return (
              <div
                key={job.id}
                className="bg-surface border border-line rounded-md overflow-hidden"
              >
                {/* Job row */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-xs ${cfg.className}`}>
                          {cfg.label}
                        </span>
                        {job.category && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
                            {job.category.name}
                          </span>
                        )}
                        <span className="text-xs text-ink-3">
                          {timeAgo(job.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="t-h3 mb-2 text-ink">
                        {job.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <MapPin size={11} strokeWidth={1.5} className="text-ink-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <DollarSign size={11} strokeWidth={1.5} className="text-ink-3" />
                          {formatBudget(job.budget_min, job.budget_max, job.currency)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <Clock size={11} strokeWidth={1.5} className="text-ink-3" />
                          Event: {formatDate(job.event_date)}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Bid count */}
                      <div className="text-center">
                        <div className="text-xl t-money text-ink">
                          {job.bids_count}
                        </div>
                        <div className="text-xs text-ink-3">
                          {job.bids_count === 1 ? 'bid' : 'bids'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 border border-line
                                     rounded-sm text-ink-2 transition-colors hover:bg-cream"
                        >
                          <Eye size={12} strokeWidth={1.5} /> View
                        </Link>
                        {job.bids_count > 0 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : job.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-white
                                       rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
                          >
                            <Users size={12} strokeWidth={1.5} />
                            Bids
                            {isExpanded
                              ? <ChevronUp size={11} />
                              : <ChevronDown size={11} />
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded bids */}
                {isExpanded && (
                  <div className="border-t border-line bg-cream">
                    <div className="px-5 py-3 border-b border-line flex items-center justify-between">
                      <p className="text-xs font-semibold text-ink-3">
                        {pendingBids.length} pending bid{pendingBids.length !== 1 ? 's' : ''}
                      </p>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-medium flex items-center gap-1 text-terracotta hover:text-terracotta-deep"
                      >
                        Full view <ArrowRight size={11} />
                      </Link>
                    </div>

                    {job.bids?.length === 0 ? (
                      <div className="px-5 py-4">
                        <p className="text-xs text-ink-3">
                          No bids yet
                        </p>
                      </div>
                    ) : (
                      <div>
                        {job.bids?.slice(0, 5).map(bid => (
                          <div
                            key={bid.id}
                            className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-0 bg-surface"
                          >
                            {/* Avatar */}
                            <div className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold
                                            flex-shrink-0 bg-ink rounded-xs">
                              {bid.provider?.full_name?.charAt(0) || '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-ink">
                                  {bid.provider?.full_name}
                                </span>
                                {bid.provider?.is_verified && (
                                  <CheckCircle size={12} strokeWidth={1.5} className="text-verified" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {bid.provider?.average_rating > 0 && (
                                  <span className="flex items-center gap-0.5 text-xs text-ink-3">
                                    <Star size={10} strokeWidth={1.5}
                                      className="fill-ochre text-ochre" />
                                    {Number(bid.provider.average_rating).toFixed(1)}
                                  </span>
                                )}
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-[3px] ${
                                  BID_PILL[bid.status] || 'bg-cream-2 text-ink-3'
                                }`}>
                                  {bid.status}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm t-money text-ink">
                                {formatMoney(bid.amount, job.currency)}
                              </span>
                              <Link
                                href={`/providers/${bid.provider?.id}`}
                                className="text-xs font-medium px-2 py-1 border border-line rounded-sm
                                           text-ink-2 transition-colors hover:bg-cream"
                              >
                                Profile
                              </Link>
                            </div>
                          </div>
                        ))}

                        {job.bids?.length > 5 && (
                          <div className="px-5 py-3 text-center">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-xs font-medium text-terracotta hover:text-terracotta-deep"
                            >
                              View all {job.bids.length} bids →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
