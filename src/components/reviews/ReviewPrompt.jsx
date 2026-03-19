'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle, X } from 'lucide-react'

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

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            strokeWidth={1.5}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm font-medium ml-2" style={{ color: T.textMuted }}>
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

export default function ReviewPrompt({ hire, reviewerRole, otherPartyName, jobTitle, onDismiss }) {
  const router  = useRouter()
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          hire_id:       hire.id,
          rating,
          comment,
          reviewer_role: reviewerRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      setDone(true)
      router.refresh()
    } catch {
      setError('Network error — please try again')
    }

    setLoading(false)
  }

  if (done) {
    return (
      <div
        className="border p-4 flex items-center gap-3"
        style={{ background: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 4 }}
      >
        <CheckCircle size={16} strokeWidth={1.5} className="text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium text-green-800">
          Review submitted — thank you for your feedback!
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-white border p-5"
      style={{ borderColor: T.border, borderRadius: 4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5"
              style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}
            >
              Review Pending
            </span>
          </div>
          <h3 className="text-sm font-semibold" style={{ color: T.navy }}>
            How was your experience with {otherPartyName}?
          </h3>
          <p className="text-xs mt-0.5" style={{ color: T.textLight }}>
            Re: {jobTitle}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 transition-opacity hover:opacity-70"
          >
            <X size={16} strokeWidth={1.5} style={{ color: T.textLight }} />
          </button>
        )}
      </div>

      {/* Star rating */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2" style={{ color: T.navyMid }}>
          Rating <span style={{ color: T.coral }}>*</span>
        </p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
          Comment
          <span className="font-normal ml-1" style={{ color: T.textLight }}>— Optional</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={
            reviewerRole === 'hirer'
              ? 'How was the quality of work, professionalism, and punctuality?'
              : 'How was the communication, clarity of brief, and payment reliability?'
          }
          rows={3}
          className="w-full px-3 py-2.5 text-sm border outline-none resize-none"
          style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
          onFocus={e => e.target.style.borderColor = T.navy}
          onBlur={e => e.target.style.borderColor = T.border}
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 border text-xs mb-4"
          style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          <Star size={14} strokeWidth={2} />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-sm font-medium border transition-colors hover:bg-slate-50"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
          >
            Later
          </button>
        )}
      </div>
    </div>
  )
}