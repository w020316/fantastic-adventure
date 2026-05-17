import { Request, Response } from 'express'
import * as authService from './auth.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body
  const result = await authService.login(username, password)
  res.json({ code: 200, message: '登录成功', data: result })
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
