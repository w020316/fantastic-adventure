import { Router } from 'express'
import { body } from 'express-validator'
import { record, overview, trend } from './stats.controller'
import { authMiddleware } from '../../middleware/auth'
import { handleValidation } from '../../middleware/errorHandler'
import { statsLimiter } from '../../middleware/rateLimiter'

const router = Router()

router.post('/', statsLimiter, body('path').notEmpty().withMessage('路径不能为空'), handleValidation, record)
router.get('/overview', authMiddleware, overview)
router.get('/trend', authMiddleware, trend)

export default router
