'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Calendar, DollarSign, Users, Clock,
  ChevronLeft, CheckCircle, Star, Shield,
  AlertCircle, Send, ArrowRight, Briefcase,
  User, Award, MessageSquare
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

function formatBudget(min, max, currency) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦',
    GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
    XAF: 'FCFA', XOF: 'CFA', CAD: 'CA$', AUD: 'A$'
  }
  const sym = symbols[currency] || (currency || '$')
  if (min) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  return `Up to ${sym}${Number(max).toLocaleString()}`
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

export default function JobDetail({ job, bids, myBid, hire, profile, justPosted }) {
  const router = useRouter()
  const isHirer    = profile?.id === job.hirer_id
  const isProvider = profile?.role === 'provider' || profile?.role === 'both'
  const isVerified = profile?.is_verified
  const isLoggedIn = !!profile

  const statusColors = {
    open:      { bg: '#F0FDF4', color: '#16A34A', label: 'Open for Bids' },
    hired:     { bg: '#EFF6FF', color: '#2563EB', label: 'Hired'         },
    closed:    { bg: T.bg,      color: T.textLight, label: 'Closed'      },
    cancelled: { bg: '#FFF5F5', color: '#DC2626',  label: 'Cancelled'    },
  }
  const status = statusColors[job.status] || statusColors.open

  return (
    <div>

      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: T.textMuted }}
      >
        <ChevronLeft size={14} strokeWidth={1.5} /> Back to Job Board
      </Link>

      {/* Just posted banner */}
      {justPosted && (
        <div
          className="flex items-center gap-3 px-4 py-3 border mb-5"
          style={{ background: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 4 }}
        >
          <CheckCircle size={15} strokeWidth={1.5} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Your job has been posted successfully — providers can now bid on it.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── MAIN CONTENT ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Job header card */}
          <div className="bg-white border p-5 sm:p-6"
            style={{ borderColor: T.border, borderRadius: 4 }}>

            {/* Top row — badges + status */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {job.category && (
                  <span className="text-xs font-medium px-2 py-0.5"
                    style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                    {job.category.name}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 border"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.textLight }}>
                  {job.event_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1"
                  style={{ background: status.bg, color: status.color, borderRadius: 4 }}
                >
                  {status.label}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                  <Clock size={10} strokeWidth={1.5} />
                  {timeAgo(job.created_at)}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold mb-4" style={{ color: T.navy }}>
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
                  icon: DollarSign,
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
                  className="flex flex-col gap-1 p-3 border"
                  style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
                >
                  <div className="flex items-center gap-1.5">
                    <item.icon size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
                    <span className="text-xs" style={{ color: T.textLight }}>{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.navy }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Extra details */}
            {(job.headcount || job.duration_hours || job.event_time) && (
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                {job.event_time && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: T.textMuted }}>
                    <Clock size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
                    Starts at {job.event_time}
                  </span>
                )}
                {job.headcount && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: T.textMuted }}>
                    <Users size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
                    ~{job.headcount} guests expected
                  </span>
                )}
                {job.duration_hours && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: T.textMuted }}>
                    <Clock size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
                    {job.duration_hours} hours
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: T.textLight }}>
                  Job Description
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: T.textMuted }}>
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
            <div
                className="bg-white border p-4 flex items-center justify-between gap-4"
                style={{ borderColor: T.border, borderRadius: 4 }}
                >
                <div>
                <p className="text-sm font-semibold" style={{ color: T.navy }}>
                    Message the hirer
                </p>
                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
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
            <div
              className="flex items-start gap-3 p-4 border"
              style={{ background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}
            >
              <CheckCircle size={16} strokeWidth={1.5} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Provider hired</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  This job has been filled. Payment and final details should be coordinated directly.
                </p>
              </div>
            </div>
          )}

          {/* Guest CTA */}
          {!isLoggedIn && (
            <div
              className="border p-5 text-center"
              style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}
            >
              <p className="text-sm font-semibold text-white mb-1">
                Interested in this job?
              </p>
              <p className="text-xs mb-4" style={{ color: T.textLight }}>
                Create a free provider account to place a bid.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2"
                style={{ background: T.coral, borderRadius: 4 }}
              >
                Sign Up & Bid <ArrowRight size={13} />
              </Link>
            </div>
          )}

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">

          {/* Hirer profile */}
          <div className="bg-white border p-4"
            style={{ borderColor: T.border, borderRadius: 4 }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: T.textLight }}>
              Posted By
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: T.navy, borderRadius: 4 }}
              >
                {job.hirer?.full_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: T.navy }}>
                  {job.hirer?.full_name}
                </div>
                <div className="text-xs capitalize mt-0.5" style={{ color: T.textLight }}>
                  {job.hirer?.org_type || 'Hirer'}
                </div>
                {job.hirer?.location && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                    <span className="text-xs" style={{ color: T.textLight }}>
                      {job.hirer.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hirer stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t"
              style={{ borderColor: T.border }}>
              <div className="text-center p-2 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <div className="text-lg font-bold" style={{ color: T.navy }}>
                  {job.hirer?.completed_events || 0}
                </div>
                <div className="text-xs" style={{ color: T.textLight }}>Events</div>
              </div>
              <div className="text-center p-2 border"
                style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <div className="text-lg font-bold" style={{ color: T.navy }}>
                  {job.hirer?.average_rating || '—'}
                </div>
                <div className="text-xs" style={{ color: T.textLight }}>Avg. Rating</div>
              </div>
            </div>
          </div>

          {/* Job summary */}
          <div className="bg-white border p-4"
            style={{ borderColor: T.border, borderRadius: 4 }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: T.textLight }}>
              Summary
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Briefcase, label: 'Service', value: job.category?.name || '—' },
                { icon: Calendar,  label: 'Date',    value: new Date(job.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: MapPin,    label: 'Location', value: job.location },
                { icon: DollarSign,label: 'Budget',  value: formatBudget(job.budget_min, job.budget_max, job.currency) },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon size={13} strokeWidth={1.5} style={{ color: T.textLight, flexShrink: 0, marginTop: 1 }} />
                  <div className="min-w-0">
                    <span className="text-xs block" style={{ color: T.textLight }}>{item.label}</span>
                    <span className="text-xs font-medium" style={{ color: T.navyMid }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share / other actions */}
          {isHirer && (
            <div className="bg-white border p-4"
              style={{ borderColor: T.border, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: T.textLight }}>
                Manage Job
              </p>
              <div className="space-y-2">
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="w-full flex items-center justify-center text-xs font-medium py-2 border transition-colors hover:bg-slate-50"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                >
                  Edit Job
                </Link>
              </div>
            </div>
          )}

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
    } catch { }
    setLoading(false)
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="text-xs font-medium px-4 py-1.5 border transition-colors hover:bg-slate-50 disabled:opacity-50"
      style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
    >
      {loading ? '...' : 'Message'}
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

  const symbols = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦',
    GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
    XAF: 'FCFA', XOF: 'CFA', CAD: 'CA$', AUD: 'A$'
  }
  const sym = symbols[job.currency] || '$'

  if (!isVerified) {
    return (
      <div
        className="border p-5"
        style={{ borderColor: '#FDE68A', background: '#FFFBEB', borderRadius: 4 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={15} strokeWidth={1.5} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: T.navy }}>
              Verification required to bid
            </p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: T.textMuted }}>
              Complete your profile verification to place bids on jobs.
            </p>
            <Link
              href="/verification/apply"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 text-white"
              style={{ background: T.coral, borderRadius: 4 }}
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
      <div
        className="border p-5"
        style={{ borderColor: '#BFDBFE', background: '#EFF6FF', borderRadius: 4 }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle size={15} strokeWidth={1.5} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Your bid of {sym}{Number(myBid.amount).toLocaleString()} has been submitted
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Status: <span className="font-medium capitalize">{myBid.status}</span> — 
              you'll be notified when the hirer makes a decision.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div
        className="border p-5"
        style={{ borderColor: '#86EFAC', background: '#F0FDF4', borderRadius: 4 }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle size={15} strokeWidth={1.5} className="text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Bid submitted successfully!</p>
            <p className="text-xs text-green-700 mt-0.5">
              The hirer will review your bid and get in touch if interested.
            </p>
          </div>
        </div>
      </div>
    )
  }

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

  return (
    <div className="bg-white border p-5 sm:p-6"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <div className="flex items-center gap-2 pb-4 mb-5 border-b"
        style={{ borderColor: T.border }}>
        <Send size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
        <h2 className="text-sm font-semibold" style={{ color: T.navy }}>Place Your Bid</h2>
      </div>

      <div className="space-y-4">

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
            Your Bid Amount <span style={{ color: T.coral }}>*</span>
            <span className="font-normal ml-1" style={{ color: T.textLight }}>
              — Budget: {formatBudget(job.budget_min, job.budget_max, job.currency)}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
              style={{ color: T.textLight }}>
              {sym}
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter your price"
              min="1"
              className="w-full pl-8 pr-3 py-2.5 text-sm border outline-none"
              style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
              onFocus={e => e.target.style.borderColor = T.navy}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>

        {/* Pitch */}
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
            Your Pitch
            <span className="font-normal ml-1" style={{ color: T.textLight }}>
              — Why are you the right fit?
            </span>
          </label>
          <textarea
            value={pitch}
            onChange={e => setPitch(e.target.value)}
            placeholder="Briefly describe your experience, relevant work, and why you'd be a great fit for this event..."
            rows={4}
            className="w-full px-3 py-2.5 text-sm border outline-none resize-none"
            style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
            onFocus={e => e.target.style.borderColor = T.navy}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 border text-xs"
            style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}
          >
            <AlertCircle size={13} strokeWidth={1.5} /> {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          <Send size={14} strokeWidth={2} />
          {loading ? 'Submitting...' : 'Submit Bid'}
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

  const handleHire = async (bid) => {
    if (!confirm(`Hire ${bid.provider.full_name} for this job?`)) return
    setHiring(bid.id)
    setError(null)

    try {
      const res = await fetch('/api/hires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bid_id: bid.id, job_id: job.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setHiring(null); return }
      router.refresh()
    } catch {
      setError('Network error — please try again')
      setHiring(null)
    }
  }

  const symbols = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦',
    GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
    XAF: 'FCFA', XOF: 'CFA', CAD: 'CA$', AUD: 'A$'
  }
  const sym = symbols[job.currency] || '$'

  return (
    <div className="bg-white border overflow-hidden"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <div className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: T.border }}>
        <div className="flex items-center gap-2">
          <Users size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
          <h2 className="text-sm font-semibold" style={{ color: T.navy }}>
            Bids Received ({bids.length})
          </h2>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 p-3 border text-xs"
          style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}>
          <AlertCircle size={13} strokeWidth={1.5} /> {error}
        </div>
      )}

      <div>
        {bids.map((bid, i) => (
          <div
            key={bid.id}
            className="flex items-start gap-4 px-5 py-4 border-b last:border-0"
            style={{
              borderColor: T.border,
              background: bid.status === 'accepted' ? '#F0FDF4' : '#fff',
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: T.navy, borderRadius: 4 }}
            >
              {bid.provider?.full_name?.charAt(0) || '?'}
            </div>

            {/* Provider info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold" style={{ color: T.navy }}>
                  {bid.provider?.full_name}
                </span>
                {bid.provider?.is_verified && (
                  <span className="flex items-center gap-1 text-xs text-blue-600">
                    <CheckCircle size={11} strokeWidth={1.5} /> Verified
                  </span>
                )}
                {bid.status === 'accepted' && (
                  <span className="text-xs font-semibold px-2 py-0.5 text-green-700"
                    style={{ background: '#DCFCE7', borderRadius: 4 }}>
                    Hired
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {bid.provider?.location && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                    <MapPin size={10} strokeWidth={1.5} /> {bid.provider.location}
                  </span>
                )}
                {bid.provider?.average_rating > 0 && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                    <Star size={10} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                    {bid.provider.average_rating}
                  </span>
                )}
                {bid.provider?.completed_events > 0 && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: T.textLight }}>
                    <Award size={10} strokeWidth={1.5} /> {bid.provider.completed_events} events
                  </span>
                )}
                <span className="text-xs" style={{ color: T.textLight }}>
                  {timeAgo(bid.created_at)}
                </span>
              </div>

              {bid.pitch && (
                <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>
                  {bid.pitch}
                </p>
              )}
            </div>

            {/* Amount + actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-base font-bold" style={{ color: T.navy }}>
                {sym}{Number(bid.amount).toLocaleString()}
              </span>

              <div className="flex flex-col gap-1.5">
                {job.status === 'open' && bid.status === 'pending' && !hire && (
                  <button
                    onClick={() => handleHire(bid)}
                    disabled={hiring === bid.id}
                    className="text-xs font-semibold px-4 py-1.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: T.coral, borderRadius: 4 }}
                  >
                    {hiring === bid.id ? 'Hiring...' : 'Hire'}
                  </button>
                )}

                <MessageButton
                  jobId={job.id}
                  hirerId={job.hirer_id}
                  providerId={bid.provider_id}
                />

                <Link
                  href={`/providers/${bid.provider_id}`}
                  className="text-xs font-medium text-center transition-opacity hover:opacity-70"
                  style={{ color: T.coral }}
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