import { Request, Response } from 'express'
import * as authService from './auth.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

const loginAttempts = new Map<string, { count: number; lockedUntil?: number }>()

function checkLoginThrottle(username: string): { allowed: boolean; message?: string } {
  const now = Date.now()
  const entry = loginAttempts.get(username)

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, message: `登录尝试过于频繁，请在 ${Math.ceil((entry.lockedUntil - now) / 1000)} 秒后重试` }
  }

  return { allowed: true }
}

function recordLoginAttempt(username: string, success: boolean): void {
  const now = Date.now()
  const entry = loginAttempts.get(username) || { count: 0 }

  if (success) {
    loginAttempts.delete(username)
  } else {
    entry.count++
    if (entry.count >= 5) {
      entry.lockedUntil = now + 15 * 60 * 1000
    } else if (entry.count >= 3) {
      entry.lockedUntil = now + 60 * 1000
    }
    loginAttempts.set(username, entry)
  }
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body
  const throttle = checkLoginThrottle(username)
  if (!throttle.allowed) {
    throw createError(429, throttle.message!)
  }
  try {
    const result = await authService.login(username, password)
    recordLoginAttempt(username, true)
    res.json({ code: 200, message: '登录成功', data: result })
  } catch (err: any) {
    recordLoginAttempt(username, false)
    throw err
  }
})

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const user = await authService.getProfile(userId)
  res.json({ code: 200, message: 'ok', data: user })
})

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  if (!refresh_token) {
    throw createError(400, 'refresh_token 不能为空')
  }
  const result = await authService.refreshToken(refresh_token)
  res.json({ code: 200, message: 'ok', data: result })
})

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { old_password, new_password } = req.body
  await authService.updatePassword(userId, old_password, new_password)
  res.json({ code: 200, message: '密码修改成功' })
})

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { avatar } = req.body
  await authService.updateAvatar(userId, avatar)
  res.json({ code: 200, message: '头像更新成功' })
})
