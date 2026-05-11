import { Router } from 'express'
import { body } from 'express-validator'
import { login, getProfile, refreshToken, updatePassword, updateAvatar } from './auth.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.post('/login', body('username').notEmpty().withMessage('用户名不能为空'), body('password').notEmpty().withMessage('密码不能为空'), login)
router.post('/refresh', refreshToken)
router.get('/profile', authMiddleware, getProfile)
router.put('/password', authMiddleware, body('old_password').notEmpty().withMessage('原密码不能为空'), body('new_password').isLength({ min: 6 }).withMessage('新密码至少6位'), updatePassword)
router.put('/avatar', authMiddleware, body('avatar').notEmpty().withMessage('头像URL不能为空'), updateAvatar)

export default router
