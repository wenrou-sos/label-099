import { Router, type Request, type Response } from 'express'
import { authGuard } from '../middleware/auth.js'
import AuthService from '../services/AuthService.js'
import { z } from 'zod'

const router = Router()

const handle = async (
  res: Response,
  fn: () => Promise<any>
) => {
  try {
    const data = await fn()
    res.json({ code: 0, data, message: 'success' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 400,
        data: null,
        message: error.errors[0]?.message || '参数校验失败',
      })
    } else {
      res.status(400).json({
        code: 400,
        data: null,
        message: error.message || '操作失败',
      })
    }
  }
}

router.post('/register', async (req: Request, res: Response) => {
  await handle(res, () => AuthService.register(req.body))
})

router.post('/login', async (req: Request, res: Response) => {
  await handle(res, () => AuthService.login(req.body))
})

router.get('/me', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => AuthService.getCurrentUser(req.user!.id))
})

router.post('/logout', authGuard, async (req: Request, res: Response) => {
  res.json({ code: 0, data: true, message: '退出成功' })
})

export default router
