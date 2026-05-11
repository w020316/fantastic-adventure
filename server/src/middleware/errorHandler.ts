import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[Error] ${new Date().toISOString()} - ${err.message}`)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  })
}
