type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type ApiEnvelope<T> = {
  code: string
  message: string
  data: T
}

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const LEGACY_TOKEN_KEY = 'token'
const PINIA_USER_STORE_KEY = 'user-store'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || '').replace(/\/$/, '')

function readPiniaPersistedToken(): string {
  try {
    const raw = uni.getStorageSync(PINIA_USER_STORE_KEY)
    if (!raw) return ''
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const t = parsed?.token
    return typeof t === 'string' ? t : ''
  } catch {
    return ''
  }
}

/** 从 accessToken / token / Pinia 持久化中解析登录 token */
export function resolveAccessToken(): string {
  return (
    (uni.getStorageSync(ACCESS_TOKEN_KEY) as string) ||
    (uni.getStorageSync(LEGACY_TOKEN_KEY) as string) ||
    readPiniaPersistedToken() ||
    ''
  )
}

export function setToken(accessToken: string, refreshToken?: string): void {
  uni.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
  uni.setStorageSync(LEGACY_TOKEN_KEY, accessToken)
  if (refreshToken) {
    uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function getToken(): string {
  const token = resolveAccessToken()
  // 从旧 key 或 Pinia 读到 token 时，同步到 accessToken，供后续请求使用
  if (token && !(uni.getStorageSync(ACCESS_TOKEN_KEY) as string)) {
    uni.setStorageSync(ACCESS_TOKEN_KEY, token)
  }
  return token
}

export function getRefreshToken(): string {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || ''
}

export function clearToken(): void {
  uni.removeStorageSync(ACCESS_TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
  uni.removeStorageSync(LEGACY_TOKEN_KEY)
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function request<T>(method: HttpMethod, path: string, data?: Record<string, unknown>): Promise<T> {
  const token = getToken()
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(path),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        const statusCode = Number(res.statusCode || 0)
        const body = (res.data || {}) as Partial<ApiEnvelope<T>>
        if (statusCode === 401 || body.code === 'UNAUTHORIZED') {
          clearToken()
          reject(new Error(body.message || '请先登录'))
          return
        }
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(body.message || `请求失败: ${statusCode}`))
          return
        }
        if (body.code && body.code !== 'SUCCESS') {
          reject(new Error(body.message || '请求失败'))
          return
        }
        resolve((body.data as T) ?? (res.data as T))
      },
      fail: (err) => reject(new Error(err.errMsg || '网络异常')),
    })
  })
}

export function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return request<T>('GET', path, params)
}

export function post<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>('POST', path, data)
}

export function put<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>('PUT', path, data)
}

export function del<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>('DELETE', path, data)
}

export function uploadFile<T = any>(
  path: string,
  filePath: string,
  fieldName = 'file',
  formData: Record<string, string> = {},
): Promise<T> {
  const token = getToken()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: buildUrl(path),
      filePath,
      name: fieldName,
      formData,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        const statusCode = Number(res.statusCode || 0)
        let body: any = {}
        try {
          body = res.data ? JSON.parse(res.data) : {}
        } catch {
          reject(new Error('上传响应解析失败'))
          return
        }
        if (statusCode === 401 || body.code === 'UNAUTHORIZED') {
          clearToken()
          reject(new Error(body.message || '请先登录'))
          return
        }
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(body.message || `上传失败: ${statusCode}`))
          return
        }
        if (body.code && body.code !== 'SUCCESS') {
          reject(new Error(body.message || '上传失败'))
          return
        }
        resolve((body.data as T) ?? (body as T))
      },
      fail: (err) => reject(new Error(err.errMsg || '上传失败')),
    })
  })
}
