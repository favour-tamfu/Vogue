'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  AlertCircle, Eye, EyeOff, Mail, Check,
  IdCard, Landmark, Users, Search, Megaphone
} from 'lucide-react'
import AuthShell from '@/components/layout/AuthShell'
import Agwo from '@/components/motifs/Agwo'
import Omumu from '@/components/motifs/Omumu'
import Anyanwu from '@/components/motifs/Anyanwu'

const POINTS = [
  { icon: IdCard,   title: 'Verified before they bid', desc: 'Every provider passes an ID check first.' },
  { icon: Landmark, title: 'Paid in naira, directly',  desc: 'Bank transfer between you and them.' },
  { icon: Users,    title: 'Reviews on both sides',    desc: 'Accountability runs in both directions.' },
]

const ROLES = [
  { value: 'hirer',    label: 'Hirer',    desc: 'I need event services', icon: Search   },
  { value: 'provider', label: 'Provider', desc: 'I offer event services', icon: Megaphone },
  { value: 'both',     label: 'Both',     desc: 'I do both',              icon: Users     },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'hirer'
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // NOTE: nothing sets this to true today — handleSignup redirects straight to
  // onboarding instead, so the "check your email" screen is currently
  // unreachable. Left in place because it is the correct destination once email
  // confirmation is enforced (see CLAUDE.md §1.2, auth redirect URL).
  const [showConfirmScreen] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Save role to profile
    if (data.user) {
      // Use upsert so the profiles row exists (update would affect 0 rows if the row doesn't exist yet)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            role: formData.role,
            full_name: formData.fullName,
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    window.location.href = `/onboarding?role=${formData.role}`
    router.refresh()
  }

  // ── Shown once email confirmation is enforced ──
  if (showConfirmScreen) {
    return (
      <AuthShell
        eyebrow="Almost there"
        headline="One click and you're in."
        points={POINTS}
        motif={
          <Anyanwu
            size={440}
            className="motif-float absolute -left-20 top-1/4 text-sand opacity-30"
            style={{ '--fd': '22s' }}
          />
        }
      >
        <div className="bg-surface border border-line rounded-md p-8 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-sm
                          bg-terracotta-soft text-terracotta">
            <Mail size={22} strokeWidth={1.5} />
          </div>
          <h1 className="t-h1 text-ink">Check your email</h1>
          <p className="text-sm text-ink-2 mt-2 mb-6">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-ink">{formData.email}</span>.
            Click it to activate your account and get started.
          </p>
          <div className="border border-line rounded-xs p-4 text-sm bg-cream text-ink-2">
            Can&apos;t find it? Check your spam folder.
          </div>
        </div>
      </AuthShell>
    )
  }

  // ── Main signup form ──
  return (
    <AuthShell
      eyebrow="Create your account"
      headline="Hire someone you can actually check."
      points={POINTS}
      motif={
        <>
          {/* Ọmụmụ — growth. The right motif for a new account. */}
          <Omumu
            size={400}
            className="motif-float absolute -left-16 bottom-0 text-sand opacity-35"
            style={{ '--fd': '20s' }}
          />
          <Anyanwu
            animate={false}
            size={240}
            className="motif-float2 absolute -right-14 top-16 text-sand opacity-20"
            style={{ '--fd': '26s', '--delay': '1.4s' }}
          />
        </>
      }
    >
      <div className="bg-surface border border-line rounded-md p-8">

        <div className="mb-6">
          <h1 className="t-h1 text-ink">Create your account</h1>
          <p className="text-sm mt-1 text-ink-2">Free to join. No commission, ever, at launch.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 border border-line rounded-xs
                          bg-danger-bg text-danger text-sm">
            <AlertCircle size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label htmlFor="fullName" className="t-label block mb-1.5 text-ink-2">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 border border-line rounded-xs text-sm text-ink
                         placeholder:text-ink-3 outline-none focus:border-terracotta transition-colors"
            />
          </div>

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
            <label htmlFor="password" className="t-label block mb-1.5 text-ink-2">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
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

          <fieldset>
            <legend className="t-label mb-2 text-ink-2">I want to join as</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((option) => {
                const active = formData.role === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFormData({ ...formData, role: option.value })}
                    className={`relative p-3 rounded-xs border text-left transition-all ${
                      active
                        ? 'border-terracotta bg-terracotta-soft'
                        : 'border-line hover:border-ink-3'
                    }`}
                  >
                    {active && (
                      <Check size={12} strokeWidth={3}
                        className="absolute top-2 right-2 text-terracotta" />
                    )}
                    <option.icon
                      size={16}
                      strokeWidth={1.5}
                      className={`mb-1.5 ${active ? 'text-terracotta' : 'text-ink-3'}`}
                    />
                    <div className="font-semibold text-sm text-ink">{option.label}</div>
                    <div className="text-xs text-ink-3 mt-0.5 leading-tight">{option.desc}</div>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-terracotta text-white py-2.5
                       rounded-sm font-semibold text-sm transition-colors hover:bg-terracotta-deep
                       disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading && <Agwo size={14} className="text-white" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-xs text-center leading-relaxed text-ink-3">
            By creating an account you agree to our{' '}
            <Link href="/legal/terms" className="text-ink-2 underline hover:text-terracotta">Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy" className="text-ink-2 underline hover:text-terracotta">Privacy</Link>.
          </p>

        </form>

        <p className="text-center text-sm text-ink-2 mt-6 pt-6 border-t border-line">
          Already have an account?{' '}
          <Link href="/login" className="text-terracotta font-semibold hover:text-terracotta-deep">
            Log in
          </Link>
        </p>

      </div>
    </AuthShell>
  )
}
