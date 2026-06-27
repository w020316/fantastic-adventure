# syntax=docker/dockerfile:1.7

# ====== 阶段1: 依赖安装 ======
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ====== 阶段2: 构建 ======
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 构建时使用占位 DATABASE_URL，让 Prisma Client 能初始化
# 真实 DATABASE_URL 由 Fly.io Secrets 在运行时注入
# 使用 force-dynamic 的页面不会在构建时查询数据库
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN npx prisma generate
RUN npm run build

# ====== 阶段3: 运行 ======
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl findutils
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 创建非 root 用户运行
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 产物
# 注意：Next.js standalone 输出可能将 server.js 嵌套在子目录中（如 app/server.js）
# 这里先复制，然后在下面处理嵌套情况
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 如果 server.js 嵌套在子目录中（如 ./app/server.js），将其提升到根目录
# 这解决了 Next.js outputFileTracingRoot 未正确设置时的路径问题
RUN if [ ! -f "./server.js" ]; then \
      SERVER_DIR=$(find . -maxdepth 3 -name "server.js" -not -path "*/node_modules/*" -exec dirname {} \; 2>/dev/null | head -1) && \
      if [ -n "$SERVER_DIR" ] && [ "$SERVER_DIR" != "." ]; then \
        echo "Found server.js in $SERVER_DIR, promoting to root..." && \
        cp -rf "$SERVER_DIR"/. ./ && \
        rm -rf "$SERVER_DIR"; \
      fi; \
    fi && \
    chown -R nextjs:nodejs /app

# 只复制 Prisma Client 运行时文件（不含 prisma CLI）
# prisma CLI 依赖 @prisma/config -> effect 模块，standalone 镜像中没有这些
# 数据库 schema 初始化在本地直连 Neon 执行（npx prisma db push）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# 直接启动 Next.js 服务器
# 数据库 schema 初始化请在部署后于本地执行：npx prisma db push（直连 Neon）
CMD ["node", "server.js"]
