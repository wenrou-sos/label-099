import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../config/database.js'
import { User } from '../models/index.js'

declare module 'express' {
  interface Request {
    user?: User | null
  }
}

export interface JwtPayload {
  userId: number
  username: string
  role: string
}

export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ code: 401, data: null, message: '未登录或登录已过期' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      res.status(401).json({ code: 401, data: null, message: '用户不存在' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ code: 401, data: null, message: 'Token无效或已过期' })
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
      })
      req.user = user
    }
  } catch {
    req.user = null
  }
  next()
}

export const requireExpert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ code: 401, data: null, message: '请先登录' })
    return
  }
  if (req.user.role !== 'expert' && req.user.role !== 'admin') {
    res.status(403).json({ code: 403, data: null, message: '需要专家权限' })
    return
  }
  next()
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ code: 401, data: null, message: '请先登录' })
    return
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ code: 403, data: null, message: '需要管理员权限' })
    return
  }
  next()
}
