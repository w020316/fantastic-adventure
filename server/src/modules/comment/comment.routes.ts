import { Router } from 'express'
import { body } from 'express-validator'
import { listByArticle, listAll, create, updateStatus, remove } from './comment.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/articles/:articleId/comments', listByArticle)
router.post('/articles/:articleId/comments', body('nickname').notEmpty().withMessage('昵称不能为空'), body('content').notEmpty().withMessage('内容不能为空'), create)
router.get('/comments', authMiddleware, listAll)
router.put('/comments/:id/status', authMiddleware, body('status').isIn(['pending', 'approved', 'hidden']).withMessage('状态值无效'), updateStatus)
router.delete('/comments/:id', authMiddleware, remove)

export default router
