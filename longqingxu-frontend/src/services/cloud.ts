/**
 * 微信云开发 API 封装
 */
import { getToken, clearToken, type ApiResponse } from './api'

export const USE_CLOUD = import.meta.env.VITE_USE_CLOUD === 'true'
export const CLOUD_ENV = import.meta.env.VITE_CLOUD_ENV || 'cloud1-d6g7211of923bfddc'

let cloudInitialized = false

export function initCloud(): void {
  if (!USE_CLOUD || cloudInitialized) return

  // #ifdef MP-WEIXIN
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({
      env: CLOUD_ENV,
      traceUser: true,
    })
    cloudInitialized = true
  }
  // #endif
}

export interface CallCloudOptions {
  skipAuth?: boolean
}

/**
 * 调用云函数，返回与 Nest API 相同的 data 字段
 */
export function callCloud<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
  options: CallCloudOptions = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!USE_CLOUD) {
      reject(new Error('VITE_USE_CLOUD 未启用'))
      return
    }

    // #ifdef MP-WEIXIN
    const token = getToken()
    const payload: Record<string, unknown> = { ...data }
    if (token && !options.skipAuth) {
      payload.token = token
    }

    wx.cloud.callFunction({
      name,
      data: payload,
      success: (res) => {
        const result = res.result as ApiResponse<T> | null
        if (!result) {
          uni.showToast({ title: '云函数无响应', icon: 'none' })
          reject(new Error('EMPTY_CLOUD_RESPONSE'))
          return
        }

        if (result.code !== 'SUCCESS') {
          if (result.code === 'UNAUTHORIZED' || (result as { statusCode?: number }).statusCode === 401) {
            clearToken()
            uni.reLaunch({ url: '/pages/auth/login' })
          }
          uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          reject(new Error(result.message || '操作失败'))
          return
        }

        resolve(result.data as T)
      },
      fail: (err) => {
        const hint = err.errMsg || '云函数调用失败'
        uni.showToast({ title: hint, icon: 'none', duration: 2800 })
        reject(new Error(hint))
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('云函数仅支持微信小程序端'))
    // #endif
  })
}

/**
 * 上传文件到云存储
 */
export function cloudUploadFile(
  cloudPath: string,
  filePath: string,
): Promise<{ fileID: string; statusCode: number }> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => resolve({ fileID: res.fileID, statusCode: res.statusCode }),
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('云存储上传仅支持微信小程序端'))
    // #endif
  })
}