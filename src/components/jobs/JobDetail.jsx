'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Calendar, Wallet, Users, Clock,
  ChevronLeft, CheckCircle, Star, Shield,
  AlertCircle, Send, ArrowRight, Briefcase,
  Award
} from 'lucide-react'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Agwo from '@/components/motifs/Agwo'
import Isi from '@/components/motifs/Isi'
import { formatBudget, formatMoney, symbolFor } from '@/lib/currency'
import { PRODUCT_NAME } from '@/lib/brand'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_CONFIG = {
  open:      { className: 'bg-terracotta-soft text-terracotta', label: 'Open for Bids' },
  hired:     { className: 'bg-verified-bg text-verified',       label: 'Hired'         },
  closed:    { className: 'bg-cream-2 text-ink-3',              label: 'Closed'        },
  cancelled: { className: 'bg-danger-bg text-danger',           label: 'Cancelled'     },
}

export default function JobDetail({ job, bids, myBid, hire, profile, justPosted }) {
  const isHirer    = profile?.id === job.hirer_id
  const isProvider = profile?.role === 'provider' || profile?.role === 'both'
  const isVerified = profile?.is_verified
  const isLoggedIn = !!profile

  const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.open

  return (
    <div>

      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70 text-ink-2"
      >
        <ChevronLeft size={14} strokeWidth={1.5} /> Back to Job Board
      </Link>

      {/* Just posted banner */}
      {justPosted && (
        <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xs mb-5 bg-verified-bg">
          <CheckCircle size={15} strokeWidth={1.5} className="text-verified flex-shrink-0" />
          <p className="text-sm font-medium text-verified">
            Your job has been posted successfully — providers can now bid on it.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── MAIN CONTENT ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Job header card */}
          <div className="bg-surface border border-line rounded-md p-5 sm:p-6">

            {/* Top row — badges + status */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {job.category && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
                    {job.category.name}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 border border-line rounded-xs text-ink-3">
                  {job.event_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-xs ${status.className}`}>
                  {status.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-ink-3">
                  <Clock size={10} strokeWidth={1.5} />
                  {timeAgo(job.created_at)}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="t-h1 mb-4 text-ink">
              {job.title}
            </h1>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                {
                  icon: Calendar,
                  label: 'Event Date',
                  value: new Date(job.event_date).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })
                },
                {
                  icon: MapPin,
                  label: 'Location',
                  value: job.location
                },
                {
                  icon: Wallet,
                  label: 'Budget',
                  value: formatBudget(job.budget_min, job.budget_max, job.currency)
                },
                {
                  icon: Users,
                  label: 'Bids',
                  value: `${job.bids_count} received`
                },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 p-3 border border-line rounded-xs bg-cream"
                >
                  <div className="flex items-center gap-1.5">
                    <item.icon size={12} strokeWidth={1.5} className="text-ink-3" />
                    <span className="text-xs text-ink-3">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Extra details */}
            {(job.headcount || job.duration_hours || job.event_time) && (
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                {job.event_time && (
                  <span className="flex items-center gap-1.5 text-sm text-ink-2">
                    <Clock size={13} strokeWidth={1.5} className="text-ink-3" />
                    Starts at {job.event_time}
                  </span>
                )}
                {job.headcount && (
                  <span className="flex items-center gap-1.5 text-sm text-ink-2">
                    <Users size={13} strokeWidth={1.5} className="text-ink-3" />
                    ~{job.headcount} guests expected
                  </span>
                )}
                {job.duration_hours && (
                  <span className="flex items-center gap-1.5 text-sm text-ink-2">
                    <Clock size={13} strokeWidth={1.5} className="text-ink-3" />
                    {job.duration_hours} hours
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
                <p className="t-micro mb-2 text-ink-3">
                  Job Description
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          {/* ── BID FORM (providers only) ── */}
          {isProvider && job.status === 'open' && !isHirer && (
            <BidForm
              job={job}
              myBid={myBid}
              isVerified={isVerified}
            />
          )}

          {/* ── MESSAGE HIRER (provider who has bid) ── */}
          {isProvider && !isHirer && myBid && (
            <div className="bg-surface border border-line rounded-md p-4 flex items-center justify-between gap-4">
              <div>
                <p className="t-h3 text-ink">
                  Message the hirer
                </p>
                <p className="text-xs mt-0.5 text-ink-2">
                  Discuss the details directly with {job.hirer?.full_name?.split(' ')[0]}
                </p>
              </div>
              <MessageButton
                jobId={job.id}
                hirerId={job.hirer_id}
                providerId={profile.id}
              />
            </div>
          )}

          {/* ── BIDS LIST (hirer only) ── */}
          {isHirer && bids.length > 0 && (
            <BidsList
              bids={bids}
              job={job}
              hire={hire}
            />
          )}

          {/* ── HIRED CONFIRMATION ── */}
          {hire && (
            <div className="flex items-start gap-4 p-5 border border-line rounded-md bg-verified-bg">
              <Isi size={44} className="text-verified flex-shrink-0" />
              <div>
                <p className="t-h3 text-verified">Provider hired</p>
                <p className="text-xs text-verified mt-1 leading-relaxed">
                  This job has been filled. Agree your payment terms in the conversation —
                  {' '}{PRODUCT_NAME} records payments but does not hold or transfer funds.
                </p>
              </div>
            </div>
          )}

          {/* Guest CTA */}
          {!isLoggedIn && (
            <div className="border border-ink rounded-md p-5 text-center bg-ink">
              <p className="text-sm font-semibold text-white mb-1">
                Interested in this job?
              </p>
              <p className="text-xs mb-4 text-ink-3">
                Create a free provider account to place a bid.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2
                           rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
              >
                Sign Up &amp; Bid <ArrowRight size={13} />
              </Link>
            </div>
          )}

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">

          {/* Hirer profile */}
          <div className="bg-surface border border-line rounded-md p-4">
            <p className="t-micro mb-3 text-ink-3">
              Posted By
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm
                              flex-shrink-0 bg-ink rounded-xs">
                {job.hirer?.full_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-ink">
                  {job.hirer?.full_name}
                </div>
                <div className="text-xs capitalize mt-0.5 text-ink-3">
                  {job.hirer?.org_type || 'Hirer'}
                </div>
                {job.hirer?.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} strokeWidth={1.5} className="text-ink-3" />
                    <span className="text-xs text-ink-3">
                      {job.hirer.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hirer stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line">
              <div className="text-center p-2 border border-line rounded-xs bg-cream">
                <div className="text-lg t-money text-ink">
                  {job.hirer?.completed_events || 0}
                </div>
                <div className="text-xs text-ink-3">Events</div>
              </div>
              <div className="text-center p-2 border border-line rounded-xs bg-cream">
                <div className="text-lg t-money text-ink">
                  {job.hirer?.average_rating || '—'}
                </div>
                <div className="text-xs text-ink-3">Avg. Rating</div>
              </div>
            </div>
          </div>

          {/* Job summary */}
          <div className="bg-surface border border-line rounded-md p-4">
            <p className="t-micro mb-3 text-ink-3">
              Summary
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Briefcase, label: 'Service', value: job.category?.name || '—' },
                { icon: Calendar,  label: 'Date',    value: new Date(job.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: MapPin,    label: 'Location', value: job.location },
                { icon: Wallet,label: 'Budget',  value: formatBudget(job.budget_min, job.budget_max, job.currency) },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon size={13} strokeWidth={1.5} className="text-ink-3 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-xs block text-ink-3">{item.label}</span>
                    <span className="text-xs font-medium text-ink-2">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NOTE: the "Manage Job" card previously linked to /jobs/[id]/edit,
              which does not exist and 404s (CLAUDE.md §8 P1). Removed rather than
              shipping a dead link; restore it when the edit route is built along
              with close / cancel / delete. */}

        </div>
      </div>
    </div>
  )
}

// ── Message Button ──
function MessageButton({ jobId, hirerId, providerId }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMessage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/conversations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ job_id: jobId, hirer_id: hirerId, provider_id: providerId }),
      })
      const data = await res.json()
      if (res.ok) router.push(`/messages/${data.conversation.id}`)
    } catch { /* surfaced by the disabled state resetting */ }
    setLoading(false)
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 border border-line rounded-sm
                 text-ink-2 transition-colors hover:bg-cream disabled:opacity-50"
    >
      {loading && <Agwo size={11} className="text-ink-2" />}
      {loading ? 'Opening…' : 'Message'}
    </button>
  )
}

// ── Bid Form ──
function BidForm({ job, myBid, isVerified }) {
  const router = useRouter()
  const [amount, setAmount]   = useState(myBid?.amount?.toString() || '')
  const [pitch, setPitch]     = useState(myBid?.pitch || '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const sym = symbolFor(job.currency)

  const handleSubmit = async () => {
    if (!amount) { setError('Please enter a bid amount'); return }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          amount: parseInt(amount),
          pitch,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setSuccess(true)
      router.refresh()
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  if (!isVerified) {
    return (
      <div className="border border-ochre-soft rounded-md p-5 bg-ochre-soft">
        <div className="flex items-start gap-3">
          <AlertCircle size={15} strokeWidth={1.5} className="text-ochre-text flex-shrink-0 mt-0.5" />
          <div>
            <p className="t-h3 text-ink">
              Verification required to bid
            </p>
            <p className="text-xs mt-0.5 mb-3 text-ink-2">
              Complete your profile verification to place bids on jobs.
            </p>
            <Link
              href="/verification/apply"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 text-white
                         rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
            >
              <Shield size={12} /> Start Verification
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (myBid) {
    return (
      <div className="border border-line rounded-md p-5 bg-cream-2">
        <div className="flex items-start gap-3">
          <CheckCircle size={15} strokeWidth={1.5} className="text-ink-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink">
              Your bid of <span className="t-money">{formatMoney(myBid.amount, job.currency)}</span> has been submitted
            </p>
            <p className="text-xs text-ink-2 mt-0.5">
              Status: <span className="font-medium capitalize">{myBid.status}</span> —
              you&apos;ll be notified when the hirer makes a decision.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="border border-line rounded-md p-5 bg-verified-bg">
        <div className="flex items-start gap-3">
          <CheckCircle size={15} strokeWidth={1.5} className="text-verified flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-verified">Bid submitted successfully!</p>
            <p className="text-xs text-verified mt-0.5">
              The hirer will review your bid and get in touch if interested.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-line rounded-md p-5 sm:p-6">

      <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line">
        <Send size={14} strokeWidth={1.5} className="text-ink-3" />
        <h2 className="t-h3 text-ink">Place Your Bid</h2>
      </div>

      <div className="space-y-4">

        {/* Amount */}
        <div>
          <label className="t-label block mb-1.5 text-ink-2">
            Your Bid Amount <span className="text-terracotta">*</span>
            <span className="font-normal ml-1 text-ink-3">
              — Budget: {formatBudget(job.budget_min, job.budget_max, job.currency)}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-3">
              {sym}
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter your price"
              min="1"
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-line rounded-xs outline-none
                         text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
            />
          </div>
        </div>

        {/* Pitch */}
        <div>
          <label className="t-label block mb-1.5 text-ink-2">
            Your Pitch
            <span className="font-normal ml-1 text-ink-3">
              — Why are you the right fit?
            </span>
          </label>
          <textarea
            value={pitch}
            onChange={e => setPitch(e.target.value)}
            placeholder="Briefly describe your experience, relevant work, and why you'd be a great fit for this event…"
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none resize-none
                       text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs
                          bg-danger-bg text-danger">
            <AlertCircle size={13} strokeWidth={1.5} /> {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white
                     rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-50"
        >
          {loading ? <Agwo size={14} className="text-white" /> : <Send size={14} strokeWidth={2} />}
          {loading ? 'Submitting…' : 'Submit Bid'}
        </button>
      </div>
    </div>
  )
}

// ── Bids List (hirer view) ──
function BidsList({ bids, job, hire }) {
  const router = useRouter()
  const [hiring, setHiring] = useState(null)
  const [error, setError]   = useState(null)
  const [pendingHire, setPendingHire] = useState(null)

  const confirmHire = async () => {
    const bid = pendingHire
    if (!bid) return
    setHiring(bid.id)
    setError(null)

    try {
      const res = await fetch('/api/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bid_id: bid.id, job_id: job.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setHiring(null); setPendingHire(null); return }
      setPendingHire(null)
      router.refresh()
    } catch {
      setError('Network error — please try again')
      setHiring(null)
      setPendingHire(null)
    }
  }

  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">

      <ConfirmModal
        open={!!pendingHire}
        title={`Hire ${pendingHire?.provider?.full_name}?`}
        body={`This accepts their bid of ${formatMoney(pendingHire?.amount, job.currency)} and closes the job to further bids. Other bidders will be notified.`}
        confirmLabel="Confirm hire"
        loading={!!hiring}
        onConfirm={confirmHire}
        onCancel={() => setPendingHire(null)}
      />

      <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
        <div className="flex items-center gap-2">
          <Users size={14} strokeWidth={1.5} className="text-ink-3" />
          <h2 className="t-h3 text-ink">
            Bids Received ({bids.length})
          </h2>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 p-3 border border-line rounded-xs text-xs
                        bg-danger-bg text-danger">
          <AlertCircle size={13} strokeWidth={1.5} /> {error}
        </div>
      )}

      <div>
        {bids.map(bid => (
          <div
            key={bid.id}
            className={`flex items-start gap-4 px-5 py-4 border-b border-line last:border-0 ${
              bid.status === 'accepted' ? 'bg-verified-bg' : 'bg-surface'
            }`}
          >
            {/* Avatar */}
            <div className="w-9 h-9 flex items-center justify-center text-white text-xs font-bold
                            flex-shrink-0 bg-ink rounded-xs">
              {bid.provider?.full_name?.charAt(0) || '?'}
            </div>

            {/* Provider info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-ink">
                  {bid.provider?.full_name}
                </span>
                {bid.provider?.is_verified && <VerifiedBadge />}
                {bid.status === 'accepted' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-xs bg-verified-bg text-verified">
                    Hired
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {bid.provider?.location && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <MapPin size={10} strokeWidth={1.5} /> {bid.provider.location}
                  </span>
                )}
                {bid.provider?.average_rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <Star size={10} strokeWidth={1.5} className="fill-ochre text-ochre" />
                    {bid.provider.average_rating}
                  </span>
                )}
                {bid.provider?.completed_events > 0 && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <Award size={10} strokeWidth={1.5} /> {bid.provider.completed_events} events
                  </span>
                )}
                <span className="text-xs text-ink-3">
                  {timeAgo(bid.created_at)}
                </span>
              </div>

              {bid.pitch && (
                <p className="text-xs leading-relaxed text-ink-2">
                  {bid.pitch}
                </p>
              )}
            </div>

            {/* Amount + actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-base t-money text-ink">
                {formatMoney(bid.amount, job.currency)}
              </span>

              <div className="flex flex-col gap-1.5">
                {job.status === 'open' && bid.status === 'pending' && !hire && (
                  <button
                    onClick={() => setPendingHire(bid)}
                    disabled={hiring === bid.id}
                    className="text-xs font-semibold px-4 py-1.5 text-white rounded-sm bg-terracotta
                               transition-colors hover:bg-terracotta-deep disabled:opacity-50"
                  >
                    {hiring === bid.id ? 'Hiring…' : 'Hire'}
                  </button>
                )}

                <MessageButton
                  jobId={job.id}
                  hirerId={job.hirer_id}
                  providerId={bid.provider_id}
                />

                <Link
                  href={`/providers/${bid.provider_id}`}
                  className="text-xs font-medium text-center text-terracotta hover:text-terracotta-deep"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
