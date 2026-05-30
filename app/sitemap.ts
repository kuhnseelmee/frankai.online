import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/solutions',
    '/platform',
    '/admin/platform',
    '/governance',
    '/rollout',
    '/release-cycle',
    '/memory',
    '/docs',
    '/trust',
    '/start',
    '/contact',
    '/privacy',
    '/terms'
  ]
  return pages.map((path) => ({
    url: `https://frankai.online${path}`,
    lastModified: new Date('2026-05-29'),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7
  }))
}
