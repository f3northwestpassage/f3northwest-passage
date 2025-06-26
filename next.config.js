/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'victorycode-uploads.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/images/**', // Or whatever the actual path is
      },
      // !!! IMPORTANT: Add any other S3 buckets or image hosts here if they are different !!!
    ],
  },
  // Add the rewrites configuration here
  async rewrites() {
    // Directly use process.env.NEXT_PUBLIC_BASE_URL as confirmed by user
    // Fallback to localhost for local development if not set
    const BASE_URL_FOR_API = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return [
      {
        source: '/api/region', // The path your frontend will request for region data
        destination: `${BASE_URL_FOR_API}/api/region`, // Use the environment variable here
      },
      // If you have other API routes under /api/ that need proxying, you should add them here:
      {
        source: '/api/locations',
        destination: `${BASE_URL_FOR_API}/api/locations`,
      },
      {
        source: '/api/locations/:path*', // For specific location IDs
        destination: `${BASE_URL_FOR_API}/api/locations/:path*`,
      },
      {
        source: '/api/workouts',
        destination: `${BASE_URL_FOR_API}/api/workouts`,
      },
      {
        source: '/api/workouts/:path*', // For specific workout IDs
        destination: `${BASE_URL_FOR_API}/api/workouts/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
