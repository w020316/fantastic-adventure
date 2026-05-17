import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { config } from '../config'
import { logger } from '../utils/logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: number
  public readonly isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.code = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function createError(statusCode: number, message: string): AppError {
  return new AppError(statusCode, message)
}

export function handleValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      code: 400,
      message: '参数校验失败',
      errors: errors.array().map(e => ({ field: (e as any).path ?? '', message: e.msg as string })),
    })
    return
  }
  next()
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    })
    return
  }

  logger.error(err.message, { stack: config.isDev ? err.stack : undefined })

  res.status(500).json({
    code: 500,
    message: config.isDev ? err.message : '服务器内部错误',
  })
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
