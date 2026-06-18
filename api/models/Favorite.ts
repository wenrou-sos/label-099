import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface FavoriteAttributes {
  id: number
  userId: number
  targetType: 'post' | 'product'
  targetId: number
  createdAt?: Date
}

export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id' | 'createdAt'> {}

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  declare id: number
  declare userId: number
  declare targetType: 'post' | 'product'
  declare targetId: number
  declare readonly createdAt: Date
}

Favorite.init(
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
      type: DataTypes.ENUM('post', 'product'),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
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

export default Favorite
