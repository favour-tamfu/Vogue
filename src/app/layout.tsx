import type { Metadata } from 'next'
import './globals.css'
import MobileNav from '@/components/layout/MobileNav'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand'

export const metadata: Metadata = {
  title:       PRODUCT_NAME,
  description: PRODUCT_TAGLINE,
  manifest:    '/manifest.json',
  icons: {
    icon:      [{ url: '/brand/avenue-favicon-7a.svg', type: 'image/svg+xml' }],
    apple:     [{ url: '/apple-touch-icon.png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/Fraunces-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SourceSans3-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <MobileNav />
      </body>
    </html>
  )
}
