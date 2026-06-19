import { z } from 'zod'
import { Footprint, Product, User } from '../models/index.js'

const MAX_FOOTPRINTS = 100

export class FootprintService {
  static async addFootprint(userId: number, productId: number) {
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new Error('商品不存在')
    }

    const existing = await Footprint.findOne({
      where: { userId, productId },
    })

    if (existing) {
      await existing.update({ createdAt: new Date() })
    } else {
      await Footprint.create({ userId, productId })
    }

    const count = await Footprint.count({ where: { userId } })
    if (count > MAX_FOOTPRINTS) {
      const extras = await Footprint.findAll({
        where: { userId },
        order: [['createdAt', 'ASC']],
        limit: count - MAX_FOOTPRINTS,
      })
      const ids = extras.map((e) => e.id)
      if (ids.length) {
        await Footprint.destroy({ where: { id: ids } })
      }
    }

    return true
  }

  static async getFootprints(userId: number, params: { page?: number; pageSize?: number }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const offset = (page - 1) * pageSize

    const { count, rows } = await Footprint.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'nickname', 'avatar'],
            },
          ],
        },
      ],
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
    })

    const list = rows
      .filter((r) => (r as any).product)
      .map((r) => {
        const record = r.toJSON() as any
        return {
          id: record.id,
          userId: record.userId,
          productId: record.productId,
          product: record.product,
          viewedAt: record.createdAt,
        }
      })

    return {
      list,
      total: count,
      page,
      pageSize,
    }
  }

  static async deleteFootprint(userId: number, footprintId: number) {
    const footprint = await Footprint.findOne({
      where: { id: footprintId, userId },
    })
    if (!footprint) {
      throw new Error('足迹不存在')
    }
    await footprint.destroy()
    return true
  }

  static async clearFootprints(userId: number) {
    await Footprint.destroy({ where: { userId } })
    return true
  }
}

export default FootprintService
