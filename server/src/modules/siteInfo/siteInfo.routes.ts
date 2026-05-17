import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler'

const router = Router()

router.get('/api/site-info', asyncHandler(async (_req, res) => {
  res.json({
    code: 200,
    message: 'ok',
    data: {
      name: 'MyBlog',
      description: '分享技术思考，记录成长轨迹',
      version: '1.0.0',
      author: 'w020316',
      github: 'https://github.com/w020316',
    },
  })
}))

export default router
