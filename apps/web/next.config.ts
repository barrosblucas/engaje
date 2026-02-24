import type { NextConfig } from 'next';

const DEFAULT_API_ORIGIN = 'http://localhost:3001';

function resolveApiOrigin(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_ORIGIN;

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(DEFAULT_API_ORIGIN);
  }
}

const apiOrigin = resolveApiOrigin();

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiOrigin.origin}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      {
        protocol: apiOrigin.protocol.replace(':', '') as 'http' | 'https',
        hostname: apiOrigin.hostname,
        port: apiOrigin.port || undefined,
      },
      { protocol: 'https', hostname: '*.bandeirantes.ms.gov.br' },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
