// 本地开发时加载 .env 文件中的环境变量
// 生产环境（Docker/Fly.io）通过 Secrets 注入，不需要 .env
// 使用 try-catch 避免生产环境缺少 dotenv 模块时报错
try {
  await import("dotenv/config");
} catch {
  // dotenv 不可用时忽略，环境变量由运行时注入
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/cyberblog",
  },
});
