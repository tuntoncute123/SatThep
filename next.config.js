const nextConfig = {
  agentRules: false,
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  poweredByHeader: false,
  serverExternalPackages: ['node:sqlite'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
