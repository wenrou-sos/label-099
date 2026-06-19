import { get, post, del } from './http'
import type { Footprint, ListResponse, PaginationParams } from '../../shared/types'

export function addFootprint(productId: number): Promise<void> {
  return post(`/footprints/products/${productId}`)
}

export function getFootprints(
  params: PaginationParams
): Promise<ListResponse<Footprint>> {
  return get('/footprints', params)
}

export function deleteFootprint(id: number): Promise<void> {
  return del(`/footprints/${id}`)
}

export function clearFootprints(): Promise<void> {
  return del('/footprints')
}
