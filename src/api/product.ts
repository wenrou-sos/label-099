import { get, post, put } from './http'
import type { Product, ListResponse, PaginationParams, CreateProductParams, ProductCategory, ProductCondition } from '../../shared/types'

export function getProductList(
  params: PaginationParams & {
    category?: ProductCategory
    condition?: ProductCondition
    keyword?: string
    minPrice?: number
    maxPrice?: number
    userId?: number
    status?: string
  }
): Promise<ListResponse<Product>> {
  return get('/products', params)
}

export function getProduct(id: number): Promise<Product> {
  return get(`/products/${id}`)
}

export function createProduct(data: CreateProductParams): Promise<Product> {
  return post('/products', data)
}

export function updateProduct(id: number, data: Partial<CreateProductParams> & { status?: string }): Promise<Product> {
  return put(`/products/${id}`, data)
}

export function suggestPrice(data: { category: ProductCategory; condition: ProductCondition; originalPrice: number }): Promise<{ suggestedPrice: number }> {
  return post('/products/suggest-price', data)
}

export function favoriteProduct(id: number): Promise<void> {
  return post(`/products/${id}/favorite`)
}
