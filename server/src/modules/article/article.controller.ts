import { Request, Response } from 'express'
import * as articleService from './article.service'

export async function list(req: Request, res: Response) {
  try {
    const result = await articleService.list(req.query as any)
    res.json({ code: 200, message: 'ok', data: result })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function detail(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const article = await articleService.detail(id)
    res.json({ code: 200, message: 'ok', data: article })
  } catch (err: any) {
    res.status(404).json({ code: 404, message: err.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const data = { ...req.body, author_id: req.user!.id }
    const result = await articleService.create(data)
    res.status(201).json({ code: 201, message: '创建成功', data: result })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await articleService.update(id, req.body)
    res.json({ code: 200, message: '更新成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await articleService.remove(id)
    res.json({ code: 200, message: '删除成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function like(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const ip = req.ip || 'unknown'
    await articleService.like(id, ip)
    res.json({ code: 200, message: '点赞成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function related(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    const limit = parseInt(req.query.limit as string) || 3
    const data = await articleService.related(id, limit)
    res.json({ code: 200, message: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}
