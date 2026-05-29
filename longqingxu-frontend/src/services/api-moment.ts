/**
 * 圈子动态 API 服务层
 * USE_CLOUD 模式：调用云函数
 */
import { USE_CLOUD, callCloud, cloudUploadFile } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'
import { get, post } from './api'
import { useUserStore } from '@/stores/user'

export interface MomentAuthor {
  id: string
  nickname: string
  avatar: string
}

export interface MomentMedia {
  type: 'image' | 'video'
  fileID: string
  url?: string
  width?: number
  height?: number
  duration?: number
}

export interface MomentLocation {
  name: string
  latitude?: number
  longitude?: number
}

export interface MomentPost {
  id: string
  author: MomentAuthor
  content: string | null
  media: MomentMedia[]
  location: MomentLocation | null
  likeCount: number
  commentCount: number
  isLiked: boolean
  visibility: 'public' | 'login_only' | 'circle_members'
  createdAt: string
  masked: boolean
}

export interface FeedResult {
  posts: MomentPost[]
  total: number
  hasMore: boolean
  page: number
}

export interface CommentItem {
  id: string
  author: MomentAuthor
  content: string
  createdAt: string
}

export interface CommentsResult {
  comments: CommentItem[]
  total: number
  hasMore: boolean
  page: number
}

function getToken(): string | undefined {
  return useUserStore().accessToken || undefined
}

export async function apiListFeed(params: {
  circleId?: string
  page?: number
  limit?: number
}): Promise<FeedResult> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.listFeed, { ...params, token })
  }
  return get('/moments/feed', params)
}

export async function apiCreatePost(params: {
  circleId?: string
  visibility?: string
  content?: string
  media?: MomentMedia[]
  location?: MomentLocation | null
}): Promise<MomentPost> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.createPost, { ...params, token })
  }
  return post('/moments', params)
}

export async function apiDeletePost(postId: string): Promise<{ success: boolean }> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.deletePost, { postId, token })
  }
  return post(`/moments/${postId}/delete`, {})
}

export async function apiToggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.toggleLike, { postId, token })
  }
  return post(`/moments/${postId}/like`, {})
}

export async function apiListComments(params: {
  postId: string
  page?: number
  limit?: number
}): Promise<CommentsResult> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.listComments, { ...params, token })
  }
  return get(`/moments/${params.postId}/comments`, params)
}

export async function apiCreateComment(params: {
  postId: string
  content: string
}): Promise<CommentItem> {
  const token = getToken()
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.moments.createComment, { ...params, token })
  }
  return post(`/moments/${params.postId}/comments`, params)
}

/**
 * 上传动态图片（复用 cloudUploadFile + upload-uploadImage 云函数）
 */
export async function apiUploadMomentImage(
  filePath: string,
): Promise<{ fileID: string; url: string }> {
  if (USE_CLOUD) {
    const cloudPath = `moments/images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const uploadRes = await cloudUploadFile(cloudPath, filePath)
    return { fileID: uploadRes.fileID, url: '' }
  }
  throw new Error('暂不支持非云模式图片上传')
}

/**
 * 上传动态视频
 */
export async function apiUploadMomentVideo(
  filePath: string,
  duration?: number,
): Promise<{ fileID: string; url: string; duration?: number }> {
  if (USE_CLOUD) {
    const ext = filePath.split('.').pop()?.toLowerCase() || 'mp4'
    const cloudPath = `moments/videos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const uploadRes = await cloudUploadFile(cloudPath, filePath)
    const result = await callCloud(CLOUD_API_MAP.upload.video, {
      fileID: uploadRes.fileID,
      ext,
      duration,
      token: getToken(),
    })
    return { fileID: uploadRes.fileID, url: result.url, duration }
  }
  throw new Error('暂不支持非云模式视频上传')
}
