import { get, post } from './http'
import type { LoginParams, LoginResponse, RegisterParams, User } from '../../shared/types'

export function login(data: LoginParams): Promise<LoginResponse> {
  return post('/auth/login', data)
}

export function register(data: RegisterParams): Promise<LoginResponse> {
  return post('/auth/register', data)
}

export function sendSms(phone: string): Promise<void> {
  return post('/auth/sms', { phone })
}

export function logout(): Promise<void> {
  return post('/auth/logout')
}

export function getProfile(): Promise<User> {
  return get('/auth/profile')
}
