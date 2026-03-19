import type { Metadata } from 'next'
import './globals.css'
import MobileNav from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: 'Vogue Events',
  description: 'The event services marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <MobileNav />
      </body>
    </html>
  )
}