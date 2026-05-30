import { resolveAccessToken } from './api'

type ApiResponse<T> = {
  code: string
  message: string
  data: T
  timestamp?: string
}

type CallCloudOptions = {
  skipAuth?: boolean
}

export class CloudUnauthorizedError extends Error {
  readonly code = 'UNAUTHORIZED'
  constructor(message = '请先登录') {
    super(message)
    this.name = 'CloudUnauthorizedError'
  }
}

const DEFAULT_CLOUD_ENV = 'cloud1-d6g7211of923bfddc'

export const USE_CLOUD = import.meta.env.VITE_USE_CLOUD === 'true'
export const CLOUD_ENV = import.meta.env.VITE_CLOUD_ENV || DEFAULT_CLOUD_ENV

let cloudInitialized = false

export function initCloud(): void {
  if (!USE_CLOUD || cloudInitialized) return
  // #ifdef MP-WEIXIN
  const wxCloud = (globalThis as any)?.wx?.cloud
  if (wxCloud) {
    wxCloud.init({
      env: CLOUD_ENV,
      traceUser: true,
    })
    cloudInitialized = true
  }
  // #endif
}

export async function callCloud<T>(
  name: string,
  data: Record<string, unknown> = {},
  options: CallCloudOptions = {},
): Promise<T> {
  if (!USE_CLOUD) {
    throw new Error('VITE_USE_CLOUD 未启用')
  }

  initCloud()

  const payload: Record<string, unknown> = { ...data }
  if (!options.skipAuth) {
    const accessToken = resolveAccessToken()
    if (!accessToken) {
      throw new CloudUnauthorizedError('请先登录')
    }
    payload.token = accessToken
  }

  // #ifdef MP-WEIXIN
  const wxCloud = (globalThis as any)?.wx?.cloud
  if (!wxCloud) throw new Error('当前环境不支持云函数')

  const res = await wxCloud.callFunction({
    name,
    data: payload,
  })

  const result = (res?.result || {}) as ApiResponse<T>
  if (result.code === 'SUCCESS') {
    return result.data
  }

  if (result.code === 'UNAUTHORIZED') {
    throw new CloudUnauthorizedError(result.message)
  }
  throw new Error(result.message || '云函数调用失败')
  // #endif

  // #ifndef MP-WEIXIN
  throw new Error('云函数仅支持微信小程序端')
  // #endif
}

export async function cloudUploadFile(cloudPath: string, filePath: string): Promise<{ fileID: string }> {
  if (!USE_CLOUD) {
    throw new Error('VITE_USE_CLOUD 未启用')
  }

  initCloud()

  // #ifdef MP-WEIXIN
  const wxCloud = (globalThis as any)?.wx?.cloud
  if (!wxCloud) throw new Error('当前环境不支持云存储上传')
  return wxCloud.uploadFile({
    cloudPath,
    filePath,
  }) as Promise<{ fileID: string }>
  // #endif

  // #ifndef MP-WEIXIN
  throw new Error('云存储上传仅支持微信小程序端')
  // #endif
}
