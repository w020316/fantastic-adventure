import { Request, Response } from 'express'
import * as categoryService from './category.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.list()
  res.json({ code: 200, message: 'ok', data: categories })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.create(req.body.name, req.body.sort_order)
  res.status(201).json({ code: 201, message: '创建成功', data: result })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await categoryService.update(id, req.body)
  res.json({ code: 200, message: '更新成功' })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await categoryService.remove(id)
  res.json({ code: 200, message: '删除成功' })
})
