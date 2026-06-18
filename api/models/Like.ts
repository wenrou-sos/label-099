import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface LikeAttributes {
  id: number
  userId: number
  targetType: 'post' | 'comment'
  targetId: number
  createdAt?: Date
}

export interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'createdAt'> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  declare id: number
  declare userId: number
  declare targetType: 'post' | 'comment'
  declare targetId: number
  declare readonly createdAt: Date
}

Like.init(
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
    targetType: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetType', 'targetId'],
      },
    ],
  }
)

export default Like
