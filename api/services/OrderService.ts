import { z } from 'zod'
import { Order, Product, User } from '../models/index.js'
import { sequelize } from '../config/database.js'

const createOrderSchema = z.object({
  productId: z.number(),
  address: z.string().optional(),
  phone: z.string().optional(),
  remark: z.string().optional(),
})

const updateOrderStatusSchema = z.object({
  status: z.enum(['paid', 'shipped', 'completed', 'cancelled', 'refunded']),
})

function generateOrderNo(): string {
  const now = new Date()
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `MC${timestamp}${random}`
}

export class OrderService {
  static async create(buyerId: number, data: z.infer<typeof createOrderSchema>) {
    const validated = createOrderSchema.parse(data)

    const product = await Product.findByPk(validated.productId)
    if (!product) {
      throw new Error('商品不存在')
    }
    if (product.status !== 'available') {
      throw new Error('商品已被锁定或已售出')
    }
    if (product.sellerId === buyerId) {
      throw new Error('不能购买自己的商品')
    }

    await product.update({ status: 'reserved' })

    try {
      const order = await Order.create({
        orderNo: generateOrderNo(),
        productId: validated.productId,
        buyerId,
        sellerId: product.sellerId,
        price: product.suggestedPrice || product.originalPrice,
        status: 'pending',
        address: validated.address,
        phone: validated.phone,
        remark: validated.remark,
      })

      return order
    } catch (error) {
      await product.update({ status: 'available' })
      throw error
    }
  }

  static async getList(params: {
    page?: number
    pageSize?: number
    userId: number
    userRole: string
    role?: 'buyer' | 'seller'
    status?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const where: any = {}
    if (params.role === 'buyer') {
      where.buyerId = params.userId
    } else if (params.role === 'seller') {
      where.sellerId = params.userId
    } else {
      where['any'] = true
      where['buyerId'] = params.userId
      const sellerWhere = { sellerId: params.userId }
      return this.getMixedList(params)
    }

    if (params.status) {
      where.status = params.status
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nickname', 'avatar'],
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

  private static async getMixedList(params: {
    page?: number
    pageSize?: number
    userId: number
    status?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const where: any = {
      $or$: [{ buyerId: params.userId }, { sellerId: params.userId }],
    }
    if (params.status) {
      where.status = params.status
    }

    const { Op } = await import('sequelize')
    const actualWhere: any = {
      [Op.or]: [{ buyerId: params.userId }, { sellerId: params.userId }],
    }
    if (params.status) {
      actualWhere.status = params.status
    }

    const { count, rows } = await Order.findAndCountAll({
      where: actualWhere,
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nickname', 'avatar'],
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

  static async getById(orderId: number, userId: number, role?: string) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'nickname', 'avatar', 'phone'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nickname', 'avatar', 'phone'],
        },
      ],
    })

    if (!order) {
      throw new Error('订单不存在')
    }

    if (order.buyerId !== userId && order.sellerId !== userId && role !== 'admin') {
      throw new Error('无权限查看此订单')
    }

    return order
  }

  static async getStats(userId: number) {
    const { Op } = await import('sequelize')

    const where = {
      [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
    }

    const all = await Order.count({ where })

    const statusList = await Order.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ] as any,
      group: ['status'],
      raw: true,
    })

    const counts: Record<string, number> = {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
    }

    for (const row of statusList as any[]) {
      counts[row.status] = Number(row.count)
    }

    return {
      total: all,
      pending: counts.pending,
      paid: counts.paid,
      shipped: counts.shipped,
      completed: counts.completed,
      cancelled: counts.cancelled,
      refunded: counts.refunded,
    }
  }

  static async delete(orderId: number, userId: number, role?: string) {
    const order = await Order.findByPk(orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    const isBuyer = order.buyerId === userId
    const isSeller = order.sellerId === userId
    const isAdmin = role === 'admin'

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error('无权限删除此订单')
    }

    if (!['completed', 'cancelled', 'refunded'].includes(order.status)) {
      throw new Error('只能删除已完成、已取消或已退款的订单')
    }

    await order.destroy()
    return { success: true }
  }

  static async updateStatus(orderId: number, userId: number, data: z.infer<typeof updateOrderStatusSchema>, role?: string) {
    const validated = updateOrderStatusSchema.parse(data)
    const order = await Order.findByPk(orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    const product = await Product.findByPk(order.productId)
    if (!product) {
      throw new Error('关联商品不存在')
    }

    const isBuyer = order.buyerId === userId
    const isSeller = order.sellerId === userId
    const isAdmin = role === 'admin'

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error('无权限操作此订单')
    }

    switch (validated.status) {
      case 'paid':
        if (!isBuyer && !isAdmin) throw new Error('只有买家可以付款')
        if (order.status !== 'pending') throw new Error('订单状态不正确')
        await order.update({ status: 'paid', paidAt: new Date() })
        break

      case 'shipped':
        if (!isSeller && !isAdmin) throw new Error('只有卖家可以发货')
        if (order.status !== 'paid') throw new Error('订单状态不正确')
        await order.update({ status: 'shipped', shippedAt: new Date() })
        break

      case 'completed':
        if (!isBuyer && !isAdmin) throw new Error('只有买家可以确认收货')
        if (order.status !== 'shipped') throw new Error('订单状态不正确')
        await order.update({ status: 'completed', completedAt: new Date() })
        await product.update({ status: 'sold' })
        break

      case 'cancelled':
        if (!isBuyer && !isAdmin) throw new Error('只有买家可以取消订单')
        if (order.status !== 'pending') throw new Error('只能取消待付款订单')
        await order.update({ status: 'cancelled' })
        await product.update({ status: 'available' })
        break

      case 'refunded':
        if (!isAdmin) throw new Error('只有管理员可以执行退款')
        if (!['paid', 'shipped'].includes(order.status)) throw new Error('订单状态不正确')
        await order.update({ status: 'refunded' })
        await product.update({ status: 'available' })
        break
    }

    return order.reload()
  }
}

export default OrderService
