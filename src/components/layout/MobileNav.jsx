'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Search, Briefcase, MessageSquare, User } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',     icon: Briefcase       },
  { href: '/providers', label: 'Explore',  icon: Search          },
  { href: '/messages',  label: 'Messages', icon: MessageSquare   },
  { href: '/profile/edit',   label: 'Profile',  icon: User            },
]

// Pages where the bottom nav should NOT appear
const HIDDEN_ON = [
  '/login', '/signup', '/onboarding',
  '/forgot-password', '/reset-password',
  '/trust', '/support', '/legal',
]

export default function MobileNav() {
  const pathname = usePathname()

  // Hide on auth and onboarding pages
  const shouldHide = HIDDEN_ON.some(path => pathname.startsWith(path))
  if (shouldHide) return null

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
