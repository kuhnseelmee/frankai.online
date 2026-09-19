import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account/',
        '/admin/',
        '/api/',
        '/login',
        '/reset-password',
        '/signup',
        '/verify-email',
        '/voice'
      ]
    },
    sitemap: 'https://frankai.online/sitemap.xml'
  }
}
