/**
 * WebSocket 服务 - 实时消息
 * 基于 Socket.IO 客户端
 */

import { getToken } from './api'
import { WS_BASE_URL } from './api'

export type MessageCallback = (message: any) => void
export type ConnectCallback = () => void
export type DisconnectCallback = (reason: string) => void
export type ErrorCallback = (error: any) => void

class WebSocketService {
  private socket: any = null
  private messageCallbacks: MessageCallback[] = []
  private connectCallbacks: ConnectCallback[] = []
  private disconnectCallbacks: DisconnectCallback[] = []
  private errorCallbacks: ErrorCallback[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimer: any = null

  /**
   * 连接 WebSocket
   */
  connect(): void {
    if (this.socket) {
      return
    }

    const token = getToken()
    if (!token) {
      console.warn('WebSocket: 未登录，无法连接')
      return
    }

    /** uni.connectSocket 在类型上可能为 Promise<SocketTask>，与运行时一致 */
    void Promise.resolve(
      uni.connectSocket({
        url: `${WS_BASE_URL}?token=${token}`,
        header: {
          Authorization: `Bearer ${token}`,
        },
        protocols: ['chat'],
      }),
    ).then((socketTask: UniApp.SocketTask) => {
      socketTask.onOpen(() => {
        console.log('WebSocket 已连接')
        this.reconnectAttempts = 0
        this.connectCallbacks.forEach((cb) => cb())
      })

      socketTask.onMessage((res: UniApp.OnSocketMessageCallbackResult) => {
        try {
          const data = JSON.parse(res.data as string)
          this.handleMessage(data)
        } catch (error) {
          console.error('WebSocket 消息解析失败:', error)
        }
      })

      socketTask.onClose((res: UniNamespace.OnSocketCloseOptions) => {
        console.log('WebSocket 已断开:', res.code, res.reason)
        this.socket = null
        this.disconnectCallbacks.forEach((cb) => cb(String(res.code || 'unknown')))
        this.attemptReconnect()
      })

      socketTask.onError((err: UniApp.GeneralCallbackResult) => {
        console.error('WebSocket 错误:', err)
        this.errorCallbacks.forEach((cb) => cb(err))
      })

      this.socket = socketTask
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  /**
   * 发送消息
   */
  sendMessage(message: {
    conversationId: string
    receiverId: string
    type: string
    content: string
    mediaUrl?: string
    mediaDuration?: number
  }): void {
    if (!this.socket) {
      console.warn('WebSocket 未连接')
      return
    }

    this.socket.send({
      data: JSON.stringify({
        event: 'send_message',
        data: message,
      }),
    })
  }

  /**
   * 加入会话房间
   */
  joinConversation(conversationId: string): void {
    if (!this.socket) {
      console.warn('WebSocket 未连接')
      return
    }

    this.socket.send({
      data: JSON.stringify({
        event: 'join_conversation',
        data: { conversationId },
      }),
    })
  }

  /**
   * 离开会话房间
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket) {
      return
    }

    this.socket.send({
      data: JSON.stringify({
        event: 'leave_conversation',
        data: { conversationId },
      }),
    })
  }

  /**
   * 标记消息已读
   */
  markRead(conversationId: string): void {
    if (!this.socket) {
      console.warn('WebSocket 未连接')
      return
    }

    this.socket.send({
      data: JSON.stringify({
        event: 'mark_read',
        data: { conversationId },
      }),
    })
  }

  /**
   * 发送心跳
   */
  ping(): void {
    if (!this.socket) {
      return
    }

    this.socket.send({
      data: JSON.stringify({ event: 'ping' }),
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: any): void {
    const { event, data: payload } = data

    switch (event) {
      case 'new_message':
        this.messageCallbacks.forEach((cb) => cb(payload))
        break
      case 'message_sent':
        console.log('消息已发送:', payload)
        break
      case 'marked_read':
        console.log('消息已标记已读:', payload)
        break
      case 'error':
        console.error('WebSocket 错误:', payload)
        this.errorCallbacks.forEach((cb) => cb(payload))
        break
      case 'connected':
        console.log('连接成功:', payload)
        break
      case 'pong':
        // 心跳响应
        break
      default:
        console.log('未知事件:', event, payload)
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限')
      return
    }

    this.reconnectAttempts++
    console.log(`WebSocket ${this.reconnectAttempts}秒后尝试重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectAttempts * 1000)
  }

  /**
   * 监听事件
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback)
    return () => {
      const index = this.messageCallbacks.indexOf(callback)
      if (index > -1) {
        this.messageCallbacks.splice(index, 1)
      }
    }
  }

  onConnect(callback: ConnectCallback): () => void {
    this.connectCallbacks.push(callback)
    return () => {
      const index = this.connectCallbacks.indexOf(callback)
      if (index > -1) {
        this.connectCallbacks.splice(index, 1)
      }
    }
  }

  onDisconnect(callback: DisconnectCallback): () => void {
    this.disconnectCallbacks.push(callback)
    return () => {
      const index = this.disconnectCallbacks.indexOf(callback)
      if (index > -1) {
        this.disconnectCallbacks.splice(index, 1)
      }
    }
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback)
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.socket !== null
  }
}

// 单例导出
export const wsService = new WebSocketService()
