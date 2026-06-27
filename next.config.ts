import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // standalone 输出模式，用于 Docker / Fly.io 部署，产物不含 node_modules
  output: 'standalone',
  // 明确指定文件追踪根目录为项目目录，确保 standalone 输出扁平化
  // 不设置时 Next.js 可能使用父目录作为根，导致 server.js 嵌套在子目录中
  outputFileTracingRoot: path.resolve(),
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
