import { Request, Response } from 'express'
import path from 'path'
import { config } from '../../config'

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ code: 400, message: '请选择文件' })
      return
    }
    const fileUrl = `/uploads/${req.file.filename}`
    res.json({ code: 200, message: '上传成功', data: { url: fileUrl, filename: req.file.filename } })
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message })
  }
}
