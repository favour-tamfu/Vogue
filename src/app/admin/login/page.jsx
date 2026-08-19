'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import Logo from '@/components/brand/Logo'

// NOTE: CLAUDE.md §6 decides this page is deleted entirely once real admin
// accounts land — admins will log in through the normal login page. Rebranded
// here so nothing ships off-system in the meantime; do not build on it.

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Network error — please try again')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1.5 mb-8">
          <Logo size={30} />
          <div className="t-micro text-ink-3">Admin Panel</div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-md p-6">
          <h2 className="t-h2 text-ink mb-1">
            Admin Access
          </h2>
          <p className="text-xs mb-5 text-ink-2">
            Enter your admin password to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="t-label block mb-1.5 text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-line rounded-xs outline-none text-ink
                             placeholder:text-ink-3 focus:border-terracotta transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 text-ink-3"
                >
                  {showPass
                    ? <EyeOff size={14} strokeWidth={1.5} />
                    : <Eye size={14} strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs bg-danger-bg text-danger">
                <AlertCircle size={13} strokeWidth={1.5} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-sm bg-ink
                         transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4 text-ink-3">
          Not an admin?{' '}
          <a href="/dashboard" className="text-terracotta hover:text-terracotta-deep">Go to dashboard</a>
        </p>

      </div>
    </div>
  )
}
