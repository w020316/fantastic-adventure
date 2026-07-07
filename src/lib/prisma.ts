import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 构建 datasourceUrl，附加 Neon 连接池参数
// Neon 通过 &connection_limit= 和 &pool_timeout= 控制
function buildDatasourceUrl(): string | undefined {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return undefined

  // 生产环境（Fly.io）增强连接池参数，避免 P2024 超时
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(baseUrl)
    // Neon 适配的连接池参数
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.DB_POOL_SIZE || '10')
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.DB_POOL_TIMEOUT || '30')
    }
    // pgbouncer 兼容模式（Neon pooler）
    if (url.hostname.includes('pooler') && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }
    return url.toString()
  }

  return baseUrl
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
  datasourceUrl: buildDatasourceUrl(),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
