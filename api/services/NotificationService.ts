import { Op } from 'sequelize'
import { Notification } from '../models/index.js'

type NotificationType = 'system' | 'comment' | 'like' | 'favorite' | 'order' | 'question' | 'answer' | 'follow'

export class NotificationService {
  static async create(params: {
    userId: number
    type: NotificationType
    title: string
    content: string
    relatedId?: number
    relatedType?: string
  }) {
    return await Notification.create(params)
  }

  static async getList(userId: number, params: {
    page?: number
    pageSize?: number
    type?: string
    isRead?: boolean
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const offset = (page - 1) * pageSize

    const where: any = { userId }
    if (params.type) {
      where.type = params.type
    }
    if (params.isRead !== undefined) {
      where.isRead = params.isRead
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
    })

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    }
  }

  static async getUnreadCount(userId: number) {
    const count = await Notification.count({
      where: { userId, isRead: false },
    })
    return { unreadCount: count }
  }

  static async markAsRead(userId: number, notificationId?: number) {
    const where: any = { userId }
    if (notificationId) {
      where.id = notificationId
    }

    await Notification.update(
      { isRead: true },
      { where }
    )

    return true
  }

  static async delete(userId: number, notificationId: number) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    })
    if (!notification) {
      throw new Error('通知不存在')
    }
    await notification.destroy()
    return true
  }

  static async clearAll(userId: number) {
    await Notification.destroy({
      where: { userId },
    })
    return true
  }

  static async batchNotify(userIds: number[], params: {
    type: NotificationType
    title: string
    content: string
    relatedId?: number
    relatedType?: string
  }) {
    const notifications = userIds.map(userId => ({
      userId,
      type: params.type,
      title: params.title,
      content: params.content,
      relatedId: params.relatedId,
      relatedType: params.relatedType,
    }))

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications as any)
    }
    return true
  }
}

export default NotificationService
