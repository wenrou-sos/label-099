import { Op } from 'sequelize'
import { z } from 'zod'
import { Product, User, Favorite } from '../models/index.js'

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().min(1),
  originalPrice: z.number().positive(),
  suggestedPrice: z.number().positive().optional(),
  condition: z.enum(['new', 'like_new', 'minor', 'visible']),
  images: z.array(z.string()).optional(),
  location: z.string().optional(),
})

export const CONDITION_RATIOS: Record<string, { ratio: number; float: number }> = {
  new: { ratio: 0.70, float: 0.05 },
  like_new: { ratio: 0.60, float: 0.05 },
  minor: { ratio: 0.45, float: 0.05 },
  visible: { ratio: 0.30, float: 0.05 },
}

export const CONDITION_LABELS: Record<string, string> = {
  new: '全新',
  like_new: '99新',
  minor: '轻微使用',
  visible: '明显使用',
}

export class ProductService {
  static suggestPrice(condition: string, originalPrice: number) {
    const config = CONDITION_RATIOS[condition]
    if (!config) {
      throw new Error('无效的成色参数')
    }
    const basePrice = originalPrice * config.ratio
    const minPrice = Math.round(basePrice * (1 - config.float))
    const maxPrice = Math.round(basePrice * (1 + config.float))
    const suggestedPrice = Math.round(basePrice)
    return {
      minPrice,
      maxPrice,
      suggestedPrice,
      conditionLabel: CONDITION_LABELS[condition],
      ratio: config.ratio * 100,
    }
  }

  static async getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
    condition?: string
    status?: string
    sellerId?: number
    minPrice?: number
    maxPrice?: number
    sort?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 12
    const offset = (page - 1) * pageSize

    const where: any = {}
    if (params.keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${params.keyword}%` } },
        { description: { [Op.like]: `%${params.keyword}%` } },
      ]
    }
    if (params.category) {
      where.category = params.category
    }
    if (params.condition) {
      where.condition = params.condition
    }
    if (params.status) {
      where.status = params.status
    } else {
      where.status = { [Op.in]: ['available', 'reserved'] }
    }
    if (params.sellerId) {
      where.sellerId = params.sellerId
    }
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.suggestedPrice = {}
      if (params.minPrice !== undefined) {
        where.suggestedPrice[Op.gte] = params.minPrice
      }
      if (params.maxPrice !== undefined) {
        where.suggestedPrice[Op.lte] = params.maxPrice
      }
    }

    let order: any = [['createdAt', 'DESC']]
    if (params.sort === 'price_asc') {
      order = [['suggestedPrice', 'ASC']]
    } else if (params.sort === 'price_desc') {
      order = [['suggestedPrice', 'DESC']]
    } else if (params.sort === 'hot') {
      order = [['viewCount', 'DESC'], ['favoriteCount', 'DESC']]
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nickname', 'avatar'],
        },
      ],
      limit: pageSize,
      offset,
      order,
    })

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    }
  }

  static async getById(id: number, currentUserId?: number) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nickname', 'avatar', 'bio', 'level'],
        },
      ],
    })
    if (!product) {
      throw new Error('商品不存在')
    }

    await product.increment('viewCount')

    let favorited = false
    if (currentUserId) {
      favorited = await Favorite.count({
        where: { userId: currentUserId, targetType: 'product', targetId: id },
      }) > 0
    }

    return {
      ...product.toJSON(),
      favorited,
    }
  }

  static async create(sellerId: number, data: z.infer<typeof createProductSchema>) {
    const validated = createProductSchema.parse(data)
    let suggestedPrice = validated.suggestedPrice
    if (!suggestedPrice) {
      const suggestion = this.suggestPrice(validated.condition, validated.originalPrice)
      suggestedPrice = suggestion.suggestedPrice
    }
    const product = await Product.create({
      ...validated,
      sellerId,
      suggestedPrice,
      images: validated.images as any,
    })
    return product
  }

  static async update(sellerId: number, productId: number, data: Partial<z.infer<typeof createProductSchema>>, role?: string) {
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new Error('商品不存在')
    }
    if (product.sellerId !== sellerId && role !== 'admin') {
      throw new Error('无权限修改')
    }
    await product.update(data as any)
    return product
  }

  static async delete(sellerId: number, productId: number, role?: string) {
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new Error('商品不存在')
    }
    if (product.sellerId !== sellerId && role !== 'admin') {
      throw new Error('无权限删除')
    }
    await product.destroy()
    return true
  }

  static async toggleFavorite(userId: number, productId: number) {
    const existing = await Favorite.findOne({
      where: { userId, targetType: 'product', targetId: productId },
    })

    const product = await Product.findByPk(productId)
    if (!product) {
      throw new Error('商品不存在')
    }

    if (existing) {
      await existing.destroy()
      await product.decrement('favoriteCount')
      return { favorited: false, favoriteCount: (product.favoriteCount || 0) - 1 }
    } else {
      await Favorite.create({ userId, targetType: 'product', targetId: productId })
      await product.increment('favoriteCount')
      return { favorited: true, favoriteCount: (product.favoriteCount || 0) + 1 }
    }
  }

  static async getMyFavorites(userId: number, params: { page?: number; pageSize?: number }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 12
    const offset = (page - 1) * pageSize

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId, targetType: 'product' },
      include: [
        {
          model: Product,
          as: 'product' as any,
          foreignKey: 'targetId',
          constraints: false,
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'nickname', 'avatar'],
            },
          ],
        } as any,
      ],
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
    })

    const products = rows.map((row: any) => row.Product).filter(Boolean)

    return {
      list: products,
      total: count,
      page,
      pageSize,
    }
  }
}

export default ProductService
