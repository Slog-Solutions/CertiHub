import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
  
};

export default nextConfig;
