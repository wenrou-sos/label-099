import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface QuestionAttributes {
  id: number
  askerId: number
  expertId?: number
  title: string
  content: string
  category?: string
  images?: string
  answer?: string
  answerImages?: string
  status: 'pending' | 'accepted' | 'answered' | 'closed'
  price: number
  watchCount?: number
  createdAt?: Date
  answeredAt?: Date
  updatedAt?: Date
}

export interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id' | 'expertId' | 'category' | 'images' | 'answer' | 'answerImages' | 'watchCount' | 'answeredAt' | 'createdAt' | 'updatedAt'> {}

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  declare id: number
  declare askerId: number
  declare expertId?: number
  declare title: string
  declare content: string
  declare category?: string
  declare images?: string
  declare answer?: string
  declare answerImages?: string
  declare status: 'pending' | 'accepted' | 'answered' | 'closed'
  declare price: number
  declare watchCount?: number
  declare readonly createdAt: Date
  declare answeredAt?: Date
  declare readonly updatedAt: Date
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    askerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expertId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('images')
        return raw ? JSON.parse(raw) : []
      },
      set(value: string[]) {
        this.setDataValue('images', JSON.stringify(value || []))
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answerImages: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('answerImages')
        return raw ? JSON.parse(raw) : []
      },
      set(value: string[]) {
        this.setDataValue('answerImages', JSON.stringify(value || []))
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'answered', 'closed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    watchCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
  }
)

export default Question
