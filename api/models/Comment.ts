import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface CommentAttributes {
  id: number
  postId: number
  userId: number
  parentId?: number
  content: string
  likeCount?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'parentId' | 'likeCount' | 'createdAt' | 'updatedAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  declare id: number
  declare postId: number
  declare userId: number
  declare parentId?: number
  declare content: string
  declare likeCount?: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
)

export default Comment
