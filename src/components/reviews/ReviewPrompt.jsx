'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle, X } from 'lucide-react'

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
                ? 'fill-ochre text-ochre'
                : 'text-line'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm font-medium ml-2 text-ink-2">
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
      <div className="border border-line rounded-xs p-4 flex items-center gap-3 bg-verified-bg">
        <CheckCircle size={16} strokeWidth={1.5} className="text-verified flex-shrink-0" />
        <p className="text-sm font-medium text-verified">
          Review submitted — thank you for your feedback!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-line rounded-md p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
              Review Pending
            </span>
          </div>
          <h3 className="t-h3 text-ink">
            How was your experience with {otherPartyName}?
          </h3>
          <p className="text-xs mt-0.5 text-ink-3">
            Re: {jobTitle}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 transition-opacity hover:opacity-70 text-ink-3"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Star rating */}
      <div className="mb-4">
        <p className="t-label mb-2 text-ink-2">
          Rating <span className="text-terracotta">*</span>
        </p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="t-label block mb-1.5 text-ink-2">
          Comment
          <span className="font-normal ml-1 text-ink-3">— Optional</span>
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
          className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none resize-none text-ink
                     placeholder:text-ink-3 focus:border-terracotta transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs mb-4 bg-danger-bg text-danger">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-sm bg-terracotta
                     transition-colors hover:bg-terracotta-deep disabled:opacity-50"
        >
          <Star size={14} strokeWidth={2} />
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-sm font-medium border border-line rounded-sm text-ink-2 transition-colors hover:bg-cream"
          >
            Later
          </button>
        )}
      </div>
    </div>
  )
}
