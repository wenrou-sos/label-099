import { get, post } from './http'
import type { Review, ListResponse, PaginationParams, CreateReviewParams, CreditSummary } from '../../shared/types'

export function createReview(data: CreateReviewParams): Promise<Review> {
  return post('/reviews', data)
}

export function getReviewsByUser(userId: number, params: PaginationParams): Promise<ListResponse<Review>> {
  return get(`/reviews/user/${userId}`, params)
}

export function getCreditSummary(userId: number): Promise<CreditSummary> {
  return get(`/reviews/credit-summary/${userId}`)
}
