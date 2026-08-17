import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // required for static HTML export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'c.animaapp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http', // Django dev server (localhost)
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http', // Django dev server (127.0.0.1)
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https', // Render production
        hostname: 'slogsolutions.onrender.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https', // Production domain
        hostname: 'slogsolutions.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https', // Production domain with www
        hostname: 'www.slogsolutions.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // allow any path under res.cloudinary.com
      },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/dashboard/:path*',
          destination: '/dashboard',
        },
        {
          source: '/verify/:path*',
          destination: '/verify',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:5001/uploads/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
