'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Send } from 'lucide-react'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDate(dateStr) {
  const date      = new Date(dateStr)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString())     return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function Conversation({ conversation, initialMessages, currentUser }) {
  const supabase = createClient()
  const userId   = currentUser?.id

  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [sendError, setSendError] = useState(null)
  const bottomRef = useRef(null)

  // Track real message IDs to avoid realtime duplicates
  const seenIds = useRef(new Set(initialMessages.map(m => m.id)))

  const isHirer   = conversation.hirer_id === userId
  const otherUser = isHirer ? conversation.provider : conversation.hirer

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription — listens for new messages from the OTHER person
  useEffect(() => {
    const channel = supabase
      .channel(`room-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newId = payload.new.id

          // Skip messages we already added ourselves
          if (seenIds.current.has(newId)) return

          // Skip messages sent by the current user entirely —
          // we already add those via the API response in handleSend
          if (payload.new.sender_id === userId) return

          seenIds.current.add(newId)

          // For messages from the other person — add with basic sender info
          const incomingMessage = {
            ...payload.new,
            sender: payload.new.sender_id === otherUser?.id ? otherUser : currentUser,
          }

          setMessages(prev => [...prev, incomingMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, userId])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return

    // Clear input immediately for good UX
    setInput('')
    setSending(true)
    setSendError(null)

    try {
      const res = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          conversation_id: conversation.id,
          content,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Restore input so user doesn't lose their message
        setInput(content)
        setSendError(data.error || 'Failed to send')
      } else {
        // Add the confirmed message to state immediately
        const confirmedMessage = {
          ...data.message,
          sender: currentUser,
        }
        // Mark as seen so realtime doesn't duplicate it
        seenIds.current.add(confirmedMessage.id)
        setMessages(prev => [...prev, confirmedMessage])
      }
    } catch {
      // Network error — restore input
      setInput(content)
      setSendError('Network error — please try again')
    } finally {
      // Always unlock sending
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>

      {/* Header */}
      <div className="bg-surface border border-line rounded-t-xs flex items-center gap-4 px-4 py-3 flex-shrink-0">
        <Link
          href="/messages"
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70 text-ink-2"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>

        <div className="w-8 h-8 flex items-center justify-center text-white font-bold text-xs
                        flex-shrink-0 bg-ink rounded-xs">
          {otherUser?.full_name?.charAt(0) || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink">
              {otherUser?.full_name}
            </span>
            {otherUser?.is_verified && <VerifiedBadge />}
          </div>
          {conversation.job && (
            <p className="text-xs truncate text-ink-3">
              Re: {conversation.job.title}
            </p>
          )}
        </div>

        {conversation.job && (
          <Link
            href={`/jobs/${conversation.job.id}`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-line
                       rounded-sm text-ink-2 transition-colors hover:bg-cream flex-shrink-0"
          >
            View Job
          </Link>
        )}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 border-x border-line bg-cream-2"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10px 1px, rgba(255,255,255,0.6) 1px, transparent 0.5),
            radial-gradient(circle at 10px 1px, rgba(255,255,255,0.3) 1px, transparent 0.5)
          `,
          backgroundSize:     '24px 24px, 12px 12px',
          backgroundPosition: '0 0, 6px 6px',
        }}
      >

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-line" />
              <span className="text-xs font-medium px-2 text-ink-3">
                {date}
              </span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <div className="space-y-3">
              {msgs.map(msg => {
                const isMine = msg.sender_id === userId
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isMine && (
                      <div className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold
                                      flex-shrink-0 mb-1 bg-ink rounded-xs">
                        {msg.sender?.full_name?.charAt(0) || '?'}
                      </div>
                    )}

                    <div className={`max-w-xs sm:max-w-sm flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'bg-ink text-white'
                            : 'bg-surface text-ink-2 border border-line'
                        }`}
                        style={{
                          borderRadius: isMine ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                        }}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs mt-1 text-ink-3">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Error message */}
      {sendError && (
        <div className="px-4 py-2 text-xs border-x border-line bg-danger-bg text-danger">
          {sendError} —{' '}
          <button
            onClick={() => setSendError(null)}
            className="underline"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-surface border border-line rounded-b-xs flex items-end gap-3 px-4 py-3 flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 px-3 py-2 text-sm border border-line rounded-xs outline-none resize-none text-ink
                     placeholder:text-ink-3 focus:border-terracotta transition-colors"
          style={{ maxHeight: 120 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 text-white rounded-sm
                     bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-40"
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </div>

    </div>
  )
}
