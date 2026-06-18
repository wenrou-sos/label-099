import { Router, type Request, type Response } from 'express'
import { authGuard, optionalAuth } from '../middleware/auth.js'
import PostService from '../services/PostService.js'
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
    PostService.getList({
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      keyword: req.query.keyword as string,
      category: req.query.category as string,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      sort: req.query.sort as string,
    })
  )
})

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const currentUserId = req.user ? req.user.id : undefined
  await handle(res, () => PostService.getById(Number(req.params.id), currentUserId))
})

router.post('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.create(req.user!.id, req.body))
})

router.delete('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.delete(req.user!.id, Number(req.params.id), req.user!.role))
})

router.post('/:id/like', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.toggleLike(req.user!.id, Number(req.params.id)))
})

router.post('/:id/favorite', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.toggleFavorite(req.user!.id, Number(req.params.id)))
})

router.get('/:id/comments', optionalAuth, async (req: Request, res: Response) => {
  await handle(res, () =>
    PostService.getComments(Number(req.params.id), {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    })
  )
})

router.post('/:id/comments', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.addComment(req.user!.id, Number(req.params.id), req.body))
})

router.post('/comments/:commentId/like', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => PostService.toggleCommentLike(req.user!.id, Number(req.params.commentId)))
})

export default router
