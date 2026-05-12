import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { testConnection } from './config/database'
import authRoutes from './modules/auth/auth.routes'
import articleRoutes from './modules/article/article.routes'
import categoryRoutes from './modules/category/category.routes'
import tagRoutes from './modules/tag/tag.routes'
import commentRoutes from './modules/comment/comment.routes'
import projectRoutes from './modules/project/project.routes'
import statsRoutes from './modules/stats/stats.routes'
import uploadRoutes from './modules/upload/upload.routes'

const app = express()

app.use(helmet())
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
  res.json({ code: 200, message: 'ok', data: { status: 'running' } })
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

async function start() {
  try {
    await testConnection()
    console.log('Database connected successfully')
  } catch (err) {
    console.error('Database connection failed:', err)
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()

export default app
