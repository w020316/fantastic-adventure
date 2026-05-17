import { Request, Response } from 'express'
import * as statsService from './stats.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const record = asyncHandler(async (req: Request, res: Response) => {
  await statsService.record({ path: req.body.path, ip: req.ip, referrer: req.body.referrer, user_agent: req.headers['user-agent'] })
  res.json({ code: 200, message: 'ok' })
})

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await statsService.overview()
  res.json({ code: 200, message: 'ok', data })
})

export const trend = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30
  const data = await statsService.trend(days)
  res.json({ code: 200, message: 'ok', data: { trend: data } })
})
