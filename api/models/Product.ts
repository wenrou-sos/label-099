import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface ProductAttributes {
  id: number
  sellerId: number
  title: string
  description: string
  category: string
  images?: string
  originalPrice: number
  suggestedPrice?: number
  condition: 'new' | 'like_new' | 'minor' | 'visible'
  status: 'available' | 'reserved' | 'sold' | 'offline'
  favoriteCount?: number
  viewCount?: number
  location?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'images' | 'suggestedPrice' | 'favoriteCount' | 'viewCount' | 'location' | 'createdAt' | 'updatedAt'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number
  declare sellerId: number
  declare title: string
  declare description: string
  declare category: string
  declare images?: string
  declare originalPrice: number
  declare suggestedPrice?: number
  declare condition: 'new' | 'like_new' | 'minor' | 'visible'
  declare status: 'available' | 'reserved' | 'sold' | 'offline'
  declare favoriteCount?: number
  declare viewCount?: number
  declare location?: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    suggestedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    condition: {
      type: DataTypes.ENUM('new', 'like_new', 'minor', 'visible'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'sold', 'offline'),
      allowNull: false,
      defaultValue: 'available',
    },
    favoriteCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  }
)

export default Product
