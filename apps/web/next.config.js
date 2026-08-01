/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  webpack: (config, { isServer }) => {
    config.performance = {
      hints: false,
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
    };
    return config;
  },
};

module.exports = nextConfig;
