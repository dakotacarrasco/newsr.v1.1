const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  transpilePackages: ['@vercel/speed-insights'],
  generateBuildId: () => 'build',
  // Bypass route validation for problematic paths
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  typescript: {
    // Re-enable in production for better type safety
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Re-enable in production for better code quality
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    // Reduce console warnings by adjusting stats options
    config.stats = {
      warningsFilter: [
        /only differ in casing/,
        /multiple modules with names that only differ/,
        /module not found/i,
        /can't resolve/i,
        /The request .+ in .+ has been ignored/,
        /has a case-only conflict with/,
        /There are multiple modules with names that only differ in casing/i
      ],
      // Set logging level to minimal to reduce console noise
      logging: 'warn',
      // Disable asset and module info details to reduce console output
      assets: false,
      modules: false,
    };
    
    return config;
  },
}

module.exports = withPWA(nextConfig) 