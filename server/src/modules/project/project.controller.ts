import { Request, Response } from 'express'
import * as projectService from './project.service'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.list()
  res.json({ code: 200, message: 'ok', data: projects })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = { ...req.body, author_id: req.user!.id }
  const result = await projectService.create(data)
  res.status(201).json({ code: 201, message: '创建成功', data: result })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await projectService.update(id, req.body)
  res.json({ code: 200, message: '更新成功' })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await projectService.remove(id)
  res.json({ code: 200, message: '删除成功' })
})
