/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Keep the standalone server and its traced dependencies inside this app.
  // Without an explicit root, Next.js 16 detects /root as the workspace root
  // and emits .next/standalone/frankai-site, while systemd starts the server
  // from .next/standalone. That mismatch leaves the running app without the
  // matching server/static asset tree.
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), bluetooth=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.openai.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          }
        ]
      }
    ]
  }
}

export default nextConfig
