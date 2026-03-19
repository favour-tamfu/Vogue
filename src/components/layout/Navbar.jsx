'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, ChevronDown, LayoutDashboard, Briefcase, Users, Rss, User, Settings, LogOut } from 'lucide-react'

const T = {
  navy:      '#0F172A',
  coral:     '#E8523A',
  border:    '#E2E8F0',
  bg:        '#F8FAFC',
  textMuted: '#64748B',
  textLight: '#94A3B8',
}

export default function Navbar({ profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
    { href: '/jobs',      label: 'Browse Jobs',    icon: Briefcase       },
    { href: '/providers', label: 'Find Providers', icon: Users           },
    { href: '/feed',      label: 'Feed',           icon: Rss             },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b bg-white"
        style={{ borderColor: T.border }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-7 h-7 flex items-center justify-center text-white font-bold text-xs"
                style={{ background: T.coral, borderRadius: 4 }}
              >
                V
              </div>
              <span className="font-bold text-sm tracking-widest" style={{ color: T.navy }}>
                VOGUE
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-50 rounded"
                  style={{ color: T.textMuted }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1">

              {/* Notification bell */}
              <button
                className="relative p-2 rounded transition-colors hover:bg-slate-50"
                title="Notifications"
              >
                <Bell size={16} strokeWidth={1.5} style={{ color: T.textMuted }} />
                {/* Unread dot */}
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: T.coral }}
                />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded transition-colors hover:bg-slate-50"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: T.navy, borderRadius: 4 }}
                  >
                    {profile?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold leading-none" style={{ color: T.navy }}>
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-xs capitalize mt-0.5" style={{ color: T.textLight }}>
                      {profile?.role}
                    </div>
                  </div>
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    style={{ color: T.textLight }}
                    className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 border bg-white overflow-hidden z-50"
                    style={{ borderColor: T.border, borderRadius: 4 }}
                  >
                    {/* User info */}
                    <div
                      className="px-3 py-2.5 border-b"
                      style={{ borderColor: T.border, background: T.bg }}
                    >
                      <div className="text-xs font-semibold" style={{ color: T.navy }}>
                        {profile?.full_name}
                      </div>
                      <div className="text-xs capitalize mt-0.5" style={{ color: T.textLight }}>
                        {profile?.role} account
                      </div>
                    </div>

                    {[
                      { label: 'Edit Profile', href: '/profile/edit', icon: User     },
                      { label: 'Settings',     href: '/settings',     icon: Settings },
                    ].map(item => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50"
                        style={{ color: T.textMuted }}
                      >
                        <item.icon size={13} strokeWidth={1.5} style={{ color: T.textLight }} />
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t" style={{ borderColor: T.border }} />

                    <button
                      onClick={handleSignout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-red-50"
                      style={{ color: '#DC2626' }}
                    >
                      <LogOut size={13} strokeWidth={1.5} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded transition-colors hover:bg-slate-50"
              >
                <div className="w-4 flex flex-col gap-[4px]">
                  <span
                    className="h-px rounded transition-all"
                    style={{
                      background: T.textMuted,
                      transform: mobileOpen ? 'rotate(45deg) translateY(5px)' : 'none'
                    }}
                  />
                  <span
                    className="h-px rounded transition-all"
                    style={{
                      background: T.textMuted,
                      opacity: mobileOpen ? 0 : 1
                    }}
                  />
                  <span
                    className="h-px rounded transition-all"
                    style={{
                      background: T.textMuted,
                      transform: mobileOpen ? 'rotate(-45deg) translateY(-5px)' : 'none'
                    }}
                  />
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white" style={{ borderColor: T.border }}>
            <div className="px-3 py-2 space-y-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 rounded"
                  style={{ color: T.textMuted }}
                >
                  <link.icon size={15} strokeWidth={1.5} style={{ color: T.textLight }} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}