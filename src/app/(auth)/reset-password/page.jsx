'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, CheckCircle, KeyRound, ShieldCheck, Lock } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import Agwo from '@/components/motifs/Agwo'
import Isi from '@/components/motifs/Isi'
import Nku from '@/components/motifs/Nku'

const POINTS = [
  { icon: Lock,        title: 'Pick something new',  desc: 'At least 6 characters.' },
  { icon: KeyRound,    title: 'Signs you straight in', desc: 'No second login needed.' },
  { icon: ShieldCheck, title: 'Other sessions stay',  desc: 'Sign out elsewhere from Settings.' },
]

export default function ResetPasswordPage() {
  const supabase = createClient()

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [done, setDone]           = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError(null)

    // The recovery link puts the browser in a recovery session, so updateUser
    // is enough to set the new password.
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      headline="Set a new password."
      points={POINTS}
      motif={
        <Nku
          size={420}
          className="motif-float2 absolute -left-20 bottom-0 text-sand opacity-30"
          style={{ '--fd': '25s' }}
        />
      }
    >
      <div className="bg-surface border border-line rounded-md p-8">

        {done ? (
          <div className="text-center">
            <Isi size={56} className="text-verified mx-auto mb-4" />
            <h1 className="t-h1 text-ink">Password updated</h1>
            <p className="text-sm text-ink-2 mt-2 mb-6">
              You&apos;re signed in with your new password.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full bg-terracotta text-white py-2.5
                         rounded-sm font-semibold text-sm transition-colors hover:bg-terracotta-deep"
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="t-h1 text-ink">New password</h1>
              <p className="text-sm mt-1 text-ink-2">Choose something you haven&apos;t used here before.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 p-3 border border-line rounded-xs
                              bg-danger-bg text-danger text-sm">
                <AlertCircle size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="t-label block mb-1.5 text-ink-2">New password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2.5 pr-10 border border-line rounded-xs text-sm text-ink
                               placeholder:text-ink-3 outline-none focus:border-terracotta transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="t-label block mb-1.5 text-ink-2">Confirm password</label>
                <input
                  id="confirm"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2.5 border border-line rounded-xs text-sm text-ink
                             placeholder:text-ink-3 outline-none focus:border-terracotta transition-colors"
                />
                {confirm && password === confirm && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5 text-verified">
                    <CheckCircle size={12} strokeWidth={2} /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white py-2.5
                           rounded-sm font-semibold text-sm transition-colors hover:bg-terracotta-deep
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Agwo size={14} className="text-white" />}
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}

      </div>
    </AuthShell>
  )
}
