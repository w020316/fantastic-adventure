import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { config } from './config'
import { pool, testConnection } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/auth.routes'
import articleRoutes from './modules/article/article.routes'
import categoryRoutes from './modules/category/category.routes'
import tagRoutes from './modules/tag/tag.routes'
import commentRoutes from './modules/comment/comment.routes'
import projectRoutes from './modules/project/project.routes'
import statsRoutes from './modules/stats/stats.routes'
import uploadRoutes from './modules/upload/upload.routes'

const app = express()

app.use(helmet({
  contentSecurityPolicy: false,
}))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://fantastic-adventure-client.vercel.app',
    'https://fantastic-adventure-admin.vercel.app',
    'https://xiaowuboke.com',
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)))

app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'ok', data: { status: 'running', env: process.env.NODE_ENV } })
})

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api', commentRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorHandler)

const PORT = config.port

async function runSqlStatements(sql: string): Promise<void> {
  const client = await pool.connect()
  try {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    for (const stmt of statements) {
      await client.query(stmt)
    }
    console.log(`[DB Init] Executed ${statements.length} SQL statements`)
  } finally {
    client.release()
  }
}

async function initDatabase(): Promise<void> {
  try {
    const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
    const exists = result.rows[0].exists
    if (!exists) {
      console.log('[DB Init] Tables not found, initializing database...')
      const sqlPath = path.join(process.cwd(), 'sql', 'init.sql')
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf-8')
        await runSqlStatements(sql)
        console.log('[DB Init] Database initialized successfully!')
      } else {
        console.error('[DB Init] init.sql not found at:', sqlPath)
      }
    } else {
      console.log('[DB Init] Database tables already exist')
    }
  } catch (err: any) {
    console.error('[DB Init] Error:', err.message || err)
  }
}

async function start() {
  try {
    await testConnection()
    console.log('[Server] Database connected successfully')
    await initDatabase()
  } catch (err: any) {
    console.error('[Server] Database connection failed:', err.message || err)
  }

  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
  })
}

start()

export default app
