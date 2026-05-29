/**
 * 认证相关 API
 */
import { post, setToken } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    phone: string
    nickname: string
    avatar: string
    isRealName: boolean
    isFaceVerified: boolean
    isVip: boolean
  }
}

async function saveAuthResponse(data: AuthResponse): Promise<AuthResponse> {
  setToken(data.accessToken, data.refreshToken)
  return data
}

export async function apiRegister(params: {
  phone: string
  password: string
  nickname: string
  code?: string
}): Promise<AuthResponse> {
  if (USE_CLOUD) {
    const data = await callCloud<AuthResponse>(CLOUD_API_MAP.auth.register, params, { skipAuth: true })
    return saveAuthResponse(data)
  }
  const data = await post<AuthResponse>('/auth/register', params)
  return saveAuthResponse(data)
}

export async function apiLogin(params: {
  phone: string
  password: string
}): Promise<AuthResponse> {
  if (USE_CLOUD) {
    const data = await callCloud<AuthResponse>(CLOUD_API_MAP.auth.login, params, { skipAuth: true })
    return saveAuthResponse(data)
  }
  const data = await post<AuthResponse>('/auth/login', params)
  return saveAuthResponse(data)
}

export async function apiSmsLogin(params: {
  phone: string
  code: string
}): Promise<AuthResponse> {
  if (USE_CLOUD) {
    const data = await callCloud<AuthResponse>(CLOUD_API_MAP.auth.smsLogin, params, { skipAuth: true })
    return saveAuthResponse(data)
  }
  const data = await post<AuthResponse>('/auth/sms-login', params)
  return saveAuthResponse(data)
}

export async function apiSendSms(params: {
  phone: string
  type?: 'login' | 'register' | 'reset'
}): Promise<{ message: string; code?: string }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.auth.sendSms, params, { skipAuth: true })
  }
  return post<{ message: string; code?: string }>('/auth/send-sms', params)
}

export async function apiWechatLogin(params: {
  code: string
  encryptedData?: string
  iv?: string
}): Promise<AuthResponse> {
  if (USE_CLOUD) {
    const data = await callCloud<AuthResponse>(CLOUD_API_MAP.auth.wechatLogin, params, { skipAuth: true })
    return saveAuthResponse(data)
  }
  const data = await post<AuthResponse>('/auth/wechat-login', params)
  return saveAuthResponse(data)
}

export async function apiRefreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.auth.refreshToken, { refreshToken }, { skipAuth: true })
  }
  return post<{ accessToken: string }>('/auth/refresh-token', { refreshToken })
}

export async function apiRealName(params: { legalName: string; idCard: string }): Promise<{ message: string }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.auth.realName, params)
  }
  return post<{ message: string }>('/auth/real-name', params)
}

export async function apiFaceVerify(params: {
  action?: 'getToken' | 'confirm'
  bizToken?: string
  faceImage?: string
  idCard?: string
}): Promise<{ message?: string; bizToken?: string }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.auth.faceVerify, params)
  }
  return post<{ message: string }>('/auth/face-verify', params)
}
