'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, Briefcase, MapPin, DollarSign,
  Users, Clock, ChevronDown, ChevronUp,
  CheckCircle, Star, ArrowRight, Eye
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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function formatBudget(min, max, currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: 'GH₵', XAF: 'FCFA' }
  const sym = symbols[currency] || '$'
  if (min) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  return `Up to ${sym}${Number(max).toLocaleString()}`
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_CONFIG = {
  open:      { bg: '#F0FDF4', color: '#16A34A', label: 'Open'      },
  hired:     { bg: '#EFF6FF', color: '#2563EB', label: 'Hired'     },
  closed:    { bg: T.bg,      color: T.textLight, label: 'Closed'  },
  cancelled: { bg: '#FFF5F5', color: '#DC2626',  label: 'Cancelled'},
}

export default function MyJobs({ jobs, profile }) {
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
          <h1 className="text-xl font-semibold" style={{ color: T.navy }}>My Jobs</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 flex-shrink-0"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Post a Job
        </Link>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex items-center bg-white border p-1 mb-5 overflow-x-auto"
        style={{ borderColor: T.border, borderRadius: 4 }}
      >
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex items-center gap-2 flex-shrink-0 px-4 py-1.5 text-xs font-semibold transition-all"
            style={{
              borderRadius: 3,
              background: filter === key ? T.navy : 'transparent',
              color:      filter === key ? '#fff' : T.textMuted,
            }}
          >
            <span className="capitalize">{key}</span>
            <span
              className="px-1.5 py-0.5 text-xs"
              style={{
                borderRadius: 3,
                background: filter === key ? 'rgba(255,255,255,0.2)' : T.border,
                color:      filter === key ? '#fff' : T.textMuted,
              }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <div
          className="bg-white border py-20 text-center"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <Briefcase size={36} strokeWidth={1}
            style={{ color: T.textLight, margin: '0 auto 12px' }} />
          <p className="text-sm font-medium" style={{ color: T.textMuted }}>
            {filter === 'all' ? 'No jobs posted yet' : `No ${filter} jobs`}
          </p>
          {filter === 'all' && (
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 text-white"
              style={{ background: T.coral, borderRadius: 4 }}
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
            const acceptedBid = job.bids?.find(b => b.status === 'accepted')

            return (
              <div
                key={job.id}
                className="bg-white border overflow-hidden"
                style={{ borderColor: T.border, borderRadius: 4 }}
              >
                {/* Job row */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5"
                          style={{ background: cfg.bg, color: cfg.color, borderRadius: 4 }}
                        >
                          {cfg.label}
                        </span>
                        {job.category && (
                          <span
                            className="text-xs font-medium px-2 py-0.5"
                            style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}
                          >
                            {job.category.name}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: T.textLight }}>
                          {timeAgo(job.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold mb-2" style={{ color: T.navy }}>
                        {job.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                          <MapPin size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                          <DollarSign size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          {formatBudget(job.budget_min, job.budget_max, job.currency)}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                          <Clock size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          Event: {formatDate(job.event_date)}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Bid count */}
                      <div className="text-center">
                        <div className="text-xl font-bold" style={{ color: T.navy }}>
                          {job.bids_count}
                        </div>
                        <div className="text-xs" style={{ color: T.textLight }}>
                          {job.bids_count === 1 ? 'bid' : 'bids'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-slate-50"
                          style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                        >
                          <Eye size={12} strokeWidth={1.5} /> View
                        </Link>
                        {job.bids_count > 0 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : job.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-white"
                            style={{ background: T.coral, borderRadius: 4 }}
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
                  <div
                    className="border-t"
                    style={{ borderColor: T.border, background: T.bg }}
                  >
                    <div className="px-5 py-3 border-b flex items-center justify-between"
                      style={{ borderColor: T.border }}>
                      <p className="text-xs font-semibold" style={{ color: T.textLight }}>
                        {pendingBids.length} pending bid{pendingBids.length !== 1 ? 's' : ''}
                      </p>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-medium flex items-center gap-1"
                        style={{ color: T.coral }}
                      >
                        Full view <ArrowRight size={11} />
                      </Link>
                    </div>

                    {job.bids?.length === 0 ? (
                      <div className="px-5 py-4">
                        <p className="text-xs" style={{ color: T.textLight }}>
                          No bids yet
                        </p>
                      </div>
                    ) : (
                      <div>
                        {job.bids?.slice(0, 5).map(bid => (
                          <div
                            key={bid.id}
                            className="flex items-center gap-3 px-5 py-3 border-b last:border-0 bg-white"
                            style={{ borderColor: T.border }}
                          >
                            {/* Avatar */}
                            <div
                              className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: T.navy, borderRadius: 4 }}
                            >
                              {bid.provider?.full_name?.charAt(0) || '?'}
                            </div>

                            {/* Info */}
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
                                {bid.provider?.average_rating > 0 && (
                                  <span className="flex items-center gap-0.5 text-xs"
                                    style={{ color: T.textLight }}>
                                    <Star size={10} strokeWidth={1.5}
                                      className="fill-amber-400 text-amber-400" />
                                    {Number(bid.provider.average_rating).toFixed(1)}
                                  </span>
                                )}
                                <span
                                  className="text-xs font-medium px-1.5 py-0.5"
                                  style={{
                                    background: bid.status === 'accepted' ? '#F0FDF4' :
                                                bid.status === 'rejected' ? '#FFF5F5' : T.bg,
                                    color: bid.status === 'accepted' ? '#16A34A' :
                                           bid.status === 'rejected' ? '#DC2626' : T.textLight,
                                    borderRadius: 3,
                                  }}
                                >
                                  {bid.status}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-bold" style={{ color: T.navy }}>
                                ${Number(bid.amount).toLocaleString()}
                              </span>
                              <Link
                                href={`/providers/${bid.provider?.id}`}
                                className="text-xs font-medium px-2 py-1 border transition-colors hover:bg-white"
                                style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
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
                              className="text-xs font-medium"
                              style={{ color: T.coral }}
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