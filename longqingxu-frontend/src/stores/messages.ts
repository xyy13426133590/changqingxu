import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { avatarUrl } from '@/utils/avatar'

// 消息类型
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'voice' | 'emoji'
  status: 'sending' | 'sent' | 'read'
  createdAt: string
  /** 语音消息时长（毫秒） */
  duration?: number
}

// 会话类型
export interface Conversation {
  id: string
  userId: string
  nickname: string
  avatar: string
  lastMessage: string
  /** 最后一条消息时间，统一存 ISO 8601（便于排序与展示） */
  lastMessageTime: string
  unreadCount: number
  isTop: boolean
}

/** 生成种子会话时间：第一条「今天 10:21」，第二条「昨天 18:30」 */
function seedConversationTimes(): { t1: string; t2: string } {
  const t1 = new Date()
  t1.setHours(10, 21, 0, 0)
  const t2 = new Date()
  t2.setDate(t2.getDate() - 1)
  t2.setHours(18, 30, 0, 0)
  return { t1: t1.toISOString(), t2: t2.toISOString() }
}

const { t1: seedT1, t2: seedT2 } = seedConversationTimes()

export const useMessagesStore = defineStore('messages', () => {
  // State
  const conversations = ref<Conversation[]>([
    {
      id: 'c1',
      userId: 'u1',
      nickname: '林溪',
      avatar: avatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'),
      lastMessage: '周末要不要一起看展？',
      lastMessageTime: seedT1,
      unreadCount: 1,
      isTop: false,
    },
    {
      id: 'c2',
      userId: 'u2',
      nickname: '苏晴',
      avatar: avatarUrl('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'),
      lastMessage: '好的，回见',
      lastMessageTime: seedT2,
      unreadCount: 0,
      isTop: false,
    },
  ])
  
  const messages = ref<Record<string, Message[]>>({
    c1: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        content: '你好呀，看了你的资料很投缘～',
        type: 'text',
        status: 'read',
        createdAt: '2024-01-15 10:15:00',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: 'me',
        content: '谢谢，我也觉得～',
        type: 'text',
        status: 'read',
        createdAt: '2024-01-15 10:18:00',
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: 'u1',
        content: '周末要不要一起看展？',
        type: 'text',
        status: 'sent',
        createdAt: '2024-01-15 10:21:00',
      },
    ],
  })
  
  const currentConversationId = ref<string>('')
  
  // Getters
  const currentConversation = computed(() => {
    return conversations.value.find(c => c.id === currentConversationId.value)
  })
  
  const currentMessages = computed(() => {
    return messages.value[currentConversationId.value] || []
  })
  
  const totalUnread = computed(() => {
    return conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  })
  
  // Actions
  function setCurrentConversation(id: string) {
    currentConversationId.value = id
    // 清除未读
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.unreadCount = 0
    }
  }
  
  function sendMessage(content: string, type: Message['type'] = 'text', extra?: { duration?: number }) {
    if (!currentConversationId.value) return

    const newMessage: Message = {
      id: `m${Date.now()}`,
      conversationId: currentConversationId.value,
      senderId: 'me',
      content,
      type,
      status: 'sending',
      createdAt: new Date().toISOString(),
      duration: extra?.duration,
    }

    if (!messages.value[currentConversationId.value]) {
      messages.value[currentConversationId.value] = []
    }
    messages.value[currentConversationId.value].push(newMessage)

    // 更新会话最后消息（显示摘要）
    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.lastMessage = getMessageSummary(type, content)
      conv.lastMessageTime = new Date().toISOString()
    }

    // TODO: 发送到服务器
    setTimeout(() => {
      newMessage.status = 'sent'
    }, 500)
  }

  function getMessageSummary(type: Message['type'], content: string): string {
    switch (type) {
      case 'image':
        return '[图片]'
      case 'voice':
        return '[语音]'
      case 'emoji':
        return '[表情]'
      default:
        return content.slice(0, 50)
    }
  }
  
  function receiveMessage(conversationId: string, message: Message) {
    if (!messages.value[conversationId]) {
      messages.value[conversationId] = []
    }
    messages.value[conversationId].push(message)

    // 更新会话
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.lastMessage = getMessageSummary(message.type, message.content)
      conv.lastMessageTime = message.createdAt || new Date().toISOString()
      if (conversationId !== currentConversationId.value) {
        conv.unreadCount++
      }
    }
  }
  
  function createConversation(userId: string, nickname: string, avatar: string) {
    const existing = conversations.value.find(c => c.userId === userId)
    if (existing) {
      return existing.id
    }

    const newConv: Conversation = {
      id: `c${Date.now()}`,
      userId,
      nickname,
      avatar,
      lastMessage: '',
      lastMessageTime: '',
      unreadCount: 0,
      isTop: false,
    }
    conversations.value.unshift(newConv)
    return newConv.id
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index > -1) {
      conversations.value.splice(index, 1)
      delete messages.value[id]
      if (currentConversationId.value === id) {
        currentConversationId.value = ''
      }
    }
  }

  function topConversation(id: string) {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.isTop = !conv.isTop
      // 重新排序：置顶的在前面
      conversations.value.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1
        if (!a.isTop && b.isTop) return 1
        return 0
      })
    }
  }

  function clearMessages(conversationId: string) {
    messages.value[conversationId] = []
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.lastMessage = ''
      conv.lastMessageTime = ''
    }
  }

  /** 解析 lastMessageTime 为时间戳（兼容旧版持久化的「10:21」「昨天」「刚刚」） */
  function lastMessageTimestamp(timeStr: string): number {
    if (!timeStr) return 0
    if (timeStr === '刚刚') return Date.now()
    if (timeStr === '昨天') {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      d.setHours(12, 0, 0, 0)
      return d.getTime()
    }
    const hm = timeStr.match(/^(\d{1,2}):(\d{2})$/)
    if (hm) {
      const d = new Date()
      d.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0)
      return d.getTime()
    }
    const t = new Date(timeStr).getTime()
    return Number.isFinite(t) ? t : 0
  }

  function pad2(n: number): string {
    return n.toString().padStart(2, '0')
  }

  /** 会话列表右侧时间：刚刚 / HH:mm / 昨天 / M月d日 / yyyy/M/d */
  function formatTime(timeStr: string): string {
    if (!timeStr) return ''

    if (timeStr === '刚刚') return '刚刚'

    let msgDate = new Date(timeStr)
    if (!Number.isFinite(msgDate.getTime())) {
      const hm = timeStr.match(/^(\d{1,2}):(\d{2})$/)
      if (hm) {
        msgDate = new Date()
        msgDate.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0)
      } else if (timeStr === '昨天') {
        return '昨天'
      } else {
        return timeStr
      }
    }

    const now = new Date()
    const diffMs = now.getTime() - msgDate.getTime()
    if (diffMs >= 0 && diffMs < 60_000) return '刚刚'

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDayStart = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())
    const diffDays = Math.floor((todayStart.getTime() - msgDayStart.getTime()) / 86400000)

    if (diffDays === 0) {
      return `${pad2(msgDate.getHours())}:${pad2(msgDate.getMinutes())}`
    }
    if (diffDays === 1) {
      return '昨天'
    }
    if (msgDate.getFullYear() === now.getFullYear()) {
      return `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`
    }
    return `${msgDate.getFullYear()}/${pad2(msgDate.getMonth() + 1)}/${pad2(msgDate.getDate())}`
  }

  return {
    conversations,
    messages,
    currentConversationId,
    currentConversation,
    currentMessages,
    totalUnread,
    setCurrentConversation,
    sendMessage,
    receiveMessage,
    createConversation,
    deleteConversation,
    topConversation,
    clearMessages,
    formatTime,
    lastMessageTimestamp,
  }
}, {
  persist: {
    key: 'messages-store',
    paths: ['conversations', 'messages'],
  },
})