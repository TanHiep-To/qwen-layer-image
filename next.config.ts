import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://101.47.76.33/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
