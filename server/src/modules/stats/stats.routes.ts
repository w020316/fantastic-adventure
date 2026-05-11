import { Router } from 'express'
import { body } from 'express-validator'
import { record, overview, trend } from './stats.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.post('/', body('path').notEmpty().withMessage('路径不能为空'), record)
router.get('/overview', authMiddleware, overview)
router.get('/trend', authMiddleware, trend)

export default router
