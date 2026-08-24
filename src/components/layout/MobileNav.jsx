'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Search, Briefcase, MessageSquare, User } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',     icon: Briefcase       },
  { href: '/providers', label: 'Explore',  icon: Search          },
  { href: '/messages',  label: 'Messages', icon: MessageSquare   },
  { href: '/profile/edit', label: 'Profile', icon: User          },
]

// Auth and onboarding routes only. Trust, Support and the legal pages are
// deliberately NOT here: they are linked from the signed-in account menu, and
// hiding the bottom bar there left mobile users with no way back.
const HIDDEN_ON = [
  '/login', '/signup', '/onboarding',
  '/forgot-password', '/reset-password',
]

export default function MobileNav() {
  const pathname = usePathname()
  const [signedIn, setSignedIn] = useState(null)   // null = still checking

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => setSignedIn(!!user))

    // Keep in step with sign-in / sign-out without a reload.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSignedIn(!!session?.user)
    )
    return () => subscription.unsubscribe()
  }, [])

  // Hide on auth and onboarding pages.
  if (HIDDEN_ON.some(path => pathname.startsWith(path))) return null

  // Only for signed-in users. A logged-out visitor on the marketing pages was
  // previously shown a bar linking to Dashboard, Messages and Profile
  // (CLAUDE.md §8 P1). `null` while checking avoids a flash of the bar.
  if (!signedIn) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-line bg-surface">
      <div className="grid grid-cols-5">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors relative ${
                active ? 'text-terracotta' : 'text-ink-3'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-terracotta" />
              )}
              <link.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
