'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Shield, Bell, LogOut,
  CheckCircle, AlertCircle, Eye, EyeOff, Lock
} from 'lucide-react'
import Link from 'next/link'

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

export default function Settings({ profile, userEmail }) {
  const router   = useRouter()
  const supabase = createClient()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]               = useState(false)
  const [changingPass, setChangingPass]       = useState(false)
  const [passError, setPassError]             = useState(null)
  const [passSuccess, setPassSuccess]         = useState(false)
  const [signingOut, setSigningOut]           = useState(false)

  const handlePasswordChange = async () => {
    if (!newPassword) { setPassError('Please enter a new password'); return }
    if (newPassword.length < 6) { setPassError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPassError('Passwords do not match'); return }

    setChangingPass(true)
    setPassError(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPassError(error.message)
    } else {
      setPassSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPassSuccess(false), 3000)
    }

    setChangingPass(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-2 transition-opacity hover:opacity-70"
          style={{ color: T.textMuted }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Dashboard
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Settings</h1>
      </div>

      <div className="space-y-5">

        {/* Account info */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: T.border }}>
            <Shield size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>Account</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b"
              style={{ borderColor: T.border }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: T.navyMid }}>Email Address</p>
                <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>{userEmail}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5"
                style={{ background: '#F0FDF4', color: '#16A34A', borderRadius: 4 }}>
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b"
              style={{ borderColor: T.border }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: T.navyMid }}>Account Role</p>
                <p className="text-sm mt-0.5 capitalize" style={{ color: T.textMuted }}>
                  {profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-semibold" style={{ color: T.navyMid }}>
                  Verification Status
                </p>
                <p className="text-sm mt-0.5 capitalize" style={{ color: T.textMuted }}>
                  {profile.verification_status || 'Unsubmitted'}
                </p>
              </div>
              {profile.role !== 'hirer' && !profile.is_verified && (
                <Link
                  href="/verification/apply"
                  className="text-xs font-semibold px-3 py-1.5 text-white transition-opacity hover:opacity-90"
                  style={{ background: T.coral, borderRadius: 4 }}
                >
                  Get Verified
                </Link>
              )}
              {profile.is_verified && (
                <span className="text-xs font-medium px-2 py-0.5"
                  style={{ background: '#EFF6FF', color: '#3B82F6', borderRadius: 4 }}>
                  Verified ✓
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: T.border }}>
            <Lock size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>Change Password</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New Password',     value: newPassword,     set: setNewPassword,     placeholder: 'At least 6 characters' },
              { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, placeholder: 'Repeat new password'    },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 pr-10 text-sm border outline-none"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                    onFocus={e => e.target.style.borderColor = T.navy}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPass
                      ? <EyeOff size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
                      : <Eye size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
                    }
                  </button>
                </div>
              </div>
            ))}

            {passError && (
              <div className="flex items-center gap-2 p-3 border text-xs"
                style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}>
                <AlertCircle size={13} strokeWidth={1.5} /> {passError}
              </div>
            )}

            {passSuccess && (
              <div className="flex items-center gap-2 p-3 border text-xs"
                style={{ background: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 4, color: '#16A34A' }}>
                <CheckCircle size={13} strokeWidth={1.5} /> Password updated successfully
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={changingPass || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: T.navy, borderRadius: 4 }}
            >
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: T.border }}>
            <Bell size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>Quick Links</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Edit Profile',           href: '/profile/edit'         },
              { label: 'My Portfolio',            href: '/portfolio/upload'     },
              { label: 'Verification',            href: '/verification/apply'   },
              { label: 'Browse Jobs',             href: '/jobs'                 },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 border transition-colors hover:bg-slate-50"
                style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
              >
                <span className="text-sm">{item.label}</span>
                <span style={{ color: T.textLight }}>›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-white border p-5" style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: T.border }}>
            <LogOut size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>Sign Out</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: T.textMuted }}>
            You will be signed out of your account on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: '#FECACA', borderRadius: 4, color: '#DC2626' }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

      </div>
    </div>
  )
}