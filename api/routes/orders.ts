import { Router, type Request, type Response } from 'express'
import { authGuard } from '../middleware/auth.js'
import OrderService from '../services/OrderService.js'
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

router.get('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    OrderService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      userId: req.user!.id,
      userRole: req.user!.role,
      role: req.query.role as 'buyer' | 'seller' | undefined,
      status: req.query.status as string,
    })
  )
})

router.get('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    OrderService.getById(Number(req.params.id), req.user!.id, req.user!.role)
  )
})

router.post('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => OrderService.create(req.user!.id, req.body))
})

router.put('/:id/status', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    OrderService.updateStatus(Number(req.params.id), req.user!.id, req.body, req.user!.role)
  )
})

router.delete('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    OrderService.delete(Number(req.params.id), req.user!.id, req.user!.role)
  )
})

router.get('/stats/count', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => OrderService.getStats(req.user!.id))
})

export default router
