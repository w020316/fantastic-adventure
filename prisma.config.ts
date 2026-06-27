import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 本地开发时通过 .env 加载 DATABASE_URL
    // 生产环境（Fly.io）通过 Secrets 注入，无需 dotenv
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/cyberblog",
  },
});
