import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
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
  account: z.string(),
  password: z.string(),
})

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const validated = registerSchema.parse(data)

    const existUser = await User.findOne({
      where: {
        [Symbol.for('or') as any]: [
          { username: validated.username },
          { email: validated.email },
        ],
      } as any,
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

    const userData = user.toJSON() as any
    delete userData.password

    return { token, user: userData }
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const validated = loginSchema.parse(data)

    const user = await User.findOne({
      where: {
        [Symbol.for('or') as any]: [
          { username: validated.account },
          { email: validated.account },
        ],
      } as any,
      include: [{ model: Expert, as: 'expert' }],
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    const isValid = await bcrypt.compare(validated.password, user.password)
    if (!isValid) {
      throw new Error('密码错误')
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role } as object,
      jwtConfig.secret as jwt.Secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    )

    const userData = user.toJSON() as any
    delete userData.password

    return { token, user: userData }
  }

  static async getCurrentUser(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Expert, as: 'expert' }],
    })
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }
}

export default AuthService
