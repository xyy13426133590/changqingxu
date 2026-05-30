const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db, _ } = require('/opt/db')
const { getConversationById } = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const conversationId = event.conversationId
  assertRequired({ conversationId }, ['conversationId'])

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    const err = new Error('会话不存在')
    err.statusCode = 404
    throw err
  }
  if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
    const err = new Error('无权操作此会话')
    err.statusCode = 403
    throw err
  }

  const isUser1 = conversation.userId1 === userId
  const clearedCount = isUser1 ? (conversation.unreadCount1 || 0) : (conversation.unreadCount2 || 0)
  const convUpdate = { updatedAt: new Date() }
  if (isUser1) convUpdate.unreadCount1 = 0
  else convUpdate.unreadCount2 = 0
  await db.collection('dev_conversations').doc(conversationId).update({ data: convUpdate })

  const unread = await db.collection('dev_messages').where({
    conversationId,
    receiverId: userId,
    isRead: false,
  }).get()

  for (const msg of unread.data) {
    await db.collection('dev_messages').doc(msg._id).update({ data: { isRead: true } })
  }

  return { message: '标记成功', clearedCount }
})
