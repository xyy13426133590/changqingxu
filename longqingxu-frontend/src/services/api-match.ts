/**
 * 匹配相关 API
 */
import { post, get } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

export interface MatchResponse {
  id: string
  userId: string
  targetUserId: string
  action: 'like' | 'dislike' | 'super_like'
  isMutual: boolean
  createdAt: string
  targetUser?: {
    id: string
    nickname: string
    avatar: string
  }
}

export function apiLikeUser(targetUserId: string): Promise<MatchResponse> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.matches.like, { targetUserId })
  return post<MatchResponse>('/matches/like', { targetUserId })
}

export function apiPassUser(targetUserId: string): Promise<MatchResponse> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.matches.pass, { targetUserId })
  return post<MatchResponse>('/matches/pass', { targetUserId })
}

export function apiSuperLikeUser(targetUserId: string): Promise<MatchResponse> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.matches.superLike, { targetUserId })
  return post<MatchResponse>('/matches/super-like', { targetUserId })
}

export function apiGetMutualMatches(): Promise<MatchResponse[]> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.matches.mutual)
  return get<MatchResponse[]>('/matches/mutual')
}

export function apiResetSwipeHistory(): Promise<{ deleted: number }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.matches.resetSwipes)
  return post<{ deleted: number }>('/matches/reset-swipes', {})
}
