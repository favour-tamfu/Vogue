'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

const T = {
  navy:   '#0F172A',
  coral:  '#E8523A',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  muted:  '#64748B',
  light:  '#94A3B8',
}

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: T.bg }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-9 h-9 flex items-center justify-center text-white"
            style={{ background: T.navy, borderRadius: 4 }}
          >
            <Shield size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: T.navy }}>VOGUE EVENTS</div>
            <div className="text-xs" style={{ color: T.light }}>Admin Panel</div>
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white border p-6"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <h1 className="text-base font-semibold mb-1" style={{ color: T.navy }}>
            Admin Access
          </h1>
          <p className="text-xs mb-5" style={{ color: T.muted }}>
            Enter your admin password to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: T.navy }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full px-3 py-2.5 pr-10 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                >
                  {showPass
                    ? <EyeOff size={14} strokeWidth={1.5} style={{ color: T.light }} />
                    : <Eye size={14} strokeWidth={1.5} style={{ color: T.light }} />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 border text-xs"
                style={{
                  borderColor: '#FECACA',
                  background:  '#FFF5F5',
                  borderRadius: 4,
                  color:       '#DC2626',
                }}
              >
                <AlertCircle size={13} strokeWidth={1.5} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: T.navy, borderRadius: 4 }}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: T.light }}>
          Not an admin?{' '}
          <a href="/dashboard" style={{ color: T.coral }}>Go to dashboard</a>
        </p>

      </div>
    </div>
  )
}