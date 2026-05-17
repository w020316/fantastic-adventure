import { Request, Response } from 'express'
import * as commentService from './comment.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const listByArticle = asyncHandler(async (req: Request, res: Response) => {
  const articleId = parseInt(req.params.articleId)
  const comments = await commentService.listByArticle(articleId)
  res.json({ code: 200, message: 'ok', data: comments })
})

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await commentService.listAll(req.query as any)
  res.json({ code: 200, message: 'ok', data: result })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const articleId = parseInt(req.params.articleId)
  const result = await commentService.create(articleId, { ...req.body, ip: req.ip || req.socket.remoteAddress })
  res.status(201).json({ code: 201, message: '评论成功，等待审核', data: result })
})

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await commentService.updateStatus(id, req.body.status)
  res.json({ code: 200, message: '状态更新成功' })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await commentService.remove(id)
  res.json({ code: 200, message: '删除成功' })
})
