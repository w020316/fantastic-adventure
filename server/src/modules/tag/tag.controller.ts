import { Request, Response } from 'express'
import * as tagService from './tag.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tags = await tagService.list()
  res.json({ code: 200, message: 'ok', data: tags })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await tagService.create(req.body.name, req.body.color)
  res.status(201).json({ code: 201, message: '创建成功', data: result })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await tagService.update(id, req.body)
  res.json({ code: 200, message: '更新成功' })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await tagService.remove(id)
  res.json({ code: 200, message: '删除成功' })
})
