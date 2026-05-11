import { Request, Response } from 'express'
import * as commentService from './comment.service'

export async function listByArticle(req: Request, res: Response) {
  try {
    const articleId = parseInt(req.params.articleId)
    const comments = await commentService.listByArticle(articleId)
    res.json({ code: 200, message: 'ok', data: comments })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function listAll(req: Request, res: Response) {
  try {
    const result = await commentService.listAll(req.query as any)
    res.json({ code: 200, message: 'ok', data: result })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

export async function create(req: Request, res: Response) {
  try {
    const articleId = parseInt(req.params.articleId)
    const result = await commentService.create(articleId, req.body)
    res.status(201).json({ code: 201, message: '评论成功，等待审核', data: result })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await commentService.updateStatus(id, req.body.status)
    res.json({ code: 200, message: '状态更新成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    await commentService.remove(id)
    res.json({ code: 200, message: '删除成功' })
  } catch (err: any) {
    res.status(400).json({ code: 400, message: err.message })
  }
}
