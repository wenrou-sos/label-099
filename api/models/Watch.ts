import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface WatchAttributes {
  id: number
  questionId: number
  userId: number
  createdAt?: Date
}

export interface WatchCreationAttributes extends Optional<WatchAttributes, 'id' | 'createdAt'> {}

class Watch extends Model<WatchAttributes, WatchCreationAttributes> implements WatchAttributes {
  declare id: number
  declare questionId: number
  declare userId: number
  declare readonly createdAt: Date
}

Watch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
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
  },
  {
    sequelize,
    modelName: 'Watch',
    tableName: 'watches',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['questionId', 'userId'],
      },
    ],
  }
)

export default Watch
