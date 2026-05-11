import { Router } from 'express'
import { body } from 'express-validator'
import { list, create, update, remove } from './project.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/', list)
router.post('/', authMiddleware, body('title').notEmpty().withMessage('项目名不能为空'), create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)

export default router
