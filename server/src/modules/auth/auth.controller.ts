import { Request, Response } from 'express'
import * as authService from './auth.service'

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body
    const result = await authService.login(username, password)
    res.json({ code: 200, message: '登录成功', data: result })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const user = await authService.getProfile(userId)
    res.json({ code: 200, message: 'ok', data: user })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      res.status(400).json({ code: 400, message: 'refresh_token 不能为空' })
      return
    }
    const result = await authService.refreshToken(refresh_token)
    res.json({ code: 200, message: 'ok', data: result })
  } catch (err: any) {
    res.status(401).json({ code: 401, message: err.message })
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { old_password, new_password } = req.body
    await authService.updatePassword(userId, old_password, new_password)
    res.json({ code: 200, message: '密码修改成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function updateAvatar(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { avatar } = req.body
    await authService.updateAvatar(userId, avatar)
    res.json({ code: 200, message: '头像更新成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}
