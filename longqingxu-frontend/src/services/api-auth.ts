/**
 * 认证相关 API
 */
import { post, get, setToken } from './api'

// 登录响应
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

// 注册
export async function apiRegister(params: {
  phone: string
  password: string
  nickname: string
  code?: string
}): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/register', params)
  setToken(data.accessToken, data.refreshToken)
  return data
}

// 手机号+密码登录
export async function apiLogin(params: {
  phone: string
  password: string
}): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/login', params)
  setToken(data.accessToken, data.refreshToken)
  return data
}

// 验证码登录
export async function apiSmsLogin(params: {
  phone: string
  code: string
}): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/sms-login', params)
  setToken(data.accessToken, data.refreshToken)
  return data
}

// 发送验证码
export async function apiSendSms(params: {
  phone: string
  type?: 'login' | 'register' | 'reset'
}): Promise<{ message: string; code?: string }> {
  return post<{ message: string; code?: string }>('/auth/send-sms', params)
}

// 微信登录
export async function apiWechatLogin(params: {
  code: string
  encryptedData?: string
  iv?: string
}): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/wechat-login', params)
  setToken(data.accessToken, data.refreshToken)
  return data
}

// 刷新 Token
export async function apiRefreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  return post<{ accessToken: string }>('/auth/refresh-token', { refreshToken })
}

// 实名认证
export async function apiRealName(params: { legalName: string; idCard: string }): Promise<{ message: string }> {
  return post<{ message: string }>('/auth/real-name', params)
}

// 人脸核验
export async function apiFaceVerify(params: { faceImage: string }): Promise<{ message: string }> {
  return post<{ message: string }>('/auth/face-verify', params)
}
