import { Router, type Request, type Response } from 'express'
import { authGuard, optionalAuth } from '../middleware/auth.js'
import ProductService from '../services/ProductService.js'
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

router.get('/suggest-price', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    Promise.resolve(ProductService.suggestPrice(
      req.query.condition as string,
      Number(req.query.originalPrice)
    ))
  )
})

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    ProductService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      keyword: req.query.keyword as string,
      category: req.query.category as string,
      condition: req.query.condition as string,
      status: req.query.status as string,
      sellerId: req.query.sellerId ? Number(req.query.sellerId) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort as string,
    })
  )
})

router.get('/favorites', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    ProductService.getMyFavorites(req.user!.id, {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    })
  )
})

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const currentUserId = req.user ? req.user.id : undefined
  await handle(res, () => ProductService.getById(Number(req.params.id), currentUserId))
})

router.post('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => ProductService.create(req.user!.id, req.body))
})

router.put('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    ProductService.update(req.user!.id, Number(req.params.id), req.body, req.user!.role)
  )
})

router.delete('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    ProductService.delete(req.user!.id, Number(req.params.id), req.user!.role)
  )
})

router.post('/:id/favorite', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => ProductService.toggleFavorite(req.user!.id, Number(req.params.id)))
})

export default router
