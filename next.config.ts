import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: __dirname,
  eslint: {
    // ESLint currently crashes during builds with a circular JSON error.
    // We skip it here so production builds succeed; run `npm run lint` locally/CI.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
