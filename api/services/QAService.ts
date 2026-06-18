import { Op } from 'sequelize'
import { z } from 'zod'
import { Question, User, Watch, Expert } from '../models/index.js'

const createQuestionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string().optional(),
  expertId: z.number().optional(),
  price: z.number().min(0).optional().default(0),
  images: z.array(z.string()).optional(),
})

const answerQuestionSchema = z.object({
  answer: z.string().min(1),
  answerImages: z.array(z.string()).optional(),
})

export class QAService {
  static async create(askerId: number, data: z.infer<typeof createQuestionSchema>) {
    const validated = createQuestionSchema.parse(data)

    let price = validated.price || 0
    if (validated.expertId) {
      const expert = await Expert.findOne({ where: { userId: validated.expertId } })
      if (expert) {
        price = price || Number(expert.consultPrice)
      }
    }

    const question = await Question.create({
      ...validated,
      askerId,
      price,
      status: validated.expertId ? 'accepted' : 'pending',
      images: validated.images as any,
    })

    return question
  }

  static async getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
    status?: string
    expertId?: number
    askerId?: number
    sort?: string
  }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const offset = (page - 1) * pageSize

    const where: any = {}
    if (params.keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${params.keyword}%` } },
        { content: { [Op.like]: `%${params.keyword}%` } },
      ]
    }
    if (params.category) {
      where.category = params.category
    }
    if (params.status) {
      where.status = params.status
    }
    if (params.expertId) {
      where.expertId = params.expertId
    }
    if (params.askerId) {
      where.askerId = params.askerId
    }

    let order: any = [['createdAt', 'DESC']]
    if (params.sort === 'hot') {
      order = [['watchCount', 'DESC'], ['createdAt', 'DESC']]
    }

    const { count, rows } = await Question.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'asker',
          attributes: ['id', 'nickname', 'avatar', 'level'],
        },
        {
          model: User,
          as: 'expert',
          attributes: ['id', 'nickname', 'avatar'],
          include: [
            {
              model: Expert,
              as: 'expert',
            },
          ],
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
    const question = await Question.findByPk(id, {
      include: [
        {
          model: User,
          as: 'asker',
          attributes: ['id', 'nickname', 'avatar', 'level', 'bio'],
        },
        {
          model: User,
          as: 'expert',
          attributes: ['id', 'nickname', 'avatar', 'bio'],
          include: [
            {
              model: Expert,
              as: 'expert',
            },
          ],
        },
      ],
    })

    if (!question) {
      throw new Error('问题不存在')
    }

    let watched = false
    if (currentUserId) {
      watched = await Watch.count({
        where: { userId: currentUserId, questionId: id },
      }) > 0
    }

    return {
      ...question.toJSON(),
      watched,
    }
  }

  static async answer(expertId: number, questionId: number, data: z.infer<typeof answerQuestionSchema>) {
    const validated = answerQuestionSchema.parse(data)
    const question = await Question.findByPk(questionId)
    if (!question) {
      throw new Error('问题不存在')
    }

    if (question.expertId && question.expertId !== expertId) {
      throw new Error('这不是分配给您的问题')
    }

    if (question.status === 'closed') {
      throw new Error('问题已关闭')
    }

    await question.update({
      expertId,
      answer: validated.answer,
      answerImages: validated.answerImages as any,
      status: 'answered',
      answeredAt: new Date(),
    })

    return question.reload()
  }

  static async toggleWatch(userId: number, questionId: number) {
    const existing = await Watch.findOne({
      where: { userId, questionId },
    })

    const question = await Question.findByPk(questionId)
    if (!question) {
      throw new Error('问题不存在')
    }

    if (existing) {
      await existing.destroy()
      await question.decrement('watchCount')
      return { watched: false, watchCount: (question.watchCount || 0) - 1 }
    } else {
      await Watch.create({ userId, questionId })
      await question.increment('watchCount')
      return { watched: true, watchCount: (question.watchCount || 0) + 1 }
    }
  }

  static async acceptExpert(askerId: number, questionId: number, expertId: number) {
    const question = await Question.findByPk(questionId)
    if (!question) {
      throw new Error('问题不存在')
    }
    if (question.askerId !== askerId) {
      throw new Error('只有提问者可以选择专家')
    }

    const expert = await Expert.findOne({ where: { userId: expertId } })
    let price = question.price
    if (expert) {
      price = Number(expert.consultPrice)
    }

    await question.update({
      expertId,
      status: 'accepted',
      price,
    })

    return question.reload()
  }

  static async close(userId: number, questionId: number, role?: string) {
    const question = await Question.findByPk(questionId)
    if (!question) {
      throw new Error('问题不存在')
    }
    if (question.askerId !== userId && role !== 'admin') {
      throw new Error('无权限关闭')
    }
    await question.update({ status: 'closed' })
    return true
  }
}

export default QAService
