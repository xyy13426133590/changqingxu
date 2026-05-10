/**
 * HTTP 请求封装
 * 基于 uni-app 的 uni.request
 */

// API 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.changqingxu.com'
const TIMEOUT = 10000

// 请求拦截器
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: any
  header?: Record<string, string>
  noAuth?: boolean
}

// 响应结构
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 获取 Token
function getToken(): string | null {
  return uni.getStorageSync('token') || null
}

/**
 * 基础请求方法
 */
export function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    // 构建完整 URL
    let url = config.url
    if (!url.startsWith('http')) {
      url = BASE_URL + url
    }

    // 处理查询参数
    if (config.params) {
      const queryString = Object.entries(config.params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
      url += (url.includes('?') ? '&' : '?') + queryString
    }

    // 构建请求头
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.header,
    }

    // 添加认证 token
    if (!config.noAuth) {
      const token = getToken()
      if (token) {
        header.Authorization = `Bearer ${token}`
      }
    }

    uni.request({
      url,
      method: config.method || 'GET',
      data: config.data,
      header,
      timeout: TIMEOUT,
      success: (res) => {
        const response = res.data as ApiResponse<T>

        // 处理业务状态码
        if (response.code === 200 || response.code === 0) {
          resolve(response.data)
        } else if (response.code === 401) {
          // Token 过期，清除登录状态并跳转登录
          uni.removeStorageSync('token')
          uni.showToast({ title: '登录已过期', icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/auth/welcome' })
          }, 1500)
          reject(new Error(response.message || '登录已过期'))
        } else {
          // 其他业务错误
          uni.showToast({ title: response.message || '请求失败', icon: 'none' })
          reject(new Error(response.message))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      },
    })
  })
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'GET', params, ...config })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...config })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...config })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'DELETE', params, ...config })
}

/**
 * 上传文件
 */
export function uploadFile(url: string, filePath: string, name: string = 'file'): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header: Record<string, string> = {}

    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    uni.uploadFile({
      url: url.startsWith('http') ? url : BASE_URL + url,
      filePath,
      name,
      header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200 || data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message))
          }
        } catch (_e) {
          resolve(res.data)
        }
      },
      fail: reject,
    })
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
}