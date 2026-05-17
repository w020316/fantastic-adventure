import { describe, it, expect } from 'vitest'
import { authMiddleware } from './auth'
import { Request, Response, NextFunction } from 'express'

function createMockReq(headers: Record<string, string> = {}): Partial<Request> {
  return { headers }
}

function createMockRes(): Partial<Response> {
  const res: Partial<Response> = {}
  res.status = () => res as Response
  res.json = () => res as Response
  return res
}

describe('authMiddleware', () => {
  it('should return 401 if no authorization header', () => {
    const req = createMockReq()
    const res = createMockRes()
    let statusCode = 0
    let jsonBody: any = null
    res.status = (code: number) => { statusCode = code; return res as Response }
    res.json = (body: any) => { jsonBody = body; return res as Response }
    const next: NextFunction = () => {}

    authMiddleware(req as Request, res as Response, next)

    expect(statusCode).toBe(401)
    expect(jsonBody.code).toBe(401)
  })

  it('should return 401 if authorization header does not start with Bearer', () => {
    const req = createMockReq({ authorization: 'Basic abc123' })
    const res = createMockRes()
    let statusCode = 0
    let jsonBody: any = null
    res.status = (code: number) => { statusCode = code; return res as Response }
    res.json = (body: any) => { jsonBody = body; return res as Response }
    const next: NextFunction = () => {}

    authMiddleware(req as Request, res as Response, next)

    expect(statusCode).toBe(401)
  })
})
