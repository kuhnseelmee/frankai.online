import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://frankai.online'),
  title: {
    default: 'FrankAI | Intelligence that moves work forward',
    template: '%s | FrankAI'
  },
  description:
    'FrankAI builds governed AI systems that turn conversations into controlled workflows, approvals, records, deployment proofs and operational action.',
  keywords: [
    'FrankAI',
    'governed AI',
    'workflow automation',
    'AI operations',
    'ServiceDesk',
    'controlled automation',
    'deployment proof',
    'broadcast infrastructure',
    'audit infrastructure',
    'trading automation'
  ],
  alternates: {
    canonical: 'https://frankai.online'
  },
  openGraph: {
    title: 'FrankAI | Intelligence that moves work forward',
    description:
      'Governed AI systems that turn conversations into controlled workflows, approvals, records, deployment proofs and operational action.',
    url: 'https://frankai.online',
    siteName: 'FrankAI',
    images: [{ url: '/og-card.svg', width: 1200, height: 630 }],
    type: 'website'
  },
  icons: {
    icon: '/frank-mark.svg'
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
