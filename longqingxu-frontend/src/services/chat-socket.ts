/**
 * WebSocket（Socket.IO）即时消息。
 * - H5：使用 socket.io-client 连接后端 namespace `/chat`，与 handshake auth.token JWT 对齐。
 * - 微信小程序请优先使用 REST（`apiSendMessage`）；Socket.IO 与普通 wx.connectSocket 协议不同。
 */
import type { Socket } from 'socket.io-client'
import { WS_BASE_URL, getToken } from './api'

let socket: Socket | null = null

function wsUrlToSocketIoHttp(url: string): string {
  if (url.startsWith('ws://')) return `http://${url.slice(5)}`
  if (url.startsWith('wss://')) return `https://${url.slice(6)}`
  return url
}

export type NewMessagePayload = {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  type: string
  content: string
  mediaUrl?: string
  mediaDuration?: number
  isRead: boolean
  createdAt: string
}

export async function disconnectChatSocket(): Promise<void> {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}

/** 连接 / 复用 Socket；仅在 H5 构建中生效（其他端预处理会剔除 body） */
export async function connectChatSocket(
  handlers: Partial<{
    onNewMessage: (msg: NewMessagePayload) => void
    onMessageSent: (payload: { message: NewMessagePayload }) => void
  }>,
): Promise<void> {
  await disconnectChatSocket()

  try {
    const { io } = await import('socket.io-client')
    const token = getToken()
    if (!token) return
    const url = wsUrlToSocketIoHttp(WS_BASE_URL || 'http://localhost:3000/chat')
    socket = io(url, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    if (handlers.onNewMessage) socket.on('new_message', handlers.onNewMessage)
    if (handlers.onMessageSent) socket.on('message_sent', handlers.onMessageSent)
  } catch {
    /* 非 H5 或依赖未打进包 */
  }
}

export function emitSendMessageViaSocket(payload: {
  conversationId: string
  receiverId: string
  type: 'text' | 'image' | 'voice' | 'emoji'
  content: string
  mediaUrl?: string
  mediaDuration?: number
}): boolean {
  if (!socket?.connected) return false
  socket.emit('send_message', payload)
  return true
}
