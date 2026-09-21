import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'jamiemcfarlane.com',
          },
        ],
        destination: 'https://www.jamiemcfarlane.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sfo.cloud.appwrite.io',
        pathname: '/v1/storage/buckets/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        pathname: '/fickledragon.com/**',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
