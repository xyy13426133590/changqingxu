/**
 * API 配置和请求工具
 * 长情许交友小程序 - 后端 API 对接
 */

export const USE_CLOUD = import.meta.env.VITE_USE_CLOUD === 'true'

// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// WebSocket 地址
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000/chat'

// 请求配置
interface RequestConfig extends Omit<UniApp.RequestOptions, 'success' | 'fail'> {
  skipAuth?: boolean
}

// 响应结构
export interface ApiResponse<T = any> {
  code: string
  message: string
  data: T
  timestamp: string
}

/**
 * 获取存储的 Token
 */
export function getToken(): string | null {
  return uni.getStorageSync('token') || null
}

/**
 * 获取存储的 Refresh Token
 */
export function getRefreshToken(): string | null {
  return uni.getStorageSync('refreshToken') || null
}

/**
 * 保存 Token
 */
export function setToken(token: string, refreshToken: string): void {
  uni.setStorageSync('token', token)
  uni.setStorageSync('refreshToken', refreshToken)
}

/**
 * 清除 Token
 */
export function clearToken(): void {
  uni.removeStorageSync('token')
  uni.removeStorageSync('refreshToken')
}

/**
 * 统一请求方法
 */
export function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.header,
    }

    // 添加认证头
    if (token && !config.skipAuth) {
      header['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      ...config,
      url: `${API_BASE_URL}${config.url}`,
      header,
      success: (res) => {
        const response = res.data as ApiResponse<T>

        // 处理 HTTP 错误
        if (res.statusCode >= 400) {
          uni.showToast({
            title: response?.message || '请求失败',
            icon: 'none',
          })
          reject(new Error(response?.message || '请求失败'))
          return
        }

        // 处理业务错误
        if (response.code !== 'SUCCESS') {
          // 处理 401 未授权
          if (res.statusCode === 401) {
            clearToken()
            uni.reLaunch({ url: '/pages/auth/login' })
          }
          uni.showToast({
            title: response.message || '操作失败',
            icon: 'none',
          })
          reject(new Error(response.message))
          return
        }

        resolve(response.data)
      },
      fail: () => {
        const hint = `无法连接服务器，请检查后端是否启动及 .env 中 VITE_API_BASE_URL（当前：${API_BASE_URL}）`
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2800,
        })
        reject(new Error(hint))
      },
    })
  })
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  // 构建查询字符串
  let queryString = ''
  if (params) {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    if (query) {
      queryString = `?${query}`
    }
  }

  return request<T>({
    method: 'GET',
    url: `${url}${queryString}`,
    ...config,
  })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    method: 'POST',
    url,
    data,
    ...config,
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    method: 'DELETE',
    url,
    ...config,
  })
}

/**
 * 上传文件
 */
export function uploadFile(
  url: string,
  filePath: string,
  name: string = 'file',
  formData?: Record<string, any>,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = getToken()

    uni.uploadFile({
      url: `${API_BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        const raw = res.data as string
        const statusOk = typeof res.statusCode === 'number' && res.statusCode >= 200 && res.statusCode < 300

        try {
          const data = JSON.parse(raw) as ApiResponse

          if (!statusOk || data.code !== 'SUCCESS') {
            const hint = data?.message || (statusOk ? '上传失败' : `上传失败 (${res.statusCode})`)
            uni.showToast({ title: hint, icon: 'none' })
            reject(new Error(hint))
            return
          }

          resolve(data.data)
        } catch {
          if (!statusOk) {
            const hint = typeof raw === 'string' ? `上传失败 (${res.statusCode})` : '上传失败'
            uni.showToast({ title: hint, icon: 'none' })
            reject(new Error(hint))
            return
          }
          uni.showToast({ title: '上传响应异常', icon: 'none' })
          reject(new Error('INVALID_UPLOAD_RESPONSE'))
        }
      },
      fail: reject,
    })
  })
}
