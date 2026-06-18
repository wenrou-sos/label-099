import { Op } from 'sequelize'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { User, Expert, Post, Product, Order } from '../models/index.js'

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
})

export class UserService {
  static async getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    role?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const where: any = {}
    if (params.keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${params.keyword}%` } },
        { username: { [Op.like]: `%${params.keyword}%` } },
      ]
    }
    if (params.role) {
      where.role = params.role
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Expert, as: 'expert' }],
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

  static async getById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Expert, as: 'expert' },
      ],
    })
    if (!user) {
      throw new Error('用户不存在')
    }

    const postCount = await Post.count({ where: { userId: id } })
    const productCount = await Product.count({ where: { sellerId: id } })
    const buyerOrderCount = await Order.count({ where: { buyerId: id } })

    return {
      ...user.toJSON(),
      postCount,
      productCount,
      buyerOrderCount,
    }
  }

  static async updateProfile(userId: number, data: z.infer<typeof updateProfileSchema>) {
    const validated = updateProfileSchema.parse(data)
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    await user.update(validated)
    const updated = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Expert, as: 'expert' }],
    })
    return updated
  }

  static async changePassword(userId: number, data: z.infer<typeof changePasswordSchema>) {
    const validated = changePasswordSchema.parse(data)
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('用户不存在')
    }

    const isValid = await bcrypt.compare(validated.oldPassword, user.password)
    if (!isValid) {
      throw new Error('原密码错误')
    }

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)
    await user.update({ password: hashedPassword })
    return true
  }

  static async getExperts(params: {
    page?: number
    pageSize?: number
    specialty?: string
    keyword?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const expertWhere: any = {}
    if (params.specialty) {
      expertWhere.specialty = { [Op.like]: `%${params.specialty}%` }
    }

    const userWhere: any = { role: 'expert' }
    if (params.keyword) {
      userWhere[Op.or] = [
        { nickname: { [Op.like]: `%${params.keyword}%` } },
      ]
    }

    const { count, rows } = await Expert.findAndCountAll({
      where: expertWhere,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: { exclude: ['password'] },
        },
      ],
      limit: pageSize,
      offset,
      order: [['rating', 'DESC']],
    })

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    }
  }
}

export default UserService
