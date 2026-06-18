import { Sequelize } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite')

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'momcare-dev-secret-key-2024',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log('[DB] SQLite connected successfully')
    await sequelize.sync({ alter: true })
    console.log('[DB] Models synchronized')
  } catch (error) {
    console.error('[DB] Connection failed:', error)
    throw error
  }
}

export default sequelize
