/**
 * 会话和消息相关 API
 */
import { get, post, put, del } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

export interface Conversation {
  id: string
  userId: string
  targetUserId: string
  targetUser: {
    id: string
    nickname: string
    avatar: string
  }
  lastMessage: {
    id: string
    content: string
    type: string
    createdAt: string
  } | null
  unreadCount: number
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  type: 'text' | 'image' | 'voice' | 'emoji' | 'system'
  content: string
  mediaUrl?: string
  mediaDuration?: number
  isRead: boolean
  createdAt: string
}

export function apiGetConversations(): Promise<Conversation[]> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.conversations.list)
  return get<Conversation[]>('/conversations')
}

export function apiCreateConversation(targetUserId: string): Promise<Conversation> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.conversations.create, { targetUserId })
  return post<Conversation>('/conversations', { targetUserId })
}

export function apiDeleteConversation(conversationId: string): Promise<{ message: string }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.conversations.delete, { conversationId })
  return del<{ message: string }>(`/conversations/${conversationId}`)
}

export function apiTogglePinConversation(conversationId: string): Promise<{ isPinned: boolean }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.conversations.togglePin, { conversationId })
  return put<{ isPinned: boolean }>(`/conversations/${conversationId}/top`)
}

export function apiGetMessages(
  conversationId: string,
  page = 1,
  limit = 20,
): Promise<{ messages: Message[]; total: number }> {
  if (USE_CLOUD) {
    return callCloud(CLOUD_API_MAP.conversations.messages, { conversationId, page, limit })
  }
  return get<{ messages: Message[]; total: number }>(`/conversations/${conversationId}/messages`, { page, limit })
}

export function apiSendMessage(params: {
  conversationId: string
  receiverId: string
  type: 'text' | 'image' | 'voice' | 'emoji'
  content: string
  mediaUrl?: string
  mediaDuration?: number
}): Promise<Message> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.messages.send, params)
  return post<Message>('/messages', params)
}

export function apiMarkMessagesRead(conversationId: string): Promise<{ message: string; clearedCount: number }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.messages.markRead, { conversationId })
  return put<{ message: string; clearedCount: number }>('/messages/read', { conversationId })
}
