/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/dashboard', destination: '/admin' },
      { source: '/dashboard/:path*', destination: '/admin' },
      { source: '/pos', destination: '/admin' },
      { source: '/pos/:path*', destination: '/admin' },
      { source: '/sales', destination: '/admin' },
      { source: '/sales/:path*', destination: '/admin' },
      { source: '/returns', destination: '/admin' },
      { source: '/returns/:path*', destination: '/admin' },
      { source: '/emi', destination: '/admin' },
      { source: '/emi/:path*', destination: '/admin' },
      { source: '/inventory', destination: '/admin' },
      { source: '/inventory/:path*', destination: '/admin' },
      { source: '/purchases', destination: '/admin' },
      { source: '/purchases/:path*', destination: '/admin' },
      { source: '/products', destination: '/admin' },
      { source: '/products/:path*', destination: '/admin' },
      { source: '/customers', destination: '/admin' },
      { source: '/customers/:path*', destination: '/admin' },
      { source: '/suppliers', destination: '/admin' },
      { source: '/suppliers/:path*', destination: '/admin' },
      { source: '/service', destination: '/admin' },
      { source: '/service/:path*', destination: '/admin' },
      { source: '/warranty', destination: '/admin' },
      { source: '/warranty/:path*', destination: '/admin' },
      { source: '/accounting', destination: '/admin' },
      { source: '/accounting/:path*', destination: '/admin' },
      { source: '/cash-management', destination: '/admin' },
      { source: '/cash-management/:path*', destination: '/admin' },
      { source: '/cash_management', destination: '/admin' },
      { source: '/cash_management/:path*', destination: '/admin' },
      { source: '/ledgers', destination: '/admin' },
      { source: '/ledgers/:path*', destination: '/admin' },
      { source: '/expenses', destination: '/admin' },
      { source: '/expenses/:path*', destination: '/admin' },
      { source: '/reports', destination: '/admin' },
      { source: '/reports/:path*', destination: '/admin' },
      { source: '/employees', destination: '/admin' },
      { source: '/employees/:path*', destination: '/admin' },
      { source: '/branches', destination: '/admin' },
      { source: '/branches/:path*', destination: '/admin' },
      { source: '/roles', destination: '/admin' },
      { source: '/roles/:path*', destination: '/admin' },
      { source: '/audit', destination: '/admin' },
      { source: '/audit/:path*', destination: '/admin' },
      { source: '/settings', destination: '/admin' },
      { source: '/settings/:path*', destination: '/admin' },
      { source: '/control-center', destination: '/admin' },
      { source: '/control-center/:path*', destination: '/admin' },
      { source: '/control_center', destination: '/admin' },
      { source: '/control_center/:path*', destination: '/admin' },
      { source: '/seo-management', destination: '/admin' },
      { source: '/seo-management/:path*', destination: '/admin' },
      { source: '/seo_management', destination: '/admin' },
      { source: '/seo_management/:path*', destination: '/admin' },
      { source: '/login', destination: '/admin/login' },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https: wss:; media-src 'self' data: blob: https:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
