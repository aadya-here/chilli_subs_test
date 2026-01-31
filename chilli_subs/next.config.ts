import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/src',
        destination: '/', // Next.js automatically maps the root to index.tsx
      },
    ]
  },
}

export default nextConfig;
