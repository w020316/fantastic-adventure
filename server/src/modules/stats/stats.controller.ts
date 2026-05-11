import { Request, Response } from 'express'
import * as statsService from './stats.service'

export async function record(req: Request, res: Response) {
  try {
    await statsService.record({ path: req.body.path, ip: req.ip, referrer: req.body.referrer, user_agent: req.headers['user-agent'] })
    res.json({ code: 200, message: 'ok' })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function overview(req: Request, res: Response) {
  try {
    const data = await statsService.overview()
    res.json({ code: 200, message: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function trend(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 30
    const data = await statsService.trend(days)
    res.json({ code: 200, message: 'ok', data: { trend: data } })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}
