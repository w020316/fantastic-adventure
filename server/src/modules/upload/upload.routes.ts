import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { config } from '../../config'
import { uploadFile } from './upload.controller'
import { authMiddleware } from '../../middleware/auth'

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
})

const router = Router()

router.post('/', authMiddleware, upload.single('file'), uploadFile)

export default router
