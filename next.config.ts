import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone 输出模式，用于 Docker / Fly.io 部署，产物不含 node_modules
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
