import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface NotificationAttributes {
  id: number
  userId: number
  type: 'system' | 'comment' | 'like' | 'favorite' | 'order' | 'question' | 'answer' | 'follow'
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  isRead?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'relatedId' | 'relatedType' | 'isRead' | 'createdAt' | 'updatedAt'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  declare id: number
  declare userId: number
  declare type: 'system' | 'comment' | 'like' | 'favorite' | 'order' | 'question' | 'answer' | 'follow'
  declare title: string
  declare content: string
  declare relatedId?: number
  declare relatedType?: string
  declare isRead?: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('system', 'comment', 'like', 'favorite', 'order', 'question', 'answer', 'follow'),
      allowNull: false,
      defaultValue: 'system',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  }
)

export default Notification
