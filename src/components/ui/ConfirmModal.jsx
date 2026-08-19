'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Replaces native confirm() for high-stakes actions. Native dialogs are
 * blocking and unstyleable, and hiring is the highest-stakes action in the
 * product (CLAUDE.md §8 P2).
 */
export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(43,33,24,0.45)' }}
      onClick={() => { if (!loading) onCancel() }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-surface border border-line rounded-md p-5 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xs
                          bg-terracotta-soft text-terracotta">
            <AlertCircle size={15} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="t-h3 text-ink">{title}</h2>
            {body && <p className="text-xs mt-1 leading-relaxed text-ink-2">{body}</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-line rounded-sm text-ink-2
                       transition-colors hover:bg-cream disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white rounded-sm bg-terracotta
                       transition-colors hover:bg-terracotta-deep disabled:opacity-50"
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
