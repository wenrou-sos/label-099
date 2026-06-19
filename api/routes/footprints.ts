import { Router, type Request, type Response } from 'express'
import { authGuard } from '../middleware/auth.js'
import FootprintService from '../services/FootprintService.js'
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

router.post('/products/:productId', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    FootprintService.addFootprint(req.user!.id, Number(req.params.productId))
  )
})

router.get('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    FootprintService.getFootprints(req.user!.id, {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    })
  )
})

router.delete('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    FootprintService.deleteFootprint(req.user!.id, Number(req.params.id))
  )
})

router.delete('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => FootprintService.clearFootprints(req.user!.id))
})

export default router
