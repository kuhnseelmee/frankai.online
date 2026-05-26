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
    'FrankAI combines strategic assistance, operational workflows and controlled automation for people and organisations.',
  openGraph: {
    title: 'FrankAI | Intelligence that moves work forward',
    description:
      'Strategic assistance, operational workflows and controlled automation for people and organisations.',
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
