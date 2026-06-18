import { Router, type Request, type Response } from 'express'
import { authGuard, optionalAuth, requireExpert } from '../middleware/auth.js'
import QAService from '../services/QAService.js'
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
    QAService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      keyword: req.query.keyword as string,
      category: req.query.category as string,
      status: req.query.status as string,
      expertId: req.query.expertId ? Number(req.query.expertId) : undefined,
      askerId: req.query.askerId ? Number(req.query.askerId) : undefined,
      sort: req.query.sort as string,
    })
  )
})

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const currentUserId = req.user ? req.user.id : undefined
  await handle(res, () => QAService.getById(Number(req.params.id), currentUserId))
})

router.post('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => QAService.create(req.user!.id, req.body))
})

router.post('/:id/answer', authGuard, requireExpert, async (req: Request, res: Response) => {
  await handle(res, () => QAService.answer(req.user!.id, Number(req.params.id), req.body))
})

router.post('/:id/watch', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => QAService.toggleWatch(req.user!.id, Number(req.params.id)))
})

router.put('/:id/accept', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    QAService.acceptExpert(req.user!.id, Number(req.params.id), req.body.expertId)
  )
})

router.put('/:id/close', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => QAService.close(req.user!.id, Number(req.params.id), req.user!.role))
})

export default router
