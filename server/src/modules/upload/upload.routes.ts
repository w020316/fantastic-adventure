import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { config } from '../../config'
import { uploadFile } from './upload.controller'
import { authMiddleware } from '../../middleware/auth'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024

const MAX_FILENAME_LENGTH = 255

function sanitizeFilename(filename: string): string {
  let sanitized = path.basename(filename)
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
  sanitized = sanitized.replace(/\.\./g, '')
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = path.extname(sanitized)
    const base = path.basename(sanitized, ext)
    sanitized = base.substring(0, MAX_FILENAME_LENGTH - ext.length) + ext
  }
  return sanitized
}

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename(_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
    const sanitized = sanitizeFilename(file.originalname)
    const ext = path.extname(sanitized)
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const ext = path.extname(file.originalname).toLowerCase()
  if (!allowed.includes(ext)) {
    cb(new Error('不支持的文件类型'))
    return
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('不支持的文件MIME类型'))
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    cb(new Error(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`))
    return
  }
  cb(null, true)
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
})

const router = Router()

router.post('/', authMiddleware, upload.single('file'), uploadFile)

export default router
