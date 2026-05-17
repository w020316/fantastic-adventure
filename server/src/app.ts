import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { config } from './config'
import { pool, testConnection } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { apiLimiter } from './middleware/rateLimiter'
import { logger } from './utils/logger'
import authRoutes from './modules/auth/auth.routes'
import { ensureAdminUser } from './modules/auth/auth.service'
import articleRoutes from './modules/article/article.routes'
import categoryRoutes from './modules/category/category.routes'
import tagRoutes from './modules/tag/tag.routes'
import commentRoutes from './modules/comment/comment.routes'
import projectRoutes from './modules/project/project.routes'
import statsRoutes from './modules/stats/stats.routes'
import { cleanupOldStats } from './modules/stats/stats.service'
import uploadRoutes from './modules/upload/upload.routes'
import siteInfoRoutes from './modules/siteInfo/siteInfo.routes'

const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel-insights.vercel.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https://vercel-insights.vercel.com', 'https://*.vercel-insights.vercel.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}))
app.use(cors({
  origin: config.isDev
    ? ['http://localhost:5173', 'http://localhost:5174']
    : [
        'https://fantastic-adventure-client.vercel.app',
        'https://fantastic-adventure-admin.vercel.app',
        'https://xiaowuboke.com',
      ],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const uploadDir = path.resolve(process.cwd(), config.uploadDir)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
app.use('/uploads', express.static(uploadDir))

app.use(requestLogger)
app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'ok', data: { status: 'running', env: config.nodeEnv } })
})

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api', commentRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/upload', uploadRoutes)
app.use(siteInfoRoutes)

app.use(errorHandler)

const PORT = config.port

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote
    else if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      const trimmed = current.trim()
      if (trimmed.length > 0 && !trimmed.startsWith('--')) statements.push(trimmed)
      current = ''
      continue
    }
    current += char
  }
  const trimmed = current.trim()
  if (trimmed.length > 0 && !trimmed.startsWith('--')) statements.push(trimmed)
  return statements
}

async function runSqlStatements(sql: string): Promise<void> {
  const client = await pool.connect()
  try {
    const statements = splitSqlStatements(sql)
    let executed = 0
    for (const stmt of statements) {
      try {
        await client.query(stmt)
        executed++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          logger.warn(`[DB Init] Statement failed: ${msg}`, { statement: stmt.substring(0, 100) })
        }
      }
    }
    logger.info(`[DB Init] Executed ${executed}/${statements.length} SQL statements`)
  } finally {
    client.release()
  }
}

async function initDatabase(): Promise<void> {
  try {
    const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
    const exists = result.rows[0].exists
    if (!exists) {
      logger.info('[DB Init] Tables not found, initializing database...')
      const candidates = ['sql/init.sql', 'sql/init_postgres.sql']
      for (const candidate of candidates) {
        const sqlPath = path.join(process.cwd(), candidate)
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf-8')
          await runSqlStatements(sql)
          logger.info('[DB Init] Database initialized successfully!')
          return
        }
      }
      logger.error('[DB Init] No SQL init file found')
    } else {
      logger.info('[DB Init] Database tables already exist')
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('[DB Init] Error', { message })
  }
}

async function start() {
  let dbConnected = false
  try {
    await testConnection()
    dbConnected = true
    logger.info('[Server] Database connected successfully')
    await initDatabase()
    await ensureAdminUser()
    const deleted = await cleanupOldStats(30)
    if (deleted > 0) logger.info(`[Server] Cleaned up ${deleted} old stats records`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('[Server] Database connection failed', { message })
    logger.warn('[Server] Starting without database - API will return errors for DB operations')
  }

  app.listen(PORT, () => {
    logger.info(`[Server] Running on port ${PORT} in ${config.nodeEnv} mode`, { dbConnected })
  })

  process.on('SIGTERM', async () => {
    logger.info('[Server] SIGTERM received, shutting down gracefully...')
    const { gracefulShutdown } = await import('./config/database')
    await gracefulShutdown()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('[Server] SIGINT received, shutting down gracefully...')
    const { gracefulShutdown } = await import('./config/database')
    await gracefulShutdown()
    process.exit(0)
  })
}

start()

export default app
