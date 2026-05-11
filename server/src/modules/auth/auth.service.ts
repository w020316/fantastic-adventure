import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { pool } from '../../config/database'
import { config } from '../../config'

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
    throw new Error('用户名或密码错误')
  }
  const user = rows[0]
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('用户名或密码错误')
  }
  const payload = { id: user.id, username: user.username, role: user.role }
  const access_token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as SignOptions)
  const refresh_token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn } as SignOptions)
  const { password: _, ...userWithoutPassword } = user
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
    const decoded = jwt.verify(token, config.jwt.secret) as { id: number; username: string; role: string }
    const payload = { id: decoded.id, username: decoded.username, role: decoded.role }
    const access_token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as SignOptions)
    return { access_token }
  } catch {
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
    throw new Error('原密码错误')
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId])
  return true
}

export async function updateAvatar(userId: number, avatarUrl: string) {
  await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, userId])
  return true
}
