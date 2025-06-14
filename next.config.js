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
      // Example if pax images were on a different bucket:
      // {
      //   protocol: 'https',
      //   hostname: 'another-pax-images-bucket.s3.us-east-2.amazonaws.com',
      //   port: '',
      //   pathname: '/pax-images/**',
      // },
    ],
  },
  // ...
};

module.exports = nextConfig;
