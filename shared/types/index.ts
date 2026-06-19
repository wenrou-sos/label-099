export interface User {
  id: number
  username: string
  phone: string
  avatar?: string
  nickname?: string
  bio?: string
  creditScore: number
  isExpert: boolean
  isTrusted: boolean
  createdAt: string
  updatedAt: string
}

export interface Expert extends User {
  specialty: string
  licenseNumber: string
  experienceYears: number
  verifiedAt: string
  rating: number
  reviewCount: number
}

export interface Post {
  id: number
  userId: number
  author?: User
  title: string
  content: string
  images?: string[]
  tags?: string[]
  category: string
  viewCount: number
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isFavorited?: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  userId: number
  author?: User
  parentId?: number
  replyTo?: number
  content: string
  likeCount: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export type ProductCategory = 
  | 'baby_clothes'
  | 'baby_food'
  | 'baby_toys'
  | 'baby_gear'
  | 'maternity'
  | 'diapers'
  | 'other'
  | 'stroller'
  | 'carseat'
  | 'crib'
  | 'books'
  | string

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair'

export interface Product {
  id: number
  userId: number
  seller?: User
  title: string
  description: string
  images: string[]
  category: ProductCategory
  condition: ProductCondition
  originalPrice: number
  price: number
  suggestedPrice?: number
  location?: string
  isNegotiable: boolean
  status: 'available' | 'reserved' | 'sold'
  viewCount: number
  favoriteCount: number
  isFavorited?: boolean
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: number
  orderNo: string
  buyerId: number
  sellerId: number
  buyer?: User
  seller?: User
  productId: number
  product?: Product
  amount: number
  status: OrderStatus
  address?: string
  phone?: string
  receiverName?: string
  trackingNo?: string
  paidAt?: string
  shippedAt?: string
  deliveredAt?: string
  completedAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  orderId: number
  reviewerId: number
  revieweeId: number
  reviewer?: User
  reviewee?: User
  rating: number
  content: string
  images?: string[]
  isPositive?: boolean
  createdAt: string
}

export interface Question {
  id: number
  userId: number
  author?: User
  expertId?: number
  expert?: Expert
  title: string
  content: string
  images?: string[]
  category: string
  isPublic: boolean
  viewCount: number
  isAnswered: boolean
  isWatched?: boolean
  watchCount: number
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: number
  questionId: number
  expertId: number
  expert?: Expert
  content: string
  images?: string[]
  rating?: number
  createdAt: string
  updatedAt: string
}

export type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow'
  | 'order'
  | 'answer'
  | 'system'
  | 'review'
  | 'trade'
  | 'chat'
  | 'qa'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  isRead: boolean
  createdAt: string
  extra?: Record<string, any>
}

export interface Favorite {
  id: number
  userId: number
  targetId: number
  targetType: 'post' | 'product'
  target?: Post | Product
  createdAt: string
}

export interface Footprint {
  id: number
  userId: number
  productId: number
  product?: Product
  viewedAt: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface ListResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginParams {
  phone: string
  password?: string
  smsCode?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterParams {
  phone: string
  password: string
  username: string
  smsCode: string
}

export interface CreditSummary {
  totalReviews: number
  positiveReviews: number
  neutralReviews: number
  negativeReviews: number
  averageRating: number
}

export interface CreatePostParams {
  title: string
  content: string
  images?: string[]
  tags?: string[]
  category: string
}

export interface CreateProductParams {
  title: string
  description: string
  images: string[]
  category: ProductCategory
  condition: ProductCondition
  originalPrice: number
  price: number
  location?: string
  isNegotiable: boolean
}

export interface CreateOrderParams {
  productId: number
  address: string
  phone: string
  receiverName: string
}

export interface CreateReviewParams {
  orderId: number
  rating: number
  content: string
  images?: string[]
}

export interface CreateQuestionParams {
  title: string
  content: string
  images?: string[]
  category: string
  expertId?: number
  isPublic: boolean
}

export interface CreateAnswerParams {
  questionId: number
  content: string
  images?: string[]
}

export interface OrderStats {
  total: number
  pending_payment: number
  paid: number
  shipped: number
  delivered: number
  completed: number
  cancelled: number
  refunded: number
}
