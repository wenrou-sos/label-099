import { get } from './http'
import type { User, SellerStats, ListResponse, Post, Product } from '@shared/types'

export function getUser(id: number): Promise<User & { postCount: number; productCount: number; buyerOrderCount: number }> {
  return get(`/users/${id}`)
}

export function getSellerStats(userId: number): Promise<SellerStats> {
  return get(`/users/${userId}/stats`)
}

export function getUserList(params: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
} = {}): Promise<ListResponse<User>> {
  return get('/users', params)
}

export function getUserPosts(
  userId: number,
  params: { page?: number; pageSize?: number } = {}
): Promise<ListResponse<Post>> {
  return get('/posts', { userId, ...params })
}

export function getUserProducts(
  userId: number,
  params: { page?: number; pageSize?: number } = {}
): Promise<ListResponse<Product>> {
  return get('/products', { sellerId: userId, ...params })
}
