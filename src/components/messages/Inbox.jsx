'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import Onuuzo from '@/components/motifs/Onuuzo'

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
        <h1 className="t-h1 text-ink">Messages</h1>
        <p className="text-sm mt-0.5 text-ink-2">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation list */}
      <div className="bg-surface border border-line rounded-xs overflow-hidden">

        {conversations.length === 0 ? (
          <div className="py-20 text-center">
            {/* Ọnụ ụzọ — the threshold. Nothing has come through yet. */}
            <Onuuzo size={96} className="text-terracotta mx-auto mb-4 opacity-70" />
            <p className="text-sm font-medium text-ink-2">
              No messages yet
            </p>
            <p className="text-xs mt-1 text-ink-3">
              Conversations start when a hirer reaches out after reviewing a bid
            </p>
          </div>
        ) : (
          conversations.map((convo) => {
            const isHirer   = convo.hirer_id === userId
            const otherUser = isHirer ? convo.provider : convo.hirer
            const unread    = isHirer ? convo.hirer_unread : convo.provider_unread

            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-start gap-4 px-5 py-4 border-b border-line last:border-0 hover:bg-cream transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-ink rounded-xs">
                  {otherUser?.full_name?.charAt(0) || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate text-ink">
                      {otherUser?.full_name}
                    </span>
                    <span className="text-xs flex-shrink-0 text-ink-3">
                      {timeAgo(convo.last_message_at)}
                    </span>
                  </div>

                  {/* Job reference */}
                  {convo.job && (
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase size={10} strokeWidth={1.5} className="text-ink-3" />
                      <span className="text-xs truncate text-ink-3">
                        {convo.job.title}
                      </span>
                    </div>
                  )}

                  {/* Last message */}
                  <p className="text-xs truncate text-ink-2">
                    {convo.last_message || 'No messages yet — start the conversation'}
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-terracotta rounded-full">
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
