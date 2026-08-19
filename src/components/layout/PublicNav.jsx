import Link from 'next/link'
import Logo from '@/components/brand/Logo'

/**
 * Marketing / logged-out navigation. The signed-in app uses Navbar.jsx.
 */
export default function PublicNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          <Link href="/" aria-label="Avenue home">
            <Logo size={26} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-sm font-medium text-ink-2 hover:text-ink transition-colors">
              Browse Jobs
            </Link>
            <Link href="/providers" className="text-sm font-medium text-ink-2 hover:text-ink transition-colors">
              Find Providers
            </Link>
            <Link href="/trust" className="text-sm font-medium text-ink-2 hover:text-ink transition-colors">
              Trust &amp; Safety
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login"
              className="text-sm font-medium px-4 py-1.5 border border-line rounded-sm text-ink-2
                         transition-colors hover:bg-cream">
              Log in
            </Link>
            <Link href="/signup"
              className="text-sm font-semibold px-4 py-1.5 text-white rounded-sm bg-terracotta
                         transition-colors hover:bg-terracotta-deep">
              Get Started
            </Link>
          </div>

        </div>
      </div>
    </nav>
  )
}
