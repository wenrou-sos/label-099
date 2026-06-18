import { DataTypes, Model, type Optional } from 'sequelize'
import { sequelize } from '../config/database.js'

export interface PostAttributes {
  id: number
  userId: number
  title: string
  content: string
  category: 'experience' | 'food' | 'sleep' | 'postpartum' | 'other'
  images?: string
  likeCount?: number
  commentCount?: number
  favoriteCount?: number
  viewCount?: number
  isPinned?: boolean
  isHot?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'images' | 'likeCount' | 'commentCount' | 'favoriteCount' | 'viewCount' | 'isPinned' | 'isHot' | 'createdAt' | 'updatedAt'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare id: number
  declare userId: number
  declare title: string
  declare content: string
  declare category: 'experience' | 'food' | 'sleep' | 'postpartum' | 'other'
  declare images?: string
  declare likeCount?: number
  declare commentCount?: number
  declare favoriteCount?: number
  declare viewCount?: number
  declare isPinned?: boolean
  declare isHot?: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Post.init(
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('experience', 'food', 'sleep', 'postpartum', 'other'),
      allowNull: false,
      defaultValue: 'other',
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
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isHot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
  }
)

export default Post
