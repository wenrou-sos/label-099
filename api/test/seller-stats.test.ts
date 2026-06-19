import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { sequelize } from '../config/database.js'
import { User, Order, Review, Product } from '../models/index.js'
import UserService from '../services/UserService.js'

describe('卖家成交数据统计', () => {
  let seller1: User
  let seller2: User
  let buyer1: User
  let product1: Product

  beforeAll(async () => {
    await sequelize.authenticate()
  })

  beforeEach(async () => {
    await sequelize.sync({ force: true })

    seller1 = await User.create({
      username: 'seller1',
      email: 'seller1@test.com',
      password: 'hashed',
      nickname: '卖家1',
      role: 'user',
      createdAt: new Date(Date.now() - (365 + 60) * 24 * 60 * 60 * 1000),
    } as any)

    seller2 = await User.create({
      username: 'seller2',
      email: 'seller2@test.com',
      password: 'hashed',
      nickname: '卖家2',
      role: 'user',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    } as any)

    buyer1 = await User.create({
      username: 'buyer1',
      email: 'buyer1@test.com',
      password: 'hashed',
      nickname: '买家1',
      role: 'user',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    } as any)

    product1 = await Product.create({
      userId: seller1.id,
      sellerId: seller1.id,
      title: '测试商品',
      description: '描述',
      images: '[]',
      category: 'other',
      condition: 'good',
      originalPrice: 100,
      price: 50,
      isNegotiable: false,
      status: 'sold',
      viewCount: 10,
      favoriteCount: 2,
    } as any)
  })

  afterAll(async () => {
    await sequelize.close()
  })

  it('新卖家（无成交、无评价）', async () => {
    const stats = await UserService.getSellerStats(seller2.id)
    expect(stats.completedOrders).toBe(0)
    expect(stats.totalReviews).toBe(0)
    expect(stats.goodReviews).toBe(0)
    expect(stats.positiveRate).toBe(0)
    expect(stats.isNewSeller).toBe(true)
    expect(stats.registeredDays).toBeGreaterThanOrEqual(5)
  })

  it('不存在的用户应抛出错误', async () => {
    await expect(UserService.getSellerStats(99999)).rejects.toThrow()
  })

  it('部分成交的卖家：完成2笔、评价3条（2好评1差评', async () => {
    const orders = await Promise.all([
      Order.create({
        orderNo: 'o1', sellerId: seller1.id, buyerId: buyer1.id,
        productId: product1.id, price: 50, status: 'completed',
      } as any),
      Order.create({
        orderNo: 'o2', sellerId: seller1.id, buyerId: buyer1.id,
        productId: product1.id, price: 50, status: 'completed',
      } as any),
      Order.create({
        orderNo: 'o3', sellerId: seller1.id, buyerId: buyer1.id,
        productId: product1.id, price: 50, status: 'paid',
      } as any),
    ])

    await Promise.all([
      Review.create({
        orderId: orders[0].id, fromUserId: buyer1.id, toUserId: seller1.id,
        rating: 5, content: '好评', type: 'order',
      } as any),
      Review.create({
        orderId: orders[1].id, fromUserId: buyer1.id, toUserId: seller1.id,
        rating: 4, content: '中好评', type: 'order',
      } as any),
      Review.create({
        orderId: orders[2].id, fromUserId: buyer1.id, toUserId: seller1.id,
        rating: 2, content: '差评', type: 'order',
      } as any),
    ])

    const stats = await UserService.getSellerStats(seller1.id)
    expect(stats.completedOrders).toBe(2)
    expect(stats.totalReviews).toBe(3)
    expect(stats.goodReviews).toBe(2)
    expect(stats.positiveRate).toBeCloseTo(66.7, 0)
    expect(stats.isNewSeller).toBe(false)
    expect(stats.registeredYears).toBeGreaterThanOrEqual(1)
  })

  it('100% 好评率且有成交的卖家', async () => {
    const order = await Order.create({
      orderNo: 'o4', sellerId: seller1.id, buyerId: buyer1.id,
      productId: product1.id, price: 50, status: 'completed',
    } as any)

    await Review.create({
      orderId: order.id, fromUserId: buyer1.id, toUserId: seller1.id,
      rating: 5, content: '非常好', type: 'order',
    } as any)

    const stats = await UserService.getSellerStats(seller1.id)
    expect(stats.completedOrders).toBe(1)
    expect(stats.totalReviews).toBe(1)
    expect(stats.goodReviews).toBe(1)
    expect(stats.positiveRate).toBe(100)
    expect(stats.isNewSeller).toBe(false)
  })

  it('注册时长边界：1天', async () => {
    const stats = await UserService.getSellerStats(buyer1.id)
    expect(stats.registeredDays).toBeGreaterThanOrEqual(1)
    expect(stats.registeredDays).toBeLessThan(3)
  })
})
