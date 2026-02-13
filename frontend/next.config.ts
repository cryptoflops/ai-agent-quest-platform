import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: ["@stacks/connect", "@stacks/auth", "@stacks/common", "@stacks/network", "@stacks/transactions"],
  webpack: (config, { isServer }) => {
    // Fix for Stacks and other Web3 libs expecting Node.js modules in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        path: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
