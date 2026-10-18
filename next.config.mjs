/** @type {import('next').NextConfig} */
// Server actions only accept form posts from the app's own host. Behind a tunnel or proxy the public host can differ
// from the one the server sees, so allow the host of PUBLIC_LINK_BASE explicitly.
const publicHost = (() => {
  try { return new URL(process.env.PUBLIC_LINK_BASE ?? '').host; } catch { return null; }
})();

const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { allowedOrigins: publicHost ? [publicHost] : [] },
  },
  serverExternalPackages: ['pino', 'pg-boss', 'twilio'],
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    }];
  },
};
export default nextConfig;
