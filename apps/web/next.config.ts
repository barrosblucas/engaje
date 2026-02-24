import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
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
