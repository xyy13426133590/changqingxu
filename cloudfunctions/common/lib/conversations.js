const { db, _ } = require('/opt/db')
const { CONVERSATION_COLLECTION, MESSAGE_COLLECTION } = require('/opt/constants')
const { generateUUID } = require('/opt/utils/crypto')
const { getUserById } = require('./users')

const CONV_COL = CONVERSATION_COLLECTION
const MSG_COL = MESSAGE_COLLECTION

async function getConversationById(id) {
  const res = await db.collection(CONV_COL).doc(id).get()
  return res.data || null
}

async function findConversation(userId1, userId2) {
  const res = await db.collection(CONV_COL).where(
    _.or([
      { userId1, userId2 },
      { userId1: userId2, userId2: userId1 },
    ]),
  ).limit(1).get()
  return res.data[0] || null
}

async function getLastMessage(messageId) {
  if (!messageId) return null
  try {
    const res = await db.collection(MSG_COL).doc(messageId).get()
    return res.data || null
  } catch {
    return null
  }
}

function formatConversationResponse(conversation, currentUserId, targetUser, lastMessage) {
  const isUser1 = conversation.userId1 === currentUserId
  const targetUserId = isUser1 ? conversation.userId2 : conversation.userId1
  const unreadCount = isUser1 ? conversation.unreadCount1 : conversation.unreadCount2
  const isPinned = isUser1 ? conversation.isPinned1 : conversation.isPinned2
  return {
    id: conversation._id,
    userId: currentUserId,
    targetUserId: targetUser?._id || targetUserId,
    targetUser: {
      id: targetUser?._id || targetUserId,
      nickname: targetUser?.nickname || '',
      avatar: targetUser?.avatar || '',
    },
    lastMessage: lastMessage
      ? {
          id: lastMessage._id,
          content: lastMessage.content,
          type: lastMessage.type,
          createdAt: lastMessage.createdAt,
        }
      : null,
    unreadCount: unreadCount || 0,
    isPinned: !!isPinned,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }
}

async function enrichConversation(conversation, currentUserId) {
  const isUser1 = conversation.userId1 === currentUserId
  const targetUserId = isUser1 ? conversation.userId2 : conversation.userId1
  const targetUser = await getUserById(targetUserId)
  const lastMessage = await getLastMessage(conversation.lastMessageId)
  return formatConversationResponse(conversation, currentUserId, targetUser, lastMessage)
}

async function createConversationDoc(userId, targetUserId) {
  const now = new Date()
  const id = generateUUID()
  const data = {
    _id: id,
    userId1: userId,
    userId2: targetUserId,
    lastMessageId: null,
    lastMessageAt: null,
    unreadCount1: 0,
    unreadCount2: 0,
    isPinned1: false,
    isPinned2: false,
    isBlocked: false,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection(CONV_COL).doc(id).set({ data })
  return data
}

function formatMessageResponse(message) {
  return {
    id: message._id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    type: message.type,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaDuration: message.mediaDuration,
    isRead: !!message.isRead,
    createdAt: message.createdAt,
  }
}

module.exports = {
  getConversationById,
  findConversation,
  enrichConversation,
  createConversationDoc,
  formatConversationResponse,
  formatMessageResponse,
}
