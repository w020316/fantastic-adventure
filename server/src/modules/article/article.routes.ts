import { Router } from 'express'
import { body, query } from 'express-validator'
import { list, detail, create, update, remove, like, related } from './article.controller'
import { authMiddleware } from '../../middleware/auth'
import { handleValidation } from '../../middleware/errorHandler'
import { likeLimiter } from '../../middleware/rateLimiter'

const router = Router()

router.get('/', list)
router.get('/:id', detail)
router.get('/:id/related', related)
router.post('/', authMiddleware, body('title').notEmpty().withMessage('标题不能为空'), body('content').notEmpty().withMessage('内容不能为空'), handleValidation, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)
router.post('/:id/like', likeLimiter, like)

export default router
