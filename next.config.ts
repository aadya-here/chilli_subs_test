import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/src',
        destination: '/', 
      },
    ]
  },
}

export default nextConfig;
