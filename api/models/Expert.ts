import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface ExpertAttributes {
  id: number
  userId: number
  specialty: string
  certification?: string
  experienceYears: number
  consultPrice: number
  rating?: number
  reviewCount?: number
  consultCount?: number
  verified?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ExpertCreationAttributes extends Optional<ExpertAttributes, 'id' | 'certification' | 'rating' | 'reviewCount' | 'consultCount' | 'verified' | 'createdAt' | 'updatedAt'> {}

class Expert extends Model<ExpertAttributes, ExpertCreationAttributes> implements ExpertAttributes {
  declare id: number
  declare userId: number
  declare specialty: string
  declare certification?: string
  declare experienceYears: number
  declare consultPrice: number
  declare rating?: number
  declare reviewCount?: number
  declare consultCount?: number
  declare verified?: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Expert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    certification: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    consultPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    consultCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Expert',
    tableName: 'experts',
    timestamps: true,
  }
)

export default Expert
