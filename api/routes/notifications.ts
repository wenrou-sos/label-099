import { Router, type Request, type Response } from 'express'
import { authGuard } from '../middleware/auth.js'
import NotificationService from '../services/NotificationService.js'
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
    NotificationService.getList(req.user!.id, {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      type: req.query.type as string,
      isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
    })
  )
})

router.get('/unread-count', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => NotificationService.getUnreadCount(req.user!.id))
})

router.put('/read', authGuard, async (req: Request, res: Response) => {
  await handle(res, () =>
    NotificationService.markAsRead(
      req.user!.id,
      req.body.notificationId ? Number(req.body.notificationId) : undefined
    )
  )
})

router.put('/:id/read', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => NotificationService.markAsRead(req.user!.id, Number(req.params.id)))
})

router.delete('/:id', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => NotificationService.delete(req.user!.id, Number(req.params.id)))
})

router.delete('/', authGuard, async (req: Request, res: Response) => {
  await handle(res, () => NotificationService.clearAll(req.user!.id))
})

export default router
