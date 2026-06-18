import { Router, type Request, type Response } from 'express'
import { authGuard, optionalAuth } from '../middleware/auth.js'
import ReviewService from '../services/ReviewService.js'
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
    ReviewService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      toUserId: req.query.toUserId ? Number(req.query.toUserId) : undefined,
      fromUserId: req.query.fromUserId ? Number(req.query.fromUserId) : undefined,
      productId: req.query.productId ? Number(req.query.productId) : undefined,
      orderId: req.query.orderId ? Number(req.query.orderId) : undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
      type: req.query.type as string,
    })
  )
})

router.get('/product/:productId', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    ReviewService.getByProduct(Number(req.params.productId), {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    })
  )
})

router.get('/user/:userId/summary', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () => ReviewService.getUserSummary(Number(req.params.userId)))
})

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () => ReviewService.getById(Number(req.params.id)))
})

router.post('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => ReviewService.create(req.user!.id, req.body))
})

export default router
