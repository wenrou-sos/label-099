import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Op } from 'sequelize'
import { jwtConfig } from '../config/database.js'
import { User, Expert } from '../models/index.js'

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().min(1).max(50),
  role: z.enum(['user', 'expert']).optional().default('user'),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const loginSchema = z.object({
  account: z.string().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  smsCode: z.string().optional(),
  password: z.string().optional(),
}).refine((d) => d.account || d.phone || d.username, {
  message: '请输入账号/手机号/用户名',
  path: ['account'],
}).refine((d) => d.password || d.smsCode, {
  message: '请输入密码或验证码',
  path: ['password'],
})

function toApiUser(user: any): any {
  const u = (user.toJSON ? user.toJSON() : { ...user }) as any
  delete u.password
  const expertInfo = u.expert || null
  const level = u.level || 1
  const points = u.points || 0
  const creditScore = Math.min(1000, 300 + level * 60 + Math.floor(points / 10))
  return {
    id: u.id,
    username: u.username,
    phone: u.phone || '',
    email: u.email,
    avatar: u.avatar || '',
    nickname: u.nickname || u.username,
    bio: u.bio || '',
    role: u.role || 'user',
    creditScore,
    isExpert: !!(u.role === 'expert' || expertInfo),
    isTrusted: creditScore >= 800,
    level,
    points,
    expert: expertInfo,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const validated = registerSchema.parse(data)

    const existUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: validated.username },
          { email: validated.email },
        ],
      },
    })

    if (existUser) {
      throw new Error('用户名或邮箱已存在')
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const user = await User.create({
      ...validated,
      password: hashedPassword,
    })

    if (validated.role === 'expert') {
      await Expert.create({
        userId: user.id,
        specialty: '待完善',
        experienceYears: 0,
        consultPrice: 0,
      })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role } as object,
      jwtConfig.secret as jwt.Secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    )

    return { token, user: toApiUser(user) }
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const validated = loginSchema.parse(data)
    const identifier = validated.account || validated.phone || validated.username || ''

    if (validated.smsCode) {
      if (validated.smsCode !== '123456') {
        throw new Error('验证码错误（演示模式验证码：123456）')
      }
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { email: identifier },
          { phone: identifier },
        ],
      },
      include: [{ model: Expert, as: 'expert' }],
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    if (!validated.smsCode) {
      const isValid = await bcrypt.compare(validated.password || '', user.password)
      if (!isValid) {
        throw new Error('密码错误')
      }
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role } as object,
      jwtConfig.secret as jwt.Secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    )

    return { token, user: toApiUser(user) }
  }

  static async getCurrentUser(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: Expert, as: 'expert' }],
    })
    if (!user) {
      throw new Error('用户不存在')
    }
    return toApiUser(user)
  }
}

export default AuthService
