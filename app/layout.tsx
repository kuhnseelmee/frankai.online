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
