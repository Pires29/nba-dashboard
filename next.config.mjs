// next.config.js
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ak-static.cms.nba.com",
      },
      {
        protocol: "https",
        hostname: "cdn.nba.com",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);