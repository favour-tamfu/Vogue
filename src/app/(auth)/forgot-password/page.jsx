'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AlertCircle, Mail, ArrowLeft, KeyRound, ShieldCheck, Clock } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import Agwo from '@/components/motifs/Agwo'
import MotifCycle from '@/components/motifs/MotifCycle'
import { SWEEP } from '@/components/motifs'

const POINTS = [
  { icon: KeyRound,    title: 'One-time link',      desc: 'Sent straight to your inbox.' },
  { icon: Clock,       title: 'Expires quickly',    desc: 'Reset links are short-lived by design.' },
  { icon: ShieldCheck, title: 'Nothing else changes', desc: 'Your jobs, bids and reviews stay put.' },
]

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      headline="It happens. Let's get you back in."
      points={POINTS}
      motif={
        <MotifCycle
          motifs={SWEEP}
          size={420}
          cycle="90s"
          float="motif-float"
          floatDuration="24s"
          className="absolute -left-20 bottom-0 text-sand opacity-30"
        />
      }
    >
      <div className="bg-surface border border-line rounded-md p-8">

        {sent ? (
          <>
            <div className="w-12 h-12 flex items-center justify-center mb-4 rounded-sm
                            bg-terracotta-soft text-terracotta">
              <Mail size={22} strokeWidth={1.5} />
            </div>
            <h1 className="t-h1 text-ink">Check your email</h1>
            <p className="text-sm text-ink-2 mt-2 mb-6">
              If an account exists for{' '}
              <span className="font-semibold text-ink">{email}</span>, we&apos;ve sent it a
              link to set a new password.
            </p>
            <div className="border border-line rounded-xs p-4 text-sm bg-cream text-ink-2 mb-6">
              Can&apos;t find it? Check your spam folder before requesting another.
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta
                         hover:text-terracotta-deep"
            >
              <ArrowLeft size={14} strokeWidth={2} /> Back to log in
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="t-h1 text-ink">Reset your password</h1>
              <p className="text-sm mt-1 text-ink-2">
                Enter the email on your account and we&apos;ll send you a link.
              </p>
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
                <label htmlFor="email" className="t-label block mb-1.5 text-ink-2">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-line rounded-xs text-sm text-ink
                             placeholder:text-ink-3 outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white py-2.5
                           rounded-sm font-semibold text-sm transition-colors hover:bg-terracotta-deep
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Agwo size={14} className="text-white" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-ink-2 mt-6">
              Remembered it?{' '}
              <Link href="/login" className="text-terracotta font-semibold hover:text-terracotta-deep">
                Log in
              </Link>
            </p>
          </>
        )}

      </div>
    </AuthShell>
  )
}
