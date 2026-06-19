import { get, post, put, del } from './http'
import type { Order, ListResponse, PaginationParams, CreateOrderParams, OrderStatus, OrderStats } from '../../shared/types'

const FRONT_TO_BACK_STATUS: Record<string, string> = {
  pending_payment: 'pending',
  paid: 'paid',
  shipped: 'shipped',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
  refunded: 'refunded',
}

const BACK_TO_FRONT_STATUS: Record<string, OrderStatus> = {
  pending: 'pending_payment',
  paid: 'paid',
  shipped: 'shipped',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
  refunded: 'refunded',
}

function mapOrderStatus(order: any): Order {
  if (order && order.status && BACK_TO_FRONT_STATUS[order.status]) {
    order.status = BACK_TO_FRONT_STATUS[order.status]
  }
  return order as Order
}

function mapOrderList(data: ListResponse<any>): ListResponse<Order> {
  return {
    ...data,
    list: data.list.map(mapOrderStatus),
  }
}

export function getOrderList(
  params: PaginationParams & { status?: OrderStatus; role?: 'buyer' | 'seller' }
): Promise<ListResponse<Order>> {
  const reqParams: any = { ...params }
  if (reqParams.status && FRONT_TO_BACK_STATUS[reqParams.status]) {
    reqParams.status = FRONT_TO_BACK_STATUS[reqParams.status]
  }
  return get('/orders', reqParams).then(mapOrderList)
}

export function getOrder(id: number): Promise<Order> {
  return get(`/orders/${id}`).then(mapOrderStatus)
}

export function createOrder(data: CreateOrderParams): Promise<Order> {
  return post('/orders', data).then(mapOrderStatus)
}

export function payOrder(id: number): Promise<Order> {
  return put(`/orders/${id}/status`, { status: 'paid' }).then(mapOrderStatus)
}

export function shipOrder(id: number, data: { trackingNo: string }): Promise<Order> {
  return post(`/orders/${id}/ship`, data).then(mapOrderStatus)
}

export function receiveOrder(id: number): Promise<Order> {
  return put(`/orders/${id}/status`, { status: 'delivered' }).then(mapOrderStatus)
}

export function cancelOrder(id: number): Promise<Order> {
  return put(`/orders/${id}/status`, { status: 'cancelled' }).then(mapOrderStatus)
}

export function deleteOrder(id: number): Promise<void> {
  return del(`/orders/${id}`)
}

export function getOrderStats(): Promise<OrderStats> {
  return get('/orders/stats/count').then((data: any) => ({
    total: data.total || 0,
    pending_payment: data.pending || 0,
    paid: data.paid || 0,
    shipped: data.shipped || 0,
    delivered: data.delivered || 0,
    completed: data.completed || 0,
    cancelled: data.cancelled || 0,
    refunded: data.refunded || 0,
  }))
}
