/**
 * 用户相关 API
 */
import { get, put, post } from './api'

// 用户信息
export interface UserProfile {
  id: string
  phone: string
  nickname: string
  avatar: string
  gender: 'male' | 'female' | 'unknown'
  age: number
  height: number
  location: string
  zodiac: string
  zodiacSign: string
  mbti: string
  education: string
  occupation: string
  income: string
  bio: string
  hobbies: string[]
  isRealName: boolean
  isFaceVerified: boolean
  isVip: boolean
  vipExpiry: string
  filterSettings: Record<string, any>
  createdAt: string
}

// 用户卡片（发现页）
export interface UserCard {
  id: string
  nickname: string
  avatar: string
  gender: string
  age: number
  height: number
  location: string
  zodiac: string
  zodiacSign: string
  mbti: string
  riyuan: string
  education: string
  occupation: string
  income: string
  bio: string
  hobbies: string[]
  isRealName: boolean
  isVip: boolean
  matchReason: string
  matchTagline: string
  matchScore: number
}

// 获取当前用户资料
export function apiGetMe(): Promise<UserProfile> {
  return get<UserProfile>('/users/me')
}

// 更新用户资料
export function apiUpdateProfile(params: Partial<UserProfile>): Promise<UserProfile> {
  return put<UserProfile>('/users/me', params)
}

// 更新筛选条件
export function apiUpdateFilters(params: Record<string, any>): Promise<{ filterSettings: Record<string, any> }> {
  return put<{ filterSettings: Record<string, any> }>('/users/me/filters', params)
}

// 获取 VIP 状态
export function apiGetVipStatus(): Promise<{
  isVip: boolean
  vipExpiry: string
  daysRemaining: number
}> {
  return get('/users/me/vip')
}

// 获取我的资料卡
export function apiGetMyCard(): Promise<UserCard> {
  return get<UserCard>('/users/me/card')
}

// 获取推荐用户列表
export function apiGetRecommendations(page = 1, limit = 10): Promise<{ users: UserCard[]; total: number }> {
  return get<{ users: UserCard[]; total: number }>('/users/recommendations', { page, limit })
}

// 获取每日推荐
export function apiGetDailyRecommendations(): Promise<{ users: UserCard[] }> {
  return get<{ users: UserCard[] }>('/users/daily')
}

// 获取用户详情
export function apiGetUserDetail(userId: string): Promise<UserCard> {
  return get<UserCard>(`/users/${userId}`)
}

// 举报用户
export function apiReportUser(userId: string, params: { reason: string; description?: string; evidence?: string[] }): Promise<{ message: string }> {
  return post<{ message: string }>(`/users/${userId}/report`, params)
}
