import { Request, Response } from 'express'
import * as tagService from './tag.service'

export async function list(req: Request, res: Response) {
  try {
    const tags = await tagService.list()
    res.json({ code: 200, message: 'ok', data: tags })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const result = await tagService.create(req.body.name, req.body.color)
    res.status(201).json({ code: 201, message: '创建成功', data: result })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await tagService.update(id, req.body)
    res.json({ code: 200, message: '更新成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await tagService.remove(id)
    res.json({ code: 200, message: '删除成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}
