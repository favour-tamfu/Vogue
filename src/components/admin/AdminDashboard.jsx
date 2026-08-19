'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle, XCircle, Clock,
  ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react'
import Logo from '@/components/brand/Logo'

// Move ALL formatting logic outside JSX to avoid parser issues
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusConfig(status) {
  const configs = {
    pending:  { className: 'bg-ochre-soft text-ochre-text border-ochre-soft', label: 'Pending'  },
    approved: { className: 'bg-verified-bg text-verified border-verified-bg', label: 'Approved' },
    rejected: { className: 'bg-danger-bg text-danger border-danger-bg',       label: 'Rejected' },
  }
  return configs[status] || configs.pending
}

function StatusIcon({ status, size }) {
  if (status === 'approved') return <CheckCircle size={size} strokeWidth={2} />
  if (status === 'rejected') return <XCircle size={size} strokeWidth={2} />
  return <Clock size={size} strokeWidth={2} />
}

export default function AdminDashboard({ applications, adminName }) {
  const router = useRouter()
  const [filter, setFilter]     = useState('pending')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading]   = useState(null)
  const [notes, setNotes]       = useState({})
  const [actionError, setActionError] = useState(null)

  const filtered = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const handleDecision = async (appId, providerId, decision) => {
    setLoading(appId + '-' + decision)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: appId,
          provider_id:    providerId,
          decision:       decision,
          admin_notes:    notes[appId] || '',
        }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setActionError(data.error || 'Something went wrong')
      }
    } catch {
      setActionError('Network error — please try again')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div className="pl-3 border-l border-line">
              <h1 className="t-h2 text-ink">Admin Panel</h1>
              <p className="text-xs text-ink-3">Welcome, {adminName}</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="text-xs font-medium px-3 py-1.5 border border-line rounded-sm text-ink-2
                       transition-colors hover:bg-surface"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`border rounded-xs p-4 text-center transition-all ${
                filter === key
                  ? 'border-terracotta bg-terracotta-soft'
                  : 'border-line bg-surface'
              }`}
            >
              <div className={`text-2xl t-money ${
                filter === key ? 'text-terracotta' : 'text-ink'
              }`}>
                {count}
              </div>
              <div className="text-xs capitalize mt-0.5 text-ink-3">
                {key}
              </div>
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mb-4 flex items-center gap-2 p-3 border border-line rounded-xs text-xs bg-danger-bg text-danger">
            <XCircle size={13} strokeWidth={1.5} /> {actionError}
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-surface border border-line rounded-md py-16 text-center">
              <p className="text-sm text-ink-2">
                No {filter} applications
              </p>
            </div>
          )}

          {filtered.map(app => {
            const cfg        = getStatusConfig(app.status)
            const isExpanded = expanded === app.id
            const loadApprove = loading === app.id + '-approved'
            const loadReject  = loading === app.id + '-rejected'
            const appliedDate = formatDate(app.created_at)

            return (
              <div
                key={app.id}
                className="bg-surface border border-line rounded-md overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-cream transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                >
                  <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm
                                  flex-shrink-0 bg-ink rounded-xs">
                    {app.provider?.full_name?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink">
                        {app.provider?.full_name}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5
                                        border rounded-xs ${cfg.className}`}>
                        <StatusIcon status={app.status} size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-ink-3">
                        {app.provider?.role} · {app.provider?.location}
                      </span>
                      <span className="text-xs text-ink-3">
                        Applied {appliedDate}
                      </span>
                    </div>
                  </div>

                  {isExpanded
                    ? <ChevronUp size={16} strokeWidth={1.5} className="text-ink-3" />
                    : <ChevronDown size={16} strokeWidth={1.5} className="text-ink-3" />
                  }
                </div>

                {isExpanded && (
                  <div className="border-t border-line px-5 py-5 space-y-4 bg-cream">
                    {app.provider?.bio && (
                      <div>
                        <p className="t-micro mb-1 text-ink-3">Bio</p>
                        <p className="text-sm text-ink-2">
                          {app.provider.bio}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="t-micro mb-2 text-ink-3">Government ID</p>
                        {app.government_id_url
                          ? <IDViewer path={app.government_id_url} />
                          : <p className="text-xs text-ink-3">Not provided</p>
                        }
                      </div>

                      <div>
                        <p className="t-micro mb-2 text-ink-3">Online Presence</p>
                        <div className="space-y-2">
                          {app.website_url && (
                            <a
                              href={app.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-terracotta hover:text-terracotta-deep"
                            >
                              <ExternalLink size={12} strokeWidth={1.5} />
                              {app.website_url}
                            </a>
                          )}
                          {app.social_media_url && (
                            <a
                              href={app.social_media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-terracotta hover:text-terracotta-deep"
                            >
                              <ExternalLink size={12} strokeWidth={1.5} />
                              {app.social_media_url}
                            </a>
                          )}
                          {!app.website_url && !app.social_media_url && (
                            <p className="text-xs text-ink-3">
                              No links provided
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {app.additional_notes && (
                      <div>
                        <p className="t-micro mb-1 text-ink-3">Provider Notes</p>
                        <p className="text-sm text-ink-2">
                          {app.additional_notes}
                        </p>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className="pt-4 border-t border-line">
                        <p className="t-micro mb-3 text-ink-3">Admin Decision</p>

                        <textarea
                          value={notes[app.id] || ''}
                          onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          placeholder="Optional note to provider (recommended if rejecting)"
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none
                                     resize-none mb-3 bg-surface text-ink placeholder:text-ink-3
                                     focus:border-terracotta transition-colors"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(app.id, app.provider_id, 'approved')}
                            disabled={loadApprove}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
                                       rounded-sm bg-verified transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <CheckCircle size={14} strokeWidth={2} />
                            {loadApprove ? 'Approving…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, app.provider_id, 'rejected')}
                            disabled={loadReject}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
                                       rounded-sm bg-danger transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <XCircle size={14} strokeWidth={2} />
                            {loadReject ? 'Rejecting…' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}

                    {app.status !== 'pending' && app.admin_notes && (
                      <div className="pt-4 border-t border-line">
                        <p className="t-micro mb-1 text-ink-3">Admin Note</p>
                        <p className="text-sm text-ink-2">
                          {app.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IDViewer({ path }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const viewDoc = async () => {
    setLoading(true)
    const { data } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={viewDoc}
      disabled={loading}
      className="flex items-center gap-2 text-xs font-medium px-3 py-2 border border-line rounded-sm
                 text-ink-2 transition-colors hover:bg-surface disabled:opacity-50"
    >
      <ExternalLink size={12} strokeWidth={1.5} />
      {loading ? 'Loading…' : 'View ID Document'}
    </button>
  )
}
