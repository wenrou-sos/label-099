import { Op } from 'sequelize'
import { z } from 'zod'
import { Review, User, Order, Product } from '../models/index.js'

const createReviewSchema = z.object({
  orderId: z.number(),
  rating: z.number().min(1).max(5),
  content: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  type: z.enum(['order', 'consult']).optional().default('order'),
})

export class ReviewService {
  static async create(fromUserId: number, data: z.infer<typeof createReviewSchema>) {
    const validated = createReviewSchema.parse(data)

    const order = await Order.findByPk(validated.orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    if (order.buyerId !== fromUserId) {
      throw new Error('只有买家可以评价')
    }
    if (order.status !== 'delivered' && order.status !== 'completed') {
      throw new Error('订单未完成，无法评价')
    }

    const existReview = await Review.findOne({
      where: { orderId: validated.orderId, fromUserId },
    })
    if (existReview) {
      throw new Error('您已评价过此订单')
    }

    const toUserId = order.sellerId

    const review = await Review.create({
      ...validated,
      fromUserId,
      toUserId,
      productId: order.productId,
      images: validated.images as any,
    })

    if (order.status === 'delivered') {
      const product = await Product.findByPk(order.productId)
      await order.update({ status: 'completed', completedAt: new Date() })
      if (product) {
        await product.update({ status: 'sold' })
      }
    }

    return review
  }

  static async getList(params: {
    page?: number
    pageSize?: number
    toUserId?: number
    fromUserId?: number
    productId?: number
    orderId?: number
    rating?: number
    type?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const where: any = {}
    if (params.toUserId) where.toUserId = params.toUserId
    if (params.fromUserId) where.fromUserId = params.fromUserId
    if (params.productId) where.productId = params.productId
    if (params.orderId) where.orderId = params.orderId
    if (params.rating) where.rating = params.rating
    if (params.type) where.type = params.type

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'images'],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo'],
        },
      ],
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

  static async getByProduct(productId: number, params: { page?: number; pageSize?: number }) {
    return this.getList({
      ...params,
      productId,
      type: 'order',
    })
  }

  static async getUserSummary(userId: number) {
    const reviews = await Review.findAll({
      where: { toUserId: userId },
    })

    const total = reviews.length
    if (total === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const averageRating = +(sum / total).toFixed(2)

    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1
    })

    return {
      averageRating,
      totalCount: total,
      ratingDistribution,
    }
  }

  static async getById(id: number) {
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: Product,
          as: 'product',
        },
      ],
    })
    if (!review) {
      throw new Error('评价不存在')
    }
    return review
  }
}

export default ReviewService
