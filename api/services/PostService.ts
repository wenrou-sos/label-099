import { Op } from 'sequelize'
import { z } from 'zod'
import { Post, Comment, User, Like, Favorite } from '../models/index.js'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.enum(['experience', 'food', 'sleep', 'postpartum', 'other']),
  images: z.array(z.string()).optional(),
})

const createCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.number().optional(),
})

export class PostService {
  static async getList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
    userId?: number
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
    if (params.userId) {
      where.userId = params.userId
    }

    let order: any = [['createdAt', 'DESC']]
    if (params.sort === 'hot') {
      order = [
        ['isPinned', 'DESC'],
        ['likeCount', 'DESC'],
        ['viewCount', 'DESC'],
      ]
    } else {
      order = [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ]
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
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
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'avatar', 'bio'],
        },
      ],
    })
    if (!post) {
      throw new Error('帖子不存在')
    }

    await post.increment('viewCount')

    let liked = false
    let favorited = false
    if (currentUserId) {
      liked = await Like.count({
        where: { userId: currentUserId, targetType: 'post', targetId: id },
      }) > 0
      favorited = await Favorite.count({
        where: { userId: currentUserId, targetType: 'post', targetId: id },
      }) > 0
    }

    return {
      ...post.toJSON(),
      liked,
      favorited,
    }
  }

  static async create(userId: number, data: z.infer<typeof createPostSchema>) {
    const validated = createPostSchema.parse(data)
    const post = await Post.create({
      ...validated,
      userId,
      images: validated.images as any,
    })
    return post
  }

  static async delete(userId: number, postId: number, role?: string) {
    const post = await Post.findByPk(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }
    if (post.userId !== userId && role !== 'admin') {
      throw new Error('无权限删除')
    }
    await post.destroy()
    return true
  }

  static async toggleLike(userId: number, postId: number) {
    const existing = await Like.findOne({
      where: { userId, targetType: 'post', targetId: postId },
    })

    const post = await Post.findByPk(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }

    if (existing) {
      await existing.destroy()
      await post.decrement('likeCount')
      return { liked: false, likeCount: (post.likeCount || 0) - 1 }
    } else {
      await Like.create({ userId, targetType: 'post', targetId: postId })
      await post.increment('likeCount')
      return { liked: true, likeCount: (post.likeCount || 0) + 1 }
    }
  }

  static async toggleFavorite(userId: number, postId: number) {
    const existing = await Favorite.findOne({
      where: { userId, targetType: 'post', targetId: postId },
    })

    const post = await Post.findByPk(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }

    if (existing) {
      await existing.destroy()
      await post.decrement('favoriteCount')
      return { favorited: false, favoriteCount: (post.favoriteCount || 0) - 1 }
    } else {
      await Favorite.create({ userId, targetType: 'post', targetId: postId })
      await post.increment('favoriteCount')
      return { favorited: true, favoriteCount: (post.favoriteCount || 0) + 1 }
    }
  }

  static async getComments(postId: number, params: { page?: number; pageSize?: number }) {
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const offset = (page - 1) * pageSize

    const { count, rows } = await Comment.findAndCountAll({
      where: { postId, parentId: null },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'avatar'],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'nickname', 'avatar'],
            },
          ],
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

  static async addComment(userId: number, postId: number, data: z.infer<typeof createCommentSchema>) {
    const validated = createCommentSchema.parse(data)
    const post = await Post.findByPk(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }

    const comment = await Comment.create({
      ...validated,
      postId,
      userId,
    })

    await post.increment('commentCount')

    const result = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'avatar'],
        },
      ],
    })

    return result
  }

  static async toggleCommentLike(userId: number, commentId: number) {
    const existing = await Like.findOne({
      where: { userId, targetType: 'comment', targetId: commentId },
    })

    const comment = await Comment.findByPk(commentId)
    if (!comment) {
      throw new Error('评论不存在')
    }

    if (existing) {
      await existing.destroy()
      await comment.decrement('likeCount')
      return { liked: false, likeCount: (comment.likeCount || 0) - 1 }
    } else {
      await Like.create({ userId, targetType: 'comment', targetId: commentId })
      await comment.increment('likeCount')
      return { liked: true, likeCount: (comment.likeCount || 0) + 1 }
    }
  }
}

export default PostService
