/**
 * 会话和消息相关 API
 */
import { get, post, put, del } from './api'

// 会话
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

// 消息
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

// 获取会话列表
export function apiGetConversations(): Promise<Conversation[]> {
  return get<Conversation[]>('/conversations')
}

// 创建会话
export function apiCreateConversation(targetUserId: string): Promise<Conversation> {
  return post<Conversation>('/conversations', { targetUserId })
}

// 删除会话
export function apiDeleteConversation(conversationId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/conversations/${conversationId}`)
}

// 置顶/取消置顶会话
export function apiTogglePinConversation(conversationId: string): Promise<{ isPinned: boolean }> {
  return put<{ isPinned: boolean }>(`/conversations/${conversationId}/top`)
}

// 获取消息历史
export function apiGetMessages(
  conversationId: string,
  page = 1,
  limit = 20,
): Promise<{ messages: Message[]; total: number }> {
  return get<{ messages: Message[]; total: number }>(`/conversations/${conversationId}/messages`, { page, limit })
}

// 发送消息（REST 备选）
export function apiSendMessage(params: {
  conversationId: string
  receiverId: string
  type: 'text' | 'image' | 'voice' | 'emoji'
  content: string
  mediaUrl?: string
  mediaDuration?: number
}): Promise<Message> {
  return post<Message>('/messages', params)
}

// 标记消息已读
export function apiMarkMessagesRead(conversationId: string): Promise<{ message: string; clearedCount: number }> {
  return put<{ message: string; clearedCount: number }>('/messages/read', { conversationId })
}
