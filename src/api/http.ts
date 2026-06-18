import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { MessageApi } from 'naive-ui'
import type { ApiResponse } from '../../shared/types'

let message: MessageApi | null = null

export function setMessageApi(api: MessageApi) {
  message = api
}

function getMessage(): MessageApi {
  if (!message) {
    console.warn('MessageApi 未初始化，请在 App.vue setup 中调用 setMessageApi(useMessage())')
    return {
      error: (m: string) => console.error('[Error]', m),
      success: (m: string) => console.log('[Success]', m),
      warning: (m: string) => console.warn('[Warning]', m),
      info: (m: string) => console.info('[Info]', m),
      loading: () => ({ destroy: () => {} }),
    } as any
  }
  return message
}

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code === 0) {
      return res.data
    } else {
      getMessage().error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        getMessage().error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else if (status === 403) {
        getMessage().error('没有权限访问')
      } else if (status === 404) {
        getMessage().error('请求的资源不存在')
      } else if (status === 500) {
        getMessage().error('服务器错误')
      } else {
        getMessage().error(error.response?.data?.message || error.message || '网络错误')
      }
    } else {
      getMessage().error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.get(url, { params, ...config })
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.post(url, data, config)
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.put(url, data, config)
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return instance.delete(url, config)
}

export default instance
