'use client'

import Link from 'next/link'
import { MessageSquare, Clock, Briefcase } from 'lucide-react'

const T = {
  navy:      '#0F172A',
  navyMid:   '#1E293B',
  coral:     '#E8523A',
  coralLight:'#FEF0ED',
  border:    '#E2E8F0',
  bg:        '#F8FAFC',
  textMuted: '#64748B',
  textLight: '#94A3B8',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Inbox({ conversations, currentUser }) {
  const userId = currentUser?.id

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation list */}
      <div className="bg-white border overflow-hidden"
        style={{ borderColor: T.border, borderRadius: 4 }}>

        {conversations.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare size={32} strokeWidth={1}
              style={{ color: T.textLight, margin: '0 auto 12px' }} />
            <p className="text-sm font-medium" style={{ color: T.textMuted }}>
              No messages yet
            </p>
            <p className="text-xs mt-1" style={{ color: T.textLight }}>
              Conversations start when a hirer reaches out after reviewing a bid
            </p>
          </div>
        ) : (
          conversations.map((convo, i) => {
            const isHirer   = convo.hirer_id === userId
            const otherUser = isHirer ? convo.provider : convo.hirer
            const unread    = isHirer ? convo.hirer_unread : convo.provider_unread

            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-start gap-4 px-5 py-4 border-b last:border-0 hover:bg-slate-50 transition-colors"
                style={{ borderColor: T.border }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: T.navy, borderRadius: 4 }}
                >
                  {otherUser?.full_name?.charAt(0) || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: T.navy }}>
                      {otherUser?.full_name}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: T.textLight }}>
                      {timeAgo(convo.last_message_at)}
                    </span>
                  </div>

                  {/* Job reference */}
                  {convo.job && (
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                      <span className="text-xs truncate" style={{ color: T.textLight }}>
                        {convo.job.title}
                      </span>
                    </div>
                  )}

                  {/* Last message */}
                  <p className="text-xs truncate" style={{ color: T.textMuted }}>
                    {convo.last_message || 'No messages yet — start the conversation'}
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <div
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: T.coral, borderRadius: '50%' }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </div>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}