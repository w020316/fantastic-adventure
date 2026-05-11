import { Request, Response } from 'express'
import * as projectService from './project.service'

export async function list(req: Request, res: Response) {
  try {
    const projects = await projectService.list()
    res.json({ code: 200, message: 'ok', data: projects })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const data = { ...req.body, author_id: req.user!.id }
    const result = await projectService.create(data)
    res.status(201).json({ code: 201, message: '创建成功', data: result })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await projectService.update(id, req.body)
    res.json({ code: 200, message: '更新成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await projectService.remove(id)
    res.json({ code: 200, message: '删除成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}
