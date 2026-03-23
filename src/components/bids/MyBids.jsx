'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Send, MapPin, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle,
  Eye, Trash2, Calendar, Star, ArrowRight
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

const BID_STATUS = {
  pending:   { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', label: 'Pending',   icon: Clock       },
  accepted:  { bg: '#F0FDF4', border: '#86EFAC', color: '#16A34A', label: 'Accepted',  icon: CheckCircle },
  rejected:  { bg: '#FFF5F5', border: '#FECACA', color: '#DC2626', label: 'Rejected',  icon: XCircle     },
  withdrawn: { bg: T.bg,      border: T.border,  color: T.textLight,label: 'Withdrawn',icon: AlertCircle },
}

export default function MyBids({ bids, profile }) {
  const router   = useRouter()
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
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>My Bids</h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {Object.entries(counts).map(([key, count]) => {
          const cfg = BID_STATUS[key]
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="border p-3 text-center transition-all"
              style={{
                borderColor:  filter === key ? T.coral : T.border,
                background:   filter === key ? T.coralLight : '#fff',
                borderRadius: 4,
              }}
            >
              <div className="text-xl font-bold"
                style={{ color: filter === key ? T.coral : T.navy }}>
                {count}
              </div>
              <div className="text-xs capitalize mt-0.5"
                style={{ color: filter === key ? T.coral : T.textLight }}>
                {key}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bids list */}
      {filtered.length === 0 ? (
        <div
          className="bg-white border py-20 text-center"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <Send size={36} strokeWidth={1}
            style={{ color: T.textLight, margin: '0 auto 12px' }} />
          <p className="text-sm font-medium" style={{ color: T.textMuted }}>
            {filter === 'all' ? 'No bids placed yet' : `No ${filter} bids`}
          </p>
          {filter === 'all' && (
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 text-white"
              style={{ background: T.coral, borderRadius: 4 }}
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
                className="bg-white border overflow-hidden"
                style={{ borderColor: T.border, borderRadius: 4 }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">

                    {/* Hirer avatar */}
                    <div
                      className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: T.navy, borderRadius: 4 }}
                    >
                      {bid.job?.hirer?.full_name?.charAt(0) || '?'}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <div>
                          <Link href={`/jobs/${bid.job?.id}`}>
                            <h3 className="text-sm font-semibold hover:underline"
                              style={{ color: T.navy }}>
                              {bid.job?.title}
                            </h3>
                          </Link>
                          <p className="text-xs mt-0.5" style={{ color: T.textLight }}>
                            by {bid.job?.hirer?.full_name} · {bid.job?.hirer?.org_type || 'Hirer'}
                          </p>
                        </div>

                        {/* Bid status */}
                        <span
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 border flex-shrink-0"
                          style={{
                            background:   cfg.bg,
                            borderColor:  cfg.border,
                            color:        cfg.color,
                            borderRadius: 4,
                          }}
                        >
                          <StatusIcon size={10} strokeWidth={2} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Job meta */}
                      <div className="flex items-center gap-4 flex-wrap mb-3">
                        {bid.job?.category && (
                          <span className="text-xs font-medium px-2 py-0.5"
                            style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                            {bid.job.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs"
                          style={{ color: T.textMuted }}>
                          <MapPin size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          {bid.job?.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs"
                          style={{ color: T.textMuted }}>
                          <Calendar size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          {bid.job?.event_date && formatDate(bid.job.event_date)}
                        </span>
                        <span className="flex items-center gap-1 text-xs"
                          style={{ color: T.textMuted }}>
                          <DollarSign size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                          {formatBudget(bid.job?.budget_min, bid.job?.budget_max, bid.job?.currency)}
                        </span>
                      </div>

                      {/* Your bid amount + pitch */}
                      <div
                        className="p-3 border mb-3"
                        style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: T.textLight }}>
                            Your bid
                          </span>
                          <span className="text-base font-bold" style={{ color: T.navy }}>
                            ${Number(bid.amount).toLocaleString()}
                          </span>
                        </div>
                        {bid.pitch && (
                          <p className="text-xs leading-relaxed line-clamp-2"
                            style={{ color: T.textMuted }}>
                            {bid.pitch}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: T.textLight }}>
                          Placed {timeAgo(bid.created_at)}
                        </p>
                      </div>

                      {/* Accepted message */}
                      {bid.status === 'accepted' && (
                        <div
                          className="flex items-start gap-2 p-3 border mb-3"
                          style={{ background: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 4 }}
                        >
                          <CheckCircle size={14} strokeWidth={1.5}
                            className="text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-green-800">
                              You've been hired!
                            </p>
                            <p className="text-xs text-green-700 mt-0.5">
                              Coordinate payment and final details with the hirer directly.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Rejected message */}
                      {bid.status === 'rejected' && (
                        <div
                          className="flex items-start gap-2 p-3 border mb-3"
                          style={{ background: '#FFF5F5', borderColor: '#FECACA', borderRadius: 4 }}
                        >
                          <XCircle size={14} strokeWidth={1.5}
                            className="text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700">
                            The hirer chose another provider for this job.
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/jobs/${bid.job?.id}`}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-slate-50"
                          style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                        >
                          <Eye size={12} strokeWidth={1.5} /> View Job
                        </Link>

                        {/* Message hirer if accepted */}
                        {bid.status === 'accepted' && (
                          <Link
                            href="/messages"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-white"
                            style={{ background: T.coral, borderRadius: 4 }}
                          >
                            Messages <ArrowRight size={12} />
                          </Link>
                        )}

                        {/* Withdraw if pending */}
                        {bid.status === 'pending' && (
                          <button
                            onClick={() => handleWithdraw(bid)}
                            disabled={withdrawing === bid.id}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-red-50 disabled:opacity-50"
                            style={{ borderColor: '#FECACA', borderRadius: 4, color: '#DC2626' }}
                          >
                            <Trash2 size={12} strokeWidth={1.5} />
                            {withdrawing === bid.id ? 'Withdrawing...' : 'Withdraw'}
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