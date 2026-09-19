import type { MetadataRoute } from 'next'
import { portfolioEntries, profileHref } from '@/lib/portfolio'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/portfolio',
    '/services/ai-consulting',
    '/solutions',
    '/agents',
    '/methods',
    '/labs',
    '/now',
    '/about',
    '/platform',
    '/governance',
    '/proof',
    '/trust',
    '/start',
    '/contact',
    '/privacy',
    '/terms'
  ]
  const profilePages = portfolioEntries.map(profileHref)

  return [...pages, ...profilePages].map((path) => ({
    url: `https://frankai.online${path}`,
    lastModified: new Date('2026-09-17'),
    changeFrequency: path === '' || path === '/now' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/portfolio' || path === '/services/ai-consulting' ? 0.9 : 0.7
  }))
}
