'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, CheckCircle, XCircle, Clock,
  ExternalLink, ChevronDown, ChevronUp
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
    pending:  { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', label: 'Pending'  },
    approved: { bg: '#F0FDF4', border: '#86EFAC', color: '#16A34A', label: 'Approved' },
    rejected: { bg: '#FFF5F5', border: '#FECACA', color: '#DC2626', label: 'Rejected' },
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
        alert(data.error || 'Something went wrong')
      }
    } catch (e) {
      alert('Network error')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center text-white"
              style={{ background: T.navy, borderRadius: 4 }}
            >
              <Shield size={16} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: T.navy }}>Admin Panel</h1>
              <p className="text-xs" style={{ color: T.textLight }}>Welcome, {adminName}</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-white"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
          >
            Back to Dashboard
          </a>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="border p-4 text-center transition-all"
              style={{
                borderColor:  filter === key ? T.coral : T.border,
                background:   filter === key ? T.coralLight : '#fff',
                borderRadius: 4,
              }}
            >
              <div className="text-2xl font-bold"
                style={{ color: filter === key ? T.coral : T.navy }}>
                {count}
              </div>
              <div className="text-xs capitalize mt-0.5" style={{ color: T.textLight }}>
                {key}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div
              className="bg-white border py-16 text-center"
              style={{ borderColor: T.border, borderRadius: 4 }}
            >
              <p className="text-sm" style={{ color: T.textMuted }}>
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
                className="bg-white border overflow-hidden"
                style={{ borderColor: T.border, borderRadius: 4 }}
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: T.navy, borderRadius: 4 }}
                  >
                    {app.provider?.full_name?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: T.navy }}>
                        {app.provider?.full_name}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 border"
                        style={{
                          background:   cfg.bg,
                          borderColor:  cfg.border,
                          color:        cfg.color,
                          borderRadius: 4,
                        }}
                      >
                        <StatusIcon status={app.status} size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{ color: T.textLight }}>
                        {app.provider?.role} · {app.provider?.location}
                      </span>
                      <span className="text-xs" style={{ color: T.textLight }}>
                        Applied {appliedDate}
                      </span>
                    </div>
                  </div>

                  {isExpanded
                    ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: T.textLight }} />
                    : <ChevronDown size={16} strokeWidth={1.5} style={{ color: T.textLight }} />
                  }
                </div>

                {isExpanded && (
                  <div
                    className="border-t px-5 py-5 space-y-4"
                    style={{ borderColor: T.border, background: T.bg }}
                  >
                    {app.provider?.bio && (
                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                          style={{ color: T.textLight }}>Bio</p>
                        <p className="text-sm" style={{ color: T.textMuted }}>
                          {app.provider.bio}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                          style={{ color: T.textLight }}>Government ID</p>
                        {app.government_id_url
                          ? <IDViewer path={app.government_id_url} />
                          : <p className="text-xs" style={{ color: T.textLight }}>Not provided</p>
                        }
                      </div>

                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                          style={{ color: T.textLight }}>Online Presence</p>
                        <div className="space-y-2">
                          {app.website_url && (
                            <a
                              href={app.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
                              style={{ color: T.coral }}
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
                              className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
                              style={{ color: T.coral }}
                            >
                              <ExternalLink size={12} strokeWidth={1.5} />
                              {app.social_media_url}
                            </a>
                          )}
                          {!app.website_url && !app.social_media_url && (
                            <p className="text-xs" style={{ color: T.textLight }}>
                              No links provided
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {app.additional_notes && (
                      <div>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                          style={{ color: T.textLight }}>Provider Notes</p>
                        <p className="text-sm" style={{ color: T.textMuted }}>
                          {app.additional_notes}
                        </p>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                          style={{ color: T.textLight }}>Admin Decision</p>

                        <textarea
                          value={notes[app.id] || ''}
                          onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          placeholder="Optional note to provider (recommended if rejecting)"
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm border outline-none resize-none mb-3"
                          style={{
                            borderColor: T.border,
                            borderRadius: 4,
                            color:        T.navy,
                            background:   '#fff',
                          }}
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(app.id, app.provider_id, 'approved')}
                            disabled={loadApprove}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ background: '#16A34A', borderRadius: 4 }}
                          >
                            <CheckCircle size={14} strokeWidth={2} />
                            {loadApprove ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, app.provider_id, 'rejected')}
                            disabled={loadReject}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ background: '#DC2626', borderRadius: 4 }}
                          >
                            <XCircle size={14} strokeWidth={2} />
                            {loadReject ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}

                    {app.status !== 'pending' && app.admin_notes && (
                      <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                        <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                          style={{ color: T.textLight }}>Admin Note</p>
                        <p className="text-sm" style={{ color: T.textMuted }}>
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
      className="flex items-center gap-2 text-xs font-medium px-3 py-2 border transition-colors hover:bg-white disabled:opacity-50"
      style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
    >
      <ExternalLink size={12} strokeWidth={1.5} />
      {loading ? 'Loading...' : 'View ID Document'}
    </button>
  )
}