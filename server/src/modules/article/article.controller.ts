import { Request, Response } from 'express'
import * as articleService from './article.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await articleService.list(req.query as any)
  res.json({ code: 200, message: 'ok', data: result })
})

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const article = await articleService.detail(id)
  res.json({ code: 200, message: 'ok', data: article })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = { ...req.body, author_id: req.user!.id }
  const result = await articleService.create(data)
  res.status(201).json({ code: 201, message: '创建成功', data: result })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await articleService.update(id, req.body)
  res.json({ code: 200, message: '更新成功' })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await articleService.remove(id)
  res.json({ code: 200, message: '删除成功' })
})

export const like = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const ip = req.ip || 'unknown'
  await articleService.like(id, ip)
  res.json({ code: 200, message: '点赞成功' })
})

export const related = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const limit = parseInt(req.query.limit as string) || 3
  const data = await articleService.related(id, limit)
  res.json({ code: 200, message: 'ok', data })
})
