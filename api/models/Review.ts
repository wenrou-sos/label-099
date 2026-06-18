import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface ReviewAttributes {
  id: number
  orderId: number
  fromUserId: number
  toUserId: number
  productId?: number
  rating: number
  content?: string
  images?: string
  type: 'order' | 'consult'
  createdAt?: Date
  updatedAt?: Date
}

export interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'productId' | 'content' | 'images' | 'createdAt' | 'updatedAt'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: number
  declare orderId: number
  declare fromUserId: number
  declare toUserId: number
  declare productId?: number
  declare rating: number
  declare content?: string
  declare images?: string
  declare type: 'order' | 'consult'
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    content: {
      type: DataTypes.TEXT,
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
    type: {
      type: DataTypes.ENUM('order', 'consult'),
      allowNull: false,
      defaultValue: 'order',
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
  }
)

export default Review
