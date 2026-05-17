import { describe, it, expect } from 'vitest'
import { AppError, createError, errorHandler } from './errorHandler'
import { Request, Response, NextFunction } from 'express'

describe('AppError', () => {
  it('should create an error with statusCode and message', () => {
    const err = createError(400, 'Bad Request')
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Bad Request')
    expect(err.isOperational).toBe(true)
  })
})

describe('errorHandler', () => {
  it('should handle AppError with correct status code', () => {
    const err = createError(404, 'Not Found')
    const req = {} as Request
    let statusCode = 0
    let jsonBody: any = null
    const res = {
      status: (code: number) => { statusCode = code; return res as Response },
      json: (body: any) => { jsonBody = body; return res as Response },
    } as Partial<Response>
    const next = (() => {}) as NextFunction

    errorHandler(err, req, res as Response, next)

    expect(statusCode).toBe(404)
    expect(jsonBody.code).toBe(404)
    expect(jsonBody.message).toBe('Not Found')
  })

  it('should handle unknown errors with 500', () => {
    const err = new Error('Something went wrong')
    const req = {} as Request
    let statusCode = 0
    let jsonBody: any = null
    const res = {
      status: (code: number) => { statusCode = code; return res as Response },
      json: (body: any) => { jsonBody = body; return res as Response },
    } as Partial<Response>
    const next = (() => {}) as NextFunction

    errorHandler(err, req, res as Response, next)

    expect(statusCode).toBe(500)
    expect(jsonBody.code).toBe(500)
  })
})
