'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin, Wallet, Clock,
  CheckCircle, XCircle, AlertCircle,
  Eye, Trash2, Calendar, ArrowRight
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

const BID_STATUS = {
  pending:   { className: 'bg-ochre-soft text-ochre-text border-ochre-soft', label: 'Pending',   icon: Clock       },
  accepted:  { className: 'bg-verified-bg text-verified border-verified-bg', label: 'Accepted',  icon: CheckCircle },
  rejected:  { className: 'bg-danger-bg text-danger border-danger-bg',       label: 'Rejected',  icon: XCircle     },
  withdrawn: { className: 'bg-cream-2 text-ink-3 border-line',               label: 'Withdrawn', icon: AlertCircle },
}

export default function MyBids({ bids }) {
  const supabase = createClient()

  const [filter, setFilter]       = useState('all')
  const [withdrawing, setWithdrawing] = useState(null)
  const [localBids, setLocalBids] = useState(bids)

  const counts = {
    all:       bids.length,
    pending:   bids.filter(b => b.status === 'pending').length,
    accepted:  bids.filter(b => b.status === 'accepted').length,
    rejected:  bids.filter(b => b.status === 'rejected').length,
  }

  const filtered = localBids.filter(b =>
    filter === 'all' ? true : b.status === filter
  )

  const handleWithdraw = async (bid) => {
    if (!confirm('Withdraw this bid? This cannot be undone.')) return
    setWithdrawing(bid.id)

    const { error } = await supabase
      .from('bids')
      .update({ status: 'withdrawn' })
      .eq('id', bid.id)

    if (!error) {
      setLocalBids(prev =>
        prev.map(b => b.id === bid.id ? { ...b, status: 'withdrawn' } : b)
      )
    }

    setWithdrawing(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="t-h1 text-ink">My Bids</h1>
        <p className="text-sm mt-0.5 text-ink-2">
          {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`border rounded-xs p-3 text-center transition-all ${
              filter === key
                ? 'border-terracotta bg-terracotta-soft'
                : 'border-line bg-surface'
            }`}
          >
            <div className={`text-xl font-bold t-money ${
              filter === key ? 'text-terracotta' : 'text-ink'
            }`}>
              {count}
            </div>
            <div className={`text-xs capitalize mt-0.5 ${
              filter === key ? 'text-terracotta' : 'text-ink-3'
            }`}>
              {key}
            </div>
          </button>
        ))}
      </div>

      {/* Bids list */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-line rounded-md py-20 text-center">
          {/* Ọnụ ụzọ — the threshold. */}
          <Onuuzo size={104} className="text-terracotta mx-auto mb-4 opacity-70" />
          <p className="text-sm font-medium text-ink-2">
            {filter === 'all' ? 'No bids placed yet' : `No ${filter} bids`}
          </p>
          {filter === 'all' && (
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 text-white
                         rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
            >
              Browse Open Jobs <ArrowRight size={12} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bid => {
            const cfg = BID_STATUS[bid.status] || BID_STATUS.pending
            const StatusIcon = cfg.icon

            return (
              <div
                key={bid.id}
                className="bg-surface border border-line rounded-md overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">

                    {/* Hirer avatar */}
                    <div className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold
                                    flex-shrink-0 bg-ink rounded-xs">
                      {bid.job?.hirer?.full_name?.charAt(0) || '?'}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <div>
                          <Link href={`/jobs/${bid.job?.id}`}>
                            <h3 className="t-h3 hover:underline text-ink">
                              {bid.job?.title}
                            </h3>
                          </Link>
                          <p className="text-xs mt-0.5 text-ink-3">
                            by {bid.job?.hirer?.full_name} · {bid.job?.hirer?.org_type || 'Hirer'}
                          </p>
                        </div>

                        {/* Bid status */}
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5
                                          border rounded-xs flex-shrink-0 ${cfg.className}`}>
                          <StatusIcon size={10} strokeWidth={2} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Job meta */}
                      <div className="flex items-center gap-4 flex-wrap mb-3">
                        {bid.job?.category && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
                            {bid.job.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <MapPin size={11} strokeWidth={1.5} className="text-ink-3" />
                          {bid.job?.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <Calendar size={11} strokeWidth={1.5} className="text-ink-3" />
                          {bid.job?.event_date && formatDate(bid.job.event_date)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-ink-2">
                          <Wallet size={11} strokeWidth={1.5} className="text-ink-3" />
                          {formatBudget(bid.job?.budget_min, bid.job?.budget_max, bid.job?.currency)}
                        </span>
                      </div>

                      {/* Your bid amount + pitch */}
                      <div className="p-3 border border-line rounded-xs mb-3 bg-cream">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-ink-3">
                            Your bid
                          </span>
                          <span className="text-base t-money text-ink">
                            {formatMoney(bid.amount, bid.job?.currency)}
                          </span>
                        </div>
                        {bid.pitch && (
                          <p className="text-xs leading-relaxed line-clamp-2 text-ink-2">
                            {bid.pitch}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-ink-3">
                          Placed {timeAgo(bid.created_at)}
                        </p>
                      </div>

                      {/* Accepted message */}
                      {bid.status === 'accepted' && (
                        <div className="flex items-start gap-2 p-3 border border-line rounded-xs mb-3 bg-verified-bg">
                          <CheckCircle size={14} strokeWidth={1.5}
                            className="text-verified flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-verified">
                              You&apos;ve been hired!
                            </p>
                            <p className="text-xs text-verified mt-0.5">
                              Coordinate payment and final details with the hirer directly.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Rejected message */}
                      {bid.status === 'rejected' && (
                        <div className="flex items-start gap-2 p-3 border border-line rounded-xs mb-3 bg-danger-bg">
                          <XCircle size={14} strokeWidth={1.5}
                            className="text-danger flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-danger">
                            The hirer chose another provider for this job.
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/jobs/${bid.job?.id}`}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-line
                                     rounded-sm text-ink-2 transition-colors hover:bg-cream"
                        >
                          <Eye size={12} strokeWidth={1.5} /> View Job
                        </Link>

                        {/* Message hirer if accepted */}
                        {bid.status === 'accepted' && (
                          <Link
                            href="/messages"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-white
                                       rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
                          >
                            Messages <ArrowRight size={12} />
                          </Link>
                        )}

                        {/* Withdraw if pending */}
                        {bid.status === 'pending' && (
                          <button
                            onClick={() => handleWithdraw(bid)}
                            disabled={withdrawing === bid.id}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-line
                                       rounded-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
                          >
                            <Trash2 size={12} strokeWidth={1.5} />
                            {withdrawing === bid.id ? 'Withdrawing…' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
