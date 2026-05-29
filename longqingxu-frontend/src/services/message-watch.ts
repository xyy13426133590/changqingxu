/**
 * 云数据库消息 watch — 替代 Socket.IO 实时推送
 */
import { USE_CLOUD, CLOUD_ENV } from './cloud'
import type { Message } from './api-conversation'

type MessageWatcher = UniApp.RealtimeListener | null

let watcher: MessageWatcher = null

function mapDocToMessage(doc: Record<string, unknown>): Message {
  return {
    id: String(doc._id || doc.id),
    conversationId: String(doc.conversationId),
    senderId: String(doc.senderId),
    receiverId: String(doc.receiverId),
    type: doc.type as Message['type'],
    content: String(doc.content || ''),
    mediaUrl: doc.mediaUrl as string | undefined,
    mediaDuration: doc.mediaDuration as number | undefined,
    isRead: !!doc.isRead,
    createdAt: String(doc.createdAt),
  }
}

export function startMessageWatch(
  conversationId: string,
  onNewMessage: (message: Message) => void,
): void {
  if (!USE_CLOUD || !conversationId) return

  stopMessageWatch()

  // #ifdef MP-WEIXIN
  const db = wx.cloud.database({ env: CLOUD_ENV })
  watcher = db.collection('messages')
    .where({ conversationId })
    .watch({
      onChange: (snapshot) => {
        if (snapshot.type === 'init') return
        for (const change of snapshot.docChanges) {
          if (change.queueType === 'enqueue' && change.dataType === 'add') {
            onNewMessage(mapDocToMessage(change.doc as Record<string, unknown>))
          }
        }
      },
      onError: (err) => {
        console.warn('[message-watch]', err)
      },
    })
  // #endif
}

export function stopMessageWatch(): void {
  if (watcher) {
    watcher.close()
    watcher = null
  }
}
