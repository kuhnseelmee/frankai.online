import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://frankai.online'),
  title: {
    default: 'FrankAI — Applied AI Engineering, Governed Systems & Consulting',
    template: '%s | FrankAI'
  },
  description:
    'FrankAI is an independent applied AI engineering and consulting initiative building practical, governed and production-oriented systems.',
  keywords: [
    'FrankAI',
    'governed AI',
    'applied AI engineering',
    'AI consulting',
    'governed systems',
    'context engineering',
    'sovereign systems',
    'workflow automation'
  ],
  alternates: {
    canonical: 'https://frankai.online'
  },
  openGraph: {
    title: 'FrankAI — Applied AI Engineering, Governed Systems & Consulting',
    description:
      'Independent applied AI engineering and consulting for practical, governed systems.',
    url: 'https://frankai.online',
    siteName: 'FrankAI',
    images: [{ url: '/images/logo_frankai.png', width: 1536, height: 1024 }],
    type: 'website'
  },
  icons: {
    icon: '/images/logo_frankai.png',
    apple: '/images/logo_frankai.png'
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
