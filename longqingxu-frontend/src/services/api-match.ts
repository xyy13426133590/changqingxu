/**
 * 匹配相关 API
 */
import { post, get } from './api'

// 匹配响应
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

// 喜欢用户
export function apiLikeUser(targetUserId: string): Promise<MatchResponse> {
  return post<MatchResponse>('/matches/like', { targetUserId })
}

// 不喜欢用户
export function apiPassUser(targetUserId: string): Promise<MatchResponse> {
  return post<MatchResponse>('/matches/pass', { targetUserId })
}

// 超级喜欢
export function apiSuperLikeUser(targetUserId: string): Promise<MatchResponse> {
  return post<MatchResponse>('/matches/super-like', { targetUserId })
}

// 获取互相喜欢的人
export function apiGetMutualMatches(): Promise<MatchResponse[]> {
  return get<MatchResponse[]>('/matches/mutual')
}
