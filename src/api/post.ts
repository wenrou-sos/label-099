import { get, post } from './http'
import type { Post, Comment, ListResponse, PaginationParams, CreatePostParams } from '../../shared/types'

export function getPostList(params: PaginationParams & { category?: string; keyword?: string; userId?: number }): Promise<ListResponse<Post>> {
  return get('/posts', params)
}

export function getPost(id: number): Promise<Post> {
  return get(`/posts/${id}`)
}

export function createPost(data: CreatePostParams): Promise<Post> {
  return post('/posts', data)
}

export function likePost(id: number): Promise<void> {
  return post(`/posts/${id}/like`)
}

export function favoritePost(id: number): Promise<void> {
  return post(`/posts/${id}/favorite`)
}

export function getPostComments(postId: number, params: PaginationParams): Promise<ListResponse<Comment>> {
  return get(`/posts/${postId}/comments`, params)
}

export function createComment(postId: number, data: { content: string; parentId?: number; replyTo?: number }): Promise<Comment> {
  return post(`/posts/${postId}/comments`, data)
}
