import User from './User.js'
import Expert from './Expert.js'
import Post from './Post.js'
import Comment from './Comment.js'
import Product from './Product.js'
import Order from './Order.js'
import Review from './Review.js'
import Question from './Question.js'
import Watch from './Watch.js'
import Notification from './Notification.js'
import Favorite from './Favorite.js'
import Like from './Like.js'

User.hasOne(Expert, {
  foreignKey: 'userId',
  as: 'expert',
  onDelete: 'CASCADE',
})

Expert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts',
  onDelete: 'CASCADE',
})

Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
})

Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
  onDelete: 'CASCADE',
})

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
})

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE',
})

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
})

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parent',
})

Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'replies',
})

User.hasMany(Product, {
  foreignKey: 'sellerId',
  as: 'products',
  onDelete: 'CASCADE',
})

Product.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller',
})

Product.hasMany(Order, {
  foreignKey: 'productId',
  as: 'orders',
})

Order.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
})

User.hasMany(Order, {
  foreignKey: 'buyerId',
  as: 'buyerOrders',
  onDelete: 'CASCADE',
})

Order.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'buyer',
})

User.hasMany(Order, {
  foreignKey: 'sellerId',
  as: 'sellerOrders',
  onDelete: 'CASCADE',
})

Order.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller',
})

Order.hasMany(Review, {
  foreignKey: 'orderId',
  as: 'reviews',
  onDelete: 'CASCADE',
})

Review.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
})

Review.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
})

User.hasMany(Review, {
  foreignKey: 'fromUserId',
  as: 'fromReviews',
  onDelete: 'CASCADE',
})

Review.belongsTo(User, {
  foreignKey: 'fromUserId',
  as: 'fromUser',
})

User.hasMany(Review, {
  foreignKey: 'toUserId',
  as: 'toReviews',
  onDelete: 'CASCADE',
})

Review.belongsTo(User, {
  foreignKey: 'toUserId',
  as: 'toUser',
})

User.hasMany(Question, {
  foreignKey: 'askerId',
  as: 'askedQuestions',
  onDelete: 'CASCADE',
})

Question.belongsTo(User, {
  foreignKey: 'askerId',
  as: 'asker',
})

User.hasMany(Question, {
  foreignKey: 'expertId',
  as: 'expertQuestions',
  onDelete: 'CASCADE',
})

Question.belongsTo(User, {
  foreignKey: 'expertId',
  as: 'expert',
})

Question.hasMany(Watch, {
  foreignKey: 'questionId',
  as: 'watches',
  onDelete: 'CASCADE',
})

Watch.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question',
})

User.hasMany(Watch, {
  foreignKey: 'userId',
  as: 'watches',
  onDelete: 'CASCADE',
})

Watch.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
})

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

Product.hasMany(Favorite, {
  foreignKey: 'targetId',
  constraints: false,
  scope: { targetType: 'product' },
  as: 'favorites',
})

Post.hasMany(Favorite, {
  foreignKey: 'targetId',
  constraints: false,
  scope: { targetType: 'post' },
  as: 'favorites',
})

User.hasMany(Favorite, {
  foreignKey: 'userId',
  as: 'favorites',
  onDelete: 'CASCADE',
})

Post.hasMany(Like, {
  foreignKey: 'targetId',
  constraints: false,
  scope: { targetType: 'post' },
  as: 'likes',
})

Comment.hasMany(Like, {
  foreignKey: 'targetId',
  constraints: false,
  scope: { targetType: 'comment' },
  as: 'likes',
})

User.hasMany(Like, {
  foreignKey: 'userId',
  as: 'likes',
  onDelete: 'CASCADE',
})

export {
  User,
  Expert,
  Post,
  Comment,
  Product,
  Order,
  Review,
  Question,
  Watch,
  Notification,
  Favorite,
  Like,
}
