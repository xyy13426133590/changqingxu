const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { getConversationById } = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const conversationId = event.conversationId || event.id
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

  await db.collection('dev_conversations').doc(conversationId).remove()
  await db.collection('dev_messages').where({ conversationId }).remove()

  return { message: '会话已删除' }
})
