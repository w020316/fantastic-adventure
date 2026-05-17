import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { pool } from '../../config/database'
import { config } from '../../config'
import { logger } from '../../utils/logger'

interface UserRow {
  id: number
  username: string
  password: string
  email: string | null
  avatar: string | null
  role: 'admin' | 'visitor'
  created_at: string
  updated_at: string
}

export async function login(username: string, password: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  )
  const rows = result.rows as UserRow[]
  if (rows.length === 0) {
    logger.warn('Login failed: user not found', { username })
    throw new Error('用户名或密码错误')
  }
  const user = rows[0]
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    logger.warn('Login failed: incorrect password', { username })
    throw new Error('用户名或密码错误')
  }
  const payload = { id: user.id, username: user.username, role: user.role }
  const access_token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as SignOptions)
  const refresh_token = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as SignOptions)
  const { password: _, ...userWithoutPassword } = user
  logger.info('User logged in', { userId: user.id, username: user.username })
  return { access_token, refresh_token, user: userWithoutPassword }
}

export async function getProfile(userId: number) {
  const result = await pool.query(
    'SELECT id, username, email, avatar, role, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  )
  const rows = result.rows as UserRow[]
  if (rows.length === 0) {
    throw new Error('用户不存在')
  }
  return rows[0]
}

export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: number; username: string; role: string }
    const payload = { id: decoded.id, username: decoded.username, role: decoded.role }
    const access_token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as SignOptions)
    logger.info('Token refreshed', { userId: decoded.id })
    return { access_token }
  } catch {
    logger.warn('Token refresh failed: invalid or expired refresh token')
    throw new Error('Refresh token 无效或已过期')
  }
}

export async function updatePassword(userId: number, oldPassword: string, newPassword: string) {
  const result = await pool.query(
    'SELECT password FROM users WHERE id = $1',
    [userId]
  )
  const rows = result.rows as UserRow[]
  if (rows.length === 0) {
    throw new Error('用户不存在')
  }
  const isMatch = await bcrypt.compare(oldPassword, rows[0].password)
  if (!isMatch) {
    logger.warn('Password update failed: incorrect old password', { userId })
    throw new Error('原密码错误')
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId])
  logger.info('Password updated', { userId })
  return true
}

export async function updateAvatar(userId: number, avatarUrl: string) {
  await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, userId])
  logger.info('Avatar updated', { userId })
  return true
}

export async function ensureAdminUser(): Promise<void> {
  try {
    const result = await pool.query("SELECT id FROM users WHERE username = 'admin'")
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await pool.query(
        "INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)",
        ['admin', hashedPassword, 'admin@blog.com', 'admin']
      )
      logger.info('[Auth] Default admin user created')
    }
  } catch (err: unknown) {
    logger.error('[Auth] Failed to ensure admin user', { message: err instanceof Error ? err.message : String(err) })
  }
}
