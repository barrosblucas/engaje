import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.bandeirantes.ms.gov.br' },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
