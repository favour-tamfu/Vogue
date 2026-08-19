'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, MessagesSquare, Briefcase, Star } from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import Agwo from '@/components/motifs/Agwo'
import Nnyo from '@/components/motifs/Nnyo'
import Odu from '@/components/motifs/Odu'

const POINTS = [
  { icon: Briefcase,     title: 'Your jobs and bids',   desc: 'Pick up exactly where you left off.' },
  { icon: MessagesSquare,title: 'Your conversations',   desc: 'Every thread stays on the record.' },
  { icon: Star,          title: 'Your reputation',      desc: 'Reviews you have earned, in one place.' },
]

export default function LoginPage() {
  const supabase = createClient()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Your next event is waiting."
      points={POINTS}
      motif={
        <>
          {/* Nnyọ — the mirror spiral. Returning, coming back around. */}
          <Nnyo
            size={420}
            className="motif-float absolute -left-24 top-1/4 text-sand opacity-30"
            style={{ '--fd': '23s' }}
          />
          <Odu
            animate={false}
            size={220}
            className="motif-float2 absolute -right-16 -bottom-10 text-sand opacity-20"
            style={{ '--fd': '27s', '--delay': '1.6s' }}
          />
        </>
      }
    >
      <div className="bg-surface border border-line rounded-md p-8">

        <div className="mb-6">
          <h1 className="t-h1 text-ink">Log in</h1>
          <p className="text-sm mt-1 text-ink-2">Welcome back to your account.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 border border-line rounded-xs
                          bg-danger-bg text-danger text-sm">
            <AlertCircle size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label htmlFor="email" className="t-label block mb-1.5 text-ink-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-line rounded-xs text-sm text-ink
                         placeholder:text-ink-3 outline-none focus:border-terracotta transition-colors"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label htmlFor="password" className="t-label text-ink-2">Password</label>
              <Link href="/forgot-password" className="text-xs text-terracotta hover:text-terracotta-deep">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-terracotta text-white py-2.5
                       rounded-sm font-semibold text-sm transition-colors hover:bg-terracotta-deep
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Agwo size={14} className="text-white" />}
            {loading ? 'Logging in…' : 'Log in'}
          </button>

        </form>

        <p className="text-center text-sm text-ink-2 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-terracotta font-semibold hover:text-terracotta-deep">
            Sign up
          </Link>
        </p>

      </div>
    </AuthShell>
  )
}
