import { Router, type Request, type Response } from 'express'
import { authGuard, optionalAuth } from '../middleware/auth.js'
import UserService from '../services/UserService.js'
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

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    UserService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      keyword: req.query.keyword as string,
      role: req.query.role as string,
    })
  )
})

router.get('/experts', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    UserService.getExperts({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      specialty: req.query.specialty as string,
      keyword: req.query.keyword as string,
    })
  )
})

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () => UserService.getById(Number(req.params.id)))
})

router.get('/:id/stats', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () => UserService.getSellerStats(Number(req.params.id)))
})

router.put('/profile', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => UserService.updateProfile(req.user!.id, req.body))
})

router.put('/password', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => UserService.changePassword(req.user!.id, req.body))
})

export default router
