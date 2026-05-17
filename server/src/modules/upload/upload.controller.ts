import { Request, Response } from 'express'
import { asyncHandler, createError } from '../../middleware/errorHandler'

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw createError(400, '请选择文件')
  }
  const fileUrl = `/uploads/${req.file.filename}`
  res.json({ code: 200, message: '上传成功', data: { url: fileUrl, filename: req.file.filename } })
})
