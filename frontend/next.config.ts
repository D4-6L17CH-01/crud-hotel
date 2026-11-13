import type { NextConfig } from "next";

// Resolved at build time: rewrites are baked into the standalone output.
const backendUrl = process.env.BACKEND_URL ?? "http://backend:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
