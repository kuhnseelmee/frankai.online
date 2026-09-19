import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://frankai.online'),
  title: {
    default: 'FrankAI | Applied AI Engineering & Consulting',
    template: '%s | FrankAI'
  },
  description:
    'FrankAI is Raymond Wooler\'s applied AI engineering, governed systems and consulting practice.',
  keywords: [
    'FrankAI',
    'applied AI engineering',
    'AI consulting',
    'agentic systems',
    'governed AI',
    'workflow automation',
    'AI governance',
    'private AI',
    'context engineering'
  ],
  openGraph: {
    title: 'FrankAI | Applied AI Engineering & Consulting',
    description:
      'Human-directed, AI-augmented systems built around evidence, authority and recoverable operations.',
    url: 'https://frankai.online',
    siteName: 'FrankAI',
    images: [{ url: '/og-card.svg', width: 1200, height: 630 }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrankAI | Applied AI Engineering & Consulting',
    description: 'Human-directed, AI-augmented systems built around evidence, authority and recoverable operations.',
    images: ['/og-card.svg']
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
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
