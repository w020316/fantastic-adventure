import dotenv from 'dotenv'

dotenv.config()

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key]
  if (value) return value
  if (fallback !== undefined) return fallback
  console.warn(`[Config] Warning: environment variable "${key}" is not set, using fallback`)
  return ''
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db',
  },
  jwt: {
    secret: getEnv('JWT_SECRET'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  isDev: process.env.NODE_ENV !== 'production',
}

export function validateConfig(): void {
  const errors: string[] = []
  if (!config.jwt.secret) errors.push('JWT_SECRET')
  if (!config.jwt.refreshSecret) errors.push('JWT_REFRESH_SECRET')
  if (errors.length > 0) {
    throw new Error(`Missing required environment variables: ${errors.join(', ')}. Please set them in render.yaml or .env file.`)
  }
}
