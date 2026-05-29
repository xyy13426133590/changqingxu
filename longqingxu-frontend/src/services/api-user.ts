/**
 * 用户相关 API
 */
import { get, put, post } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

export interface UserProfile {
  id: string
  phone: string
  nickname: string
  avatar: string
  gender: 'male' | 'female' | 'unknown'
  birthday?: string
  age: number
  height: number
  weight?: number
  hometown?: string
  location: string
  zodiac: string
  zodiacSign: string
  mbti: string
  education: string
  school?: string
  schoolTier?: '985' | '211' | null
  occupation: string
  jobLevel?: string
  company?: string
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

export interface UserCard {
  id: string
  nickname: string
  avatar: string
  gender: string
  age: number
  height: number
  weight?: number | null
  hometown?: string
  location: string
  zodiac: string
  zodiacSign: string
  mbti: string
  riyuan: string
  education: string
  school?: string
  schoolTier?: '985' | '211' | null
  occupation: string
  jobLevel?: string
  company?: string
  income: string
  bio: string
  hobbies: string[]
  isRealName: boolean
  isFaceVerified: boolean
  isVip: boolean
  matchReason: string
  matchTagline: string
  matchScore: number
}

export function apiGetMe(): Promise<UserProfile> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.getMe)
  return get<UserProfile>('/users/me')
}

export function apiUpdateProfile(params: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.updateProfile, params)
  return put<UserProfile>('/users/me', params)
}

export function apiUpdateFilters(params: Record<string, any>): Promise<{ filterSettings: Record<string, any> }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.updateFilters, params)
  return put<{ filterSettings: Record<string, any> }>('/users/me/filters', params)
}

export function apiGetVipStatus(): Promise<{
  isVip: boolean
  vipExpiry: string
  daysRemaining: number
}> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.getVipStatus)
  return get('/users/me/vip')
}

export function apiGetMyCard(): Promise<UserCard> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.getUserCard)
  return get<UserCard>('/users/me/card')
}

export function apiGetRecommendations(
  page = 1,
  limit = 10,
): Promise<{ users: UserCard[]; total: number; recycled?: boolean }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.users.getRecommendations, { page, limit })
  }
  return get<{ users: UserCard[]; total: number; recycled?: boolean }>(
    '/users/recommendations',
    { page, limit },
  )
}

export function apiGetDailyRecommendations(): Promise<{ users: UserCard[]; recycled?: boolean }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.getDailyRecommendations)
  return get<{ users: UserCard[]; recycled?: boolean }>('/users/daily')
}

export function apiGetUserDetail(userId: string): Promise<UserCard> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.getUserDetail, { userId })
  return get<UserCard>(`/users/${userId}`)
}

export function apiReportUser(
  userId: string,
  params: { reason: string; description?: string; evidence?: string[] },
): Promise<{ message: string }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.users.reportUser, { userId, ...params })
  return post<{ message: string }>(`/users/${userId}/report`, params)
}
