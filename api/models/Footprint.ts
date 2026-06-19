import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface FootprintAttributes {
  id: number
  userId: number
  productId: number
  createdAt?: Date
}

export interface FootprintCreationAttributes extends Optional<FootprintAttributes, 'id' | 'createdAt'> {}

class Footprint extends Model<FootprintAttributes, FootprintCreationAttributes> implements FootprintAttributes {
  declare id: number
  declare userId: number
  declare productId: number
  declare readonly createdAt: Date
}

Footprint.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Footprint',
    tableName: 'footprints',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['userId', 'createdAt'],
      },
      {
        unique: true,
        fields: ['userId', 'productId'],
      },
    ],
  }
)

export default Footprint
