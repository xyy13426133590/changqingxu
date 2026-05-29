import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation as ApiConversation, Message as ApiMessage } from '@/services/api-conversation'
import {
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
  apiMarkMessagesRead,
  apiCreateConversation,
} from '@/services/api-conversation'
import type { NewMessagePayload } from '@/services/chat-socket'
import { resolveAvatar } from '@/utils/avatar'
import { apiUploadVoice, apiUploadImage } from '@/services/api-upload'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'voice' | 'emoji'
  status: 'sending' | 'sent' | 'read'
  createdAt: string
  duration?: number
}

export interface Conversation {
  id: string
  /** 对端用户 id */
  userId: string
  nickname: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isTop: boolean
}

function summarizeLast(type: string, content: string): string {
  switch (type) {
    case 'image':
      return '[图片]'
    case 'voice':
      return '[语音]'
    case 'emoji':
      return '[表情]'
    default:
      return (content || '').slice(0, 50)
  }
}

function mapApiConversation(row: ApiConversation): Conversation {
  const last = row.lastMessage
  const lastContent = last ? summarizeLast(last.type, last.content) : ''
  const lastTime = last?.createdAt
    ? typeof last.createdAt === 'string'
      ? last.createdAt
      : new Date(last.createdAt as unknown as string).toISOString()
    : row.updatedAt != null
      ? typeof row.updatedAt === 'string'
        ? row.updatedAt
        : new Date(row.updatedAt as unknown as string).toISOString()
      : ''
  return {
    id: row.id,
    userId: row.targetUser?.id ?? row.targetUserId,
    nickname: row.targetUser?.nickname || '',
    avatar: resolveAvatar(row.targetUser?.avatar, row.targetUser?.id),
    lastMessage: lastContent,
    lastMessageTime: lastTime,
    unreadCount: row.unreadCount ?? 0,
    isTop: row.isPinned ?? false,
  }
}

function mapApiMessage(m: ApiMessage): Message {
  const t =
    m.type === 'text' ||
    m.type === 'image' ||
    m.type === 'voice' ||
    m.type === 'emoji'
      ? m.type
      : 'text'

  let content = m.content
  if (t === 'voice') {
    if (m.mediaUrl) {
      content = JSON.stringify({ url: m.mediaUrl, duration: (m.mediaDuration || 1) * 1000 })
    }
  } else if (t === 'image' && m.mediaUrl) {
    content = m.mediaUrl
  }

  const createdAt =
    typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt as unknown as Date).toISOString()

  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content,
    type: t,
    status: m.isRead ? 'read' : 'sent',
    createdAt,
    duration: m.mediaDuration != null ? m.mediaDuration * 1000 : undefined,
  }
}

function mapSocketPayload(p: NewMessagePayload): Message {
  return mapApiMessage({
    id: p.id,
    conversationId: p.conversationId,
    senderId: p.senderId,
    receiverId: p.receiverId,
    type: (p.type as ApiMessage['type']) || 'text',
    content: p.content,
    mediaUrl: p.mediaUrl,
    mediaDuration: p.mediaDuration,
    isRead: p.isRead,
    createdAt: p.createdAt,
  })
}

