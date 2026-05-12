import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { config } from '../../config'
import { uploadFile } from './upload.controller'
import { authMiddleware } from '../../middleware/auth'

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename(_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'))
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
})

const router = Router()

router.post('/', authMiddleware, upload.single('file'), uploadFile)

export default router
