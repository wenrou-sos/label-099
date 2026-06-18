import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface OrderAttributes {
  id: number
  orderNo: string
  productId: number
  buyerId: number
  sellerId: number
  price: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  address?: string
  phone?: string
  remark?: string
  paidAt?: Date
  shippedAt?: Date
  completedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'address' | 'phone' | 'remark' | 'paidAt' | 'shippedAt' | 'completedAt' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: number
  declare orderNo: string
  declare productId: number
  declare buyerId: number
  declare sellerId: number
  declare price: number
  declare status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  declare address?: string
  declare phone?: string
  declare remark?: string
  declare paidAt?: Date
  declare shippedAt?: Date
  declare completedAt?: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
)

export default Order
