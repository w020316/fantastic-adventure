import { Router } from 'express'
import { body } from 'express-validator'
import { login, getProfile, refreshToken, updatePassword, updateAvatar } from './auth.controller'
import { authMiddleware } from '../../middleware/auth'
import { handleValidation } from '../../middleware/errorHandler'
import { authLimiter } from '../../middleware/rateLimiter'

const router = Router()

router.post('/login', authLimiter, body('username').notEmpty().withMessage('用户名不能为空'), body('password').notEmpty().withMessage('密码不能为空'), handleValidation, login)
router.post('/refresh', refreshToken)
router.get('/profile', authMiddleware, getProfile)
router.put('/password', authMiddleware, body('old_password').notEmpty().withMessage('原密码不能为空'), body('new_password').isLength({ min: 6 }).withMessage('新密码至少6位'), handleValidation, updatePassword)
router.put('/avatar', authMiddleware, body('avatar').notEmpty().withMessage('头像URL不能为空'), handleValidation, updateAvatar)

export default router