export const useMessagesStore = defineStore('messages', () => {
  const conversations = ref<Conversation[]>([])
  const messages = ref<Record<string, Message[]>>({})
  const currentConversationId = ref<string>('')

  const currentConversation = computed(() =>
    conversations.value.find((c) => c.id === currentConversationId.value),
  )

  const currentMessages = computed(() => messages.value[currentConversationId.value] || [])

  const totalUnread = computed(() =>
    conversations.value.reduce((sum, c) => sum + c.unreadCount, 0),
  )

  async function fetchConversations(): Promise<void> {
    try {
      const rows = await apiGetConversations()
      conversations.value = rows.map(mapApiConversation)
      const ids = new Set(rows.map((r) => r.id))
      const next: Record<string, Message[]> = {}
      Object.keys(messages.value).forEach((k) => {
        if (ids.has(k)) next[k] = messages.value[k]
      })
      messages.value = next
    } catch {
      conversations.value = []
    }
  }

  async function loadMessages(conversationId: string): Promise<void> {
    try {
      const { messages: rows } = await apiGetMessages(conversationId, 1, 100)
      const mapped = rows
        .map(mapApiMessage)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      messages.value = { ...messages.value, [conversationId]: mapped }
    } catch {
      messages.value = { ...messages.value, [conversationId]: [] }
    }
  }

  function applyIncomingMessage(raw: ApiMessage | NewMessagePayload): void {
    const m =
      'receiverId' in raw && typeof (raw as NewMessagePayload).receiverId === 'string'
        ? mapSocketPayload(raw as NewMessagePayload)
        : mapApiMessage(raw as ApiMessage)
    const convId = m.conversationId
    const list = messages.value[convId] || []
    if (list.some((x) => x.id === m.id)) return
    messages.value = { ...messages.value, [convId]: [...list, m] }

    const conv = conversations.value.find((c) => c.id === convId)
    if (conv) {
      conv.lastMessage = summarizeLast(m.type, m.content)
      conv.lastMessageTime = m.createdAt
      if (convId !== currentConversationId.value) conv.unreadCount++
    }
  }

  async function setCurrentConversation(id: string): Promise<void> {
    currentConversationId.value = id
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) conv.unreadCount = 0
    try {
      await apiMarkMessagesRead(id)
    } catch {
      /* ignore */
    }
  }

  async function sendMessage(content: string, type: Message['type'] = 'text', extra?: { duration?: number }) {
    const cid = currentConversationId.value
    const conv = conversations.value.find((c) => c.id === cid)
    if (!cid || !conv) return

    const tempId = `temp_${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      conversationId: cid,
      senderId: '__local__',
      content,
      type,
      status: 'sending',
      createdAt: new Date().toISOString(),
      duration: extra?.duration,
    }
    messages.value = { ...messages.value, [cid]: [...(messages.value[cid] || []), optimistic] }

    conv.lastMessage = summarizeLast(type, content)
    conv.lastMessageTime = optimistic.createdAt

    if (type === 'voice') {
      let filePath = ''
      let durationMs = extra?.duration ?? 0
      try {
        const o = JSON.parse(content) as { url?: string; duration?: number }
        if (o.url) filePath = o.url.trim()
        if (typeof o.duration === 'number' && o.duration > 0) durationMs = o.duration
      } catch {
        /* ignore */
      }
      if (!filePath) {
        const arrFail = messages.value[cid]?.filter((m) => m.id !== tempId) || []
        messages.value = { ...messages.value, [cid]: arrFail }
        uni.showToast({ title: '语音文件无效', icon: 'none' })
        return
      }

      try {
        const { url } = (await apiUploadVoice(filePath)) as { url: string }
        const durationSec = Math.max(1, Math.ceil(durationMs / 1000))
        const saved = await apiSendMessage({
          conversationId: cid,
          receiverId: conv.userId,
          type: 'voice',
          content: '[语音]',
          mediaUrl: url,
          mediaDuration: durationSec,
        })
        const mapped = mapApiMessage(saved)
        const arr = messages.value[cid]?.filter((m) => m.id !== tempId) || []
        messages.value = {
          ...messages.value,
          [cid]: [...arr, mapped].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        }
        const lc = conversations.value.find((c) => c.id === cid)
        if (lc) {
          lc.lastMessage = summarizeLast(mapped.type, mapped.content)
          lc.lastMessageTime = mapped.createdAt
        }
      } catch {
        const arrFail = messages.value[cid]?.filter((m) => m.id !== tempId) || []
        messages.value = { ...messages.value, [cid]: arrFail }
        uni.showToast({ title: '语音发送失败', icon: 'none' })
      }
      return
    }

    if (type === 'image') {
      const filePath = content.trim()
      if (!filePath) {
        messages.value = { ...messages.value, [cid]: messages.value[cid]?.filter((m) => m.id !== tempId) || [] }
        uni.showToast({ title: '图片文件无效', icon: 'none' })
        return
      }
      try {
        const { url } = (await apiUploadImage(filePath)) as { url: string }
        const saved = await apiSendMessage({
          conversationId: cid,
          receiverId: conv.userId,
          type: 'image',
          content: url,
          mediaUrl: url,
        })
        const mapped = mapApiMessage(saved)
        const arr = messages.value[cid]?.filter((m) => m.id !== tempId) || []
        messages.value = {
          ...messages.value,
          [cid]: [...arr, mapped].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        }
        const lc = conversations.value.find((c) => c.id === cid)
        if (lc) {
          lc.lastMessage = summarizeLast(mapped.type, mapped.content)
          lc.lastMessageTime = mapped.createdAt
        }
      } catch {
        messages.value = { ...messages.value, [cid]: messages.value[cid]?.filter((m) => m.id !== tempId) || [] }
        uni.showToast({ title: '图片发送失败', icon: 'none' })
      }
      return
    }

    if (type === 'emoji') {
      try {
        const saved = await apiSendMessage({
          conversationId: cid,
          receiverId: conv.userId,
          type: 'emoji',
          content,
        })
        const mapped = mapApiMessage(saved)
        const arr = messages.value[cid]?.filter((m) => m.id !== tempId) || []
        messages.value = {
          ...messages.value,
          [cid]: [...arr, mapped].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        }
        const lc = conversations.value.find((c) => c.id === cid)
        if (lc) {
          lc.lastMessage = summarizeLast(mapped.type, mapped.content)
          lc.lastMessageTime = mapped.createdAt
        }
      } catch {
        messages.value = { ...messages.value, [cid]: messages.value[cid]?.filter((m) => m.id !== tempId) || [] }
        uni.showToast({ title: '表情发送失败', icon: 'none' })
      }
      return
    }

    const payload = {
      conversationId: cid,
      receiverId: conv.userId,
      type,
      content,
    }

    try {
      const saved = await apiSendMessage(payload)
      const mapped = mapApiMessage(saved)
      const arr = messages.value[cid]?.filter((m) => m.id !== tempId) || []
      messages.value = { ...messages.value, [cid]: [...arr, mapped].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) }
      const lc = conversations.value.find((c) => c.id === cid)
      if (lc) {
        lc.lastMessage = summarizeLast(mapped.type, mapped.content)
        lc.lastMessageTime = mapped.createdAt
      }
    } catch {
      const arr = messages.value[cid]?.filter((m) => m.id !== tempId) || []
      messages.value = { ...messages.value, [cid]: arr }
    }
  }

  async function createConversation(peerUserId: string, nickname: string, avatar: string): Promise<string> {
    if (!peerUserId) {
      throw new Error('对方用户 ID 无效')
    }
    const row = await apiCreateConversation(peerUserId)
    if (!row?.id) {
      throw new Error('创建会话失败，请稍后重试')
    }
    const mapped = mapApiConversation(row)
    if (!mapped.id) {
      throw new Error('会话数据异常')
    }
    if (!mapped.userId) {
      mapped.userId = row.targetUser?.id ?? row.targetUserId ?? peerUserId
    }
    if (!mapped.nickname && nickname) mapped.nickname = nickname
    if (!mapped.avatar && avatar) mapped.avatar = resolveAvatar(avatar, mapped.userId)
    const ix = conversations.value.findIndex((c) => c.id === mapped.id)
    if (ix >= 0) conversations.value.splice(ix, 1)
    conversations.value.unshift(mapped)
    return mapped.id
  }

  function receiveMessage(conversationId: string, message: Message) {
    messages.value = {
      ...messages.value,
      [conversationId]: [...(messages.value[conversationId] || []), message],
    }
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      conv.lastMessage = summarizeLast(message.type, message.content)
      conv.lastMessageTime = message.createdAt || new Date().toISOString()
    }
  }

  function deleteConversation(id: string): void {
    const index = conversations.value.findIndex((c) => c.id === id)
    if (index > -1) conversations.value.splice(index, 1)
    const next = { ...messages.value }
    delete next[id]
    messages.value = next
    if (currentConversationId.value === id) currentConversationId.value = ''
  }

  function topConversation(id: string) {
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) conv.isTop = !conv.isTop
  }

  function clearMessages(conversationId: string) {
    messages.value = { ...messages.value, [conversationId]: [] }
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      conv.lastMessage = ''
      conv.lastMessageTime = ''
    }
  }

  function lastMessageTimestamp(timeStr: string): number {
    if (!timeStr) return 0
    const t = new Date(timeStr).getTime()
    return Number.isFinite(t) ? t : 0
  }

  function pad2(n: number): string {
    return n.toString().padStart(2, '0')
  }

  function formatTime(timeStr: string): string {
    if (!timeStr) return ''
    const msgDate = new Date(timeStr)
    if (!Number.isFinite(msgDate.getTime())) return timeStr
    const now = new Date()
    const diffMs = now.getTime() - msgDate.getTime()
    if (diffMs >= 0 && diffMs < 60_000) return '刚刚'
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDayStart = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())
    const diffDays = Math.floor((todayStart.getTime() - msgDayStart.getTime()) / 86400000)
    if (diffDays === 0) return `${pad2(msgDate.getHours())}:${pad2(msgDate.getMinutes())}`
    if (diffDays === 1) return '昨天'
    if (msgDate.getFullYear() === now.getFullYear()) return `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`
    return `${msgDate.getFullYear()}/${pad2(msgDate.getMonth() + 1)}/${pad2(msgDate.getDate())}`
  }

  return {
    conversations,
    messages,
    currentConversationId,
    currentConversation,
    currentMessages,
    totalUnread,
    fetchConversations,
    loadMessages,
    setCurrentConversation,
    sendMessage,
    receiveMessage,
    applyIncomingMessage,
    createConversation,
    deleteConversation,
    topConversation,
    clearMessages,
    formatTime,
    lastMessageTimestamp,
  }
})
