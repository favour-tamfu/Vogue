'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Shield, Bell, LogOut,
  CheckCircle, AlertCircle, Eye, EyeOff, Lock
} from 'lucide-react'
import Link from 'next/link'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

export default function Settings({ profile, userEmail }) {
  const supabase = createClient()

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
          className="inline-flex items-center gap-1.5 text-sm mb-2 transition-opacity hover:opacity-70 text-ink-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Dashboard
        </Link>
        <h1 className="t-h1 text-ink">Settings</h1>
      </div>

      <div className="space-y-5">

        {/* Account info */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <Shield size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Account</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="t-label text-ink-2">Email Address</p>
                <p className="text-sm mt-0.5 text-ink-2">{userEmail}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-xs bg-verified-bg text-verified">
                Confirmed
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-line">
              <div>
                <p className="t-label text-ink-2">Account Role</p>
                <p className="text-sm mt-0.5 capitalize text-ink-2">
                  {profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="t-label text-ink-2">
                  Verification Status
                </p>
                <p className="text-sm mt-0.5 capitalize text-ink-2">
                  {profile.verification_status || 'Unsubmitted'}
                </p>
              </div>
              {profile.role !== 'hirer' && !profile.is_verified && (
                <Link
                  href="/verification/apply"
                  className="text-xs font-semibold px-3 py-1.5 text-white rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
                >
                  Get Verified
                </Link>
              )}
              {profile.is_verified && <VerifiedBadge />}
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <Lock size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Change Password</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New Password',     value: newPassword,     set: setNewPassword,     placeholder: 'At least 6 characters' },
              { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, placeholder: 'Repeat new password'    },
            ].map(field => (
              <div key={field.label}>
                <label className="t-label block mb-1.5 text-ink-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-line rounded-xs outline-none text-ink
                               placeholder:text-ink-3 focus:border-terracotta transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
                  >
                    {showPass
                      ? <EyeOff size={14} strokeWidth={1.5} />
                      : <Eye size={14} strokeWidth={1.5} />
                    }
                  </button>
                </div>
              </div>
            ))}

            {passError && (
              <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs bg-danger-bg text-danger">
                <AlertCircle size={13} strokeWidth={1.5} /> {passError}
              </div>
            )}

            {passSuccess && (
              <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs bg-verified-bg text-verified">
                <CheckCircle size={13} strokeWidth={1.5} /> Password updated successfully
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={changingPass || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-sm bg-ink
                         transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {changingPass ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <Bell size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Quick Links</h2>
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
                className="flex items-center justify-between px-3 py-2.5 border border-line rounded-xs
                           text-ink-2 transition-colors hover:bg-cream"
              >
                <span className="text-sm">{item.label}</span>
                <span className="text-ink-3">›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <LogOut size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Sign Out</h2>
          </div>
          <p className="text-xs mb-4 text-ink-2">
            You will be signed out of your account on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-line rounded-sm
                       text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
          >
            <LogOut size={14} strokeWidth={1.5} />
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

      </div>
    </div>
  )
}
