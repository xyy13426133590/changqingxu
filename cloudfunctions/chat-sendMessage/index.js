const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { generateUUID } = require('/opt/utils/crypto')
const { getConversationById, formatMessageResponse } = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const senderId = await requireAuth(event)
  const { conversationId, receiverId, type = 'text', content, mediaUrl, mediaDuration } = event
  assertRequired({ conversationId, receiverId, content }, ['conversationId', 'receiverId', 'content'])

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    const err = new Error('会话不存在')
    err.statusCode = 404
    throw err
  }
  if (conversation.userId1 !== senderId && conversation.userId2 !== senderId) {
    const err = new Error('无权在此会话发送消息')
    err.statusCode = 403
    throw err
  }

  const now = new Date()
  const id = generateUUID()
  const message = {
    _id: id,
    conversationId,
    senderId,
    receiverId,
    type,
    content,
    mediaUrl: mediaUrl || null,
    mediaDuration: mediaDuration || null,
    isRead: false,
    createdAt: now,
  }
  await db.collection('messages').doc(id).set({ data: message })

  const isUser1 = conversation.userId1 === senderId
  const convUpdate = {
    lastMessageId: id,
    lastMessageAt: now,
    updatedAt: now,
  }
  if (isUser1) {
    convUpdate.unreadCount2 = (conversation.unreadCount2 || 0) + 1
  } else {
    convUpdate.unreadCount1 = (conversation.unreadCount1 || 0) + 1
  }
  await db.collection('conversations').doc(conversationId).update({ data: convUpdate })

  return formatMessageResponse(message)
})
