'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Bell, User, Settings, LogOut, ChevronDown,
  Briefcase, MessageSquare, CheckCheck,
  Zap, Star, DollarSign
} from 'lucide-react'
import Logo from '@/components/brand/Logo'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Types must match exactly what the API inserts (CLAUDE.md §7.2).
const NOTIF_CONFIG = {
  new_bid:        { icon: DollarSign,    className: 'bg-ochre-soft text-ochre-text'          },
  bid_accepted:   { icon: CheckCheck,    className: 'bg-verified-bg text-verified'           },
  hire_confirmed: { icon: Briefcase,     className: 'bg-verified-bg text-verified'           },
  new_message:    { icon: MessageSquare, className: 'bg-terracotta-soft text-terracotta'     },
  new_review:     { icon: Star,          className: 'bg-ochre-soft text-ochre-text'          },
}

export default function Navbar({ profile }) {
  const supabase = createClient()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [bellOpen, setBellOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]             = useState(0)

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
      className="fixed top-0 left-0 right-0 z-50 border-b border-line"
      style={{
        background:     'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <Link href={profile ? '/dashboard' : '/'} className="flex items-center flex-shrink-0">
            <Logo size={24} />
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
                  className="px-3 py-1.5 text-sm font-medium transition-colors rounded-xs text-ink-2 hover:bg-cream-2"
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
                    className="relative flex items-center justify-center w-9 h-9 border border-line rounded-xs
                               transition-colors hover:bg-cream"
                  >
                    <Bell size={16} strokeWidth={1.5} className="text-ink-2" />
                    {unread > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center text-white
                                   font-bold rounded-full bg-terracotta"
                        style={{ minWidth: 16, height: 16, fontSize: 9, padding: '0 3px' }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {/* Bell dropdown */}
                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-line rounded-md
                                    shadow-lg overflow-hidden z-50">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                        <span className="text-sm font-semibold text-ink">
                          Notifications
                        </span>
                        <Link
                          href="/notifications"
                          className="text-xs font-medium text-terracotta hover:text-terracotta-deep"
                          onClick={() => setBellOpen(false)}
                        >
                          View all
                        </Link>
                      </div>

                      {/* Notification list */}
                      <div className="max-h-90 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell size={24} strokeWidth={1} className="text-ink-3 mx-auto mb-2" />
                            <p className="text-sm text-ink-2">
                              No notifications yet
                            </p>
                            <p className="text-xs mt-1 text-ink-3">
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
                                className={`flex items-start gap-3 px-4 py-3 border-b border-line last:border-0
                                            transition-colors hover:bg-cream ${
                                  notif.is_read ? 'bg-surface' : 'bg-cream'
                                }`}
                              >
                                {/* Icon */}
                                <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8
                                                 rounded-xs ${cfg.className}`}>
                                  <Icon size={14} strokeWidth={1.5} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-ink">
                                    {notif.title}
                                  </p>
                                  {notif.body && (
                                    <p className="text-xs mt-0.5 line-clamp-2 text-ink-2">
                                      {notif.body}
                                    </p>
                                  )}
                                  <p className="text-xs mt-1 text-ink-3">
                                    {timeAgo(notif.created_at)}
                                  </p>
                                </div>

                                {/* Unread dot */}
                                {!notif.is_read && (
                                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1 bg-terracotta" />
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
                    className="flex items-center gap-2 pl-1.5 pr-2 py-1 border border-line rounded-xs
                               transition-colors hover:bg-cream"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold
                                    overflow-hidden bg-ink rounded-[3px]">
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        : profile.full_name?.charAt(0) || '?'
                      }
                    </div>
                    <span className="hidden sm:block text-xs font-medium max-w-24 truncate text-ink-2">
                      {profile.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} strokeWidth={1.5} className="text-ink-3" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-surface border border-line rounded-md
                                    shadow-lg overflow-hidden z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-line">
                        <p className="text-sm font-semibold text-ink">
                          {profile.full_name}
                        </p>
                        <p className="text-xs mt-0.5 capitalize text-ink-3">
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
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-[3px]
                                       text-ink-2 transition-colors hover:bg-cream"
                          >
                            <item.icon size={13} strokeWidth={1.5} className="text-ink-3" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="p-1 border-t border-line">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-[3px]
                                     text-danger transition-colors hover:bg-danger-bg"
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
                  className="text-sm font-medium px-4 py-1.5 border border-line rounded-sm text-ink-2
                             transition-colors hover:bg-cream">
                  Log in
                </Link>
                <Link href="/signup"
                  className="text-sm font-semibold px-4 py-1.5 text-white rounded-sm bg-terracotta
                             transition-colors hover:bg-terracotta-deep">
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
