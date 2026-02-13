import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled to fix compatibility issues
  output: "standalone",
  transpilePackages: ["@stacks/connect", "@stacks/auth", "@stacks/common", "@stacks/network", "@stacks/transactions"],
};

export default nextConfig;
