import { get, post, put } from './http'
import type { Order, ListResponse, PaginationParams, CreateOrderParams, OrderStatus } from '../../shared/types'

export function getOrderList(
  params: PaginationParams & { status?: OrderStatus; role?: 'buyer' | 'seller' }
): Promise<ListResponse<Order>> {
  return get('/orders', params)
}

export function getOrder(id: number): Promise<Order> {
  return get(`/orders/${id}`)
}

export function createOrder(data: CreateOrderParams): Promise<Order> {
  return post('/orders', data)
}

export function payOrder(id: number): Promise<Order> {
  return post(`/orders/${id}/pay`)
}

export function shipOrder(id: number, data: { trackingNo: string }): Promise<Order> {
  return post(`/orders/${id}/ship`, data)
}

export function receiveOrder(id: number): Promise<Order> {
  return post(`/orders/${id}/receive`)
}
