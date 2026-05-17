import { Router } from 'express'
import { body } from 'express-validator'
import { list, create, update, remove } from './tag.controller'
import { authMiddleware } from '../../middleware/auth'
import { handleValidation } from '../../middleware/errorHandler'

const router = Router()

router.get('/', list)
router.post('/', authMiddleware, body('name').notEmpty().withMessage('标签名不能为空'), handleValidation, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)

export default router
