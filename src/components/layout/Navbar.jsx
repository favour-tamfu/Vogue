'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Bell, User, Settings, LogOut, ChevronDown,
  Menu, X, Briefcase, MessageSquare, CheckCheck,
  Zap, Star, Send, DollarSign
} from 'lucide-react'

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

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const NOTIF_CONFIG = {
  new_bid:        { icon: DollarSign, color: '#D97706', bg: '#FFFBEB' },
  bid_accepted:   { icon: CheckCheck, color: '#16A34A', bg: '#F0FDF4' },
  hire_confirmed: { icon: Briefcase,  color: '#2563EB', bg: '#EFF6FF' },
  new_message:    { icon: MessageSquare, color: T.coral, bg: T.coralLight },
  new_review:     { icon: Star,       color: '#D97706', bg: '#FFFBEB' },
}

export default function Navbar({ profile }) {
  const router   = useRouter()
  const supabase = createClient()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [bellOpen, setBellOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]             = useState(0)
  const [markingAll, setMarkingAll]     = useState(false)

  const bellRef   = useRef(null)
  const avatarRef = useRef(null)

  // Fetch notifications
  useEffect(() => {
    if (!profile) return

    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnread(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifs()

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnread(prev => prev + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile?.id])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleBellOpen = async () => {
    setBellOpen(!bellOpen)

    // Mark all as read when opening
    if (!bellOpen && unread > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background:   'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderColor:  T.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <Link href={profile ? '/dashboard' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 flex items-center justify-center text-white font-bold text-xs"
              style={{ background: T.coral, borderRadius: 4 }}
            >
              V
            </div>
            <span className="hidden sm:block font-bold text-sm tracking-widest" style={{ color: T.navy }}>
              VOGUE
            </span>
          </Link>

          {/* Desktop nav */}
          {profile && (
            <div className="hidden md:flex items-center gap-1 flex-1 max-w-sm">
              {[
                { label: 'Jobs',      href: '/jobs'      },
                { label: 'Providers', href: '/providers' },
                { label: 'Feed',      href: '/feed'      },
                { label: 'Messages',  href: '/messages'  },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 rounded"
                  style={{ color: T.textMuted }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {profile ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={handleBellOpen}
                    className="relative flex items-center justify-center w-9 h-9 border transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4 }}
                  >
                    <Bell size={16} strokeWidth={1.5} style={{ color: T.textMuted }} />
                    {unread > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center text-white font-bold"
                        style={{
                          background:  T.coral,
                          borderRadius: '50%',
                          minWidth:    16,
                          height:      16,
                          fontSize:    9,
                          padding:     '0 3px',
                        }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {/* Bell dropdown */}
                  {bellOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 bg-white border shadow-lg overflow-hidden z-50"
                      style={{ borderColor: T.border, borderRadius: 4 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ borderColor: T.border }}>
                        <span className="text-sm font-semibold" style={{ color: T.navy }}>
                          Notifications
                        </span>
                        <Link
                          href="/notifications"
                          className="text-xs font-medium hover:opacity-70"
                          style={{ color: T.coral }}
                          onClick={() => setBellOpen(false)}
                        >
                          View all
                        </Link>
                      </div>

                      {/* Notification list */}
                      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell size={24} strokeWidth={1}
                              style={{ color: T.textLight, margin: '0 auto 8px' }} />
                            <p className="text-sm" style={{ color: T.textMuted }}>
                              No notifications yet
                            </p>
                            <p className="text-xs mt-1" style={{ color: T.textLight }}>
                              Activity on your jobs and bids will appear here
                            </p>
                          </div>
                        ) : (
                          notifications.map(notif => {
                            const cfg  = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.new_message
                            const Icon = cfg.icon
                            return (
                              <Link
                                key={notif.id}
                                href={notif.link || '/dashboard'}
                                onClick={() => setBellOpen(false)}
                                className="flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors hover:bg-slate-50"
                                style={{
                                  borderColor: T.border,
                                  background:  notif.is_read ? '#fff' : '#FAFAFA',
                                }}
                              >
                                {/* Icon */}
                                <div
                                  className="flex items-center justify-center flex-shrink-0 w-8 h-8"
                                  style={{ background: cfg.bg, borderRadius: 4 }}
                                >
                                  <Icon size={14} strokeWidth={1.5} style={{ color: cfg.color }} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold" style={{ color: T.navy }}>
                                    {notif.title}
                                  </p>
                                  {notif.body && (
                                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: T.textMuted }}>
                                      {notif.body}
                                    </p>
                                  )}
                                  <p className="text-xs mt-1" style={{ color: T.textLight }}>
                                    {timeAgo(notif.created_at)}
                                  </p>
                                </div>

                                {/* Unread dot */}
                                {!notif.is_read && (
                                  <div
                                    className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                                    style={{ background: T.coral }}
                                  />
                                )}
                              </Link>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar dropdown */}
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2 py-1 border transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4 }}
                  >
                    <div
                      className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                      style={{ background: T.navy, borderRadius: 3 }}
                    >
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        : profile.full_name?.charAt(0) || '?'
                      }
                    </div>
                    <span className="hidden sm:block text-xs font-medium max-w-24 truncate"
                      style={{ color: T.navyMid }}>
                      {profile.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white border shadow-lg overflow-hidden z-50"
                      style={{ borderColor: T.border, borderRadius: 4 }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b" style={{ borderColor: T.border }}>
                        <p className="text-sm font-semibold" style={{ color: T.navy }}>
                          {profile.full_name}
                        </p>
                        <p className="text-xs mt-0.5 capitalize" style={{ color: T.textLight }}>
                          {profile.role} account
                        </p>
                      </div>

                      {/* Menu links */}
                      <div className="p-1">
                        {[
                          { label: 'Edit Profile', href: '/profile/edit', icon: User       },
                          { label: 'Settings',     href: '/settings',     icon: Settings   },
                          { label: 'Dashboard',    href: '/dashboard',    icon: Zap        },
                        ].map(item => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                            style={{ borderRadius: 3, color: T.textMuted }}
                          >
                            <item.icon size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="p-1 border-t" style={{ borderColor: T.border }}>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-red-50"
                          style={{ borderRadius: 3, color: '#DC2626' }}
                        >
                          <LogOut size={13} strokeWidth={1.5} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm font-medium px-4 py-1.5 border transition-colors hover:bg-slate-50"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}>
                  Log in
                </Link>
                <Link href="/signup"
                  className="text-sm font-semibold px-4 py-1.5 text-white transition-opacity hover:opacity-90"
                  style={{ background: T.coral, borderRadius: 4 }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}