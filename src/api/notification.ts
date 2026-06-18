import { get, post } from './http'
import type { Notification, ListResponse, PaginationParams } from '../../shared/types'

export function getNotificationList(params: PaginationParams & { isRead?: boolean }): Promise<ListResponse<Notification>> {
  return get('/notifications', params)
}

export function markNotificationRead(id: number): Promise<void> {
  return post(`/notifications/${id}/read`)
}

export function readAllNotifications(): Promise<void> {
  return post('/notifications/read-all')
}

export function getUnreadCount(): Promise<{ count: number }> {
  return get('/notifications/unread-count')
}
