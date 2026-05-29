const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { getConversationById, formatMessageResponse } = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const conversationId = event.conversationId || event.id
  const page = Number(event.page) || 1
  const limit = Number(event.limit) || 20
  assertRequired({ conversationId }, ['conversationId'])

  const conversation = await getConversationById(conversationId)
  if (!conversation) {
    const err = new Error('会话不存在')
    err.statusCode = 404
    throw err
  }
  if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
    const err = new Error('无权查看此会话')
    err.statusCode = 403
    throw err
  }

  const res = await db.collection('messages')
    .where({ conversationId })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * limit)
    .limit(limit)
    .get()

  const countRes = await db.collection('messages').where({ conversationId }).count()
  const messages = res.data.reverse().map(formatMessageResponse)

  return { messages, total: countRes.total }
})
