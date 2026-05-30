const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db, _ } = require('/opt/db')
const { enrichConversation } = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const res = await db.collection('dev_conversations').where(
    _.or([{ userId1: userId }, { userId2: userId }]),
  ).orderBy('lastMessageAt', 'desc').get()

  const list = []
  for (const conv of res.data) {
    list.push(await enrichConversation(conv, userId))
  }
  list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    const ta = a.lastMessage?.createdAt || a.updatedAt
    const tb = b.lastMessage?.createdAt || b.updatedAt
    return new Date(tb) - new Date(ta)
  })
  return list
})
