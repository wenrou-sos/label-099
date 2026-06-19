import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { sequelize } from '../config/database.js'
import { User, Post } from '../models/index.js'
import PostService from '../services/PostService.js'
import { TEST_DB_PATH } from './setup.js'
import fs from 'fs'

describe('精华帖子功能', () => {
  let admin: User
  let moderator: User
  let normalUser: User
  let postA: Post
  let postB: Post
  let postC: Post

  beforeAll(async () => {
    await sequelize.authenticate()
  })

  beforeEach(async () => {
    await sequelize.sync({ force: true })

    admin = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'hashed',
      nickname: '管理员',
      role: 'admin',
    })
    moderator = await User.create({
      username: 'moderator',
      email: 'mod@test.com',
      password: 'hashed',
      nickname: '版主',
      role: 'moderator',
    })
    normalUser = await User.create({
      username: 'normal',
      email: 'normal@test.com',
      password: 'hashed',
      nickname: '普通用户',
      role: 'user',
    })

    const now = Date.now()
    postA = await Post.create({
      userId: admin.id,
      title: '精华帖A：高热度',
      content: '内容A',
      category: 'experience',
      likeCount: 100,
      commentCount: 50,
      isEssence: true,
      createdAt: new Date(now - 60 * 60 * 1000),
    } as any)
    postB = await Post.create({
      userId: normalUser.id,
      title: '普通帖B：低热度',
      content: '内容B',
      category: 'food',
      likeCount: 10,
      commentCount: 5,
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
    } as any)
    postC = await Post.create({
      userId: moderator.id,
      title: '普通帖C：中热度',
      content: '内容C',
      category: 'sleep',
      likeCount: 80,
      commentCount: 20,
      createdAt: new Date(now),
    } as any)
  })

  afterAll(async () => {
    await sequelize.close()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  describe('权限控制', () => {
    it('管理员可以设置精华', async () => {
      const res = await PostService.toggleEssence(admin.id, postB.id, 'admin')
      expect(res.isEssence).toBe(true)
      const updated = await Post.findByPk(postB.id)
      expect(updated?.isEssence).toBe(true)
    })

    it('版主可以设置精华', async () => {
      const res = await PostService.toggleEssence(moderator.id, postB.id, 'moderator')
      expect(res.isEssence).toBe(true)
    })

    it('普通用户不能设置精华', async () => {
      await expect(
        PostService.toggleEssence(normalUser.id, postB.id, 'user')
      ).rejects.toThrow('无权限')
    })

    it('未定义角色不能设置精华', async () => {
      await expect(
        PostService.toggleEssence(normalUser.id, postB.id, undefined)
      ).rejects.toThrow('无权限')
    })

    it('设置不存在的帖子精华抛错', async () => {
      await expect(
        PostService.toggleEssence(admin.id, 999999, 'admin')
      ).rejects.toThrow('帖子不存在')
    })
  })

  describe('精华状态切换', () => {
    it('重复调用可切换精华状态', async () => {
      const first = await PostService.toggleEssence(admin.id, postB.id, 'admin')
      expect(first.isEssence).toBe(true)

      const second = await PostService.toggleEssence(admin.id, postB.id, 'admin')
      expect(second.isEssence).toBe(false)

      const updated = await Post.findByPk(postB.id)
      expect(updated?.isEssence).toBe(false)
    })
  })

  describe('列表排序与过滤', () => {
    it('精华排序只返回精华帖子', async () => {
      const res = await PostService.getList({ sort: 'essence' })
      expect(res.total).toBe(1)
      expect(res.list[0].isEssence).toBe(true)
      expect(res.list[0].id).toBe(postA.id)
    })

    it('取消精华后精华排序不再包含该帖', async () => {
      await PostService.toggleEssence(admin.id, postA.id, 'admin')
      const res = await PostService.getList({ sort: 'essence' })
      expect(res.total).toBe(0)
    })

    it('最热排序按点赞数加评论数综合降序', async () => {
      const res = await PostService.getList({ sort: 'hot' })
      const ids = res.list.map((p: any) => p.id)
      // A: 100+50=150, C: 80+20=100, B: 10+5=15
      expect(ids).toEqual([postA.id, postC.id, postB.id])
    })

    it('最新排序按时间倒序', async () => {
      const res = await PostService.getList({ sort: 'latest' })
      const ids = res.list.map((p: any) => p.id)
      // C 最新, A 次之, B 最早
      expect(ids).toEqual([postC.id, postA.id, postB.id])
    })

    it('默认排序包含所有帖子', async () => {
      const res = await PostService.getList({})
      expect(res.total).toBe(3)
    })
  })
})
