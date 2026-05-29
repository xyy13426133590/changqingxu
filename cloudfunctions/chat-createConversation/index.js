const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { getUserById } = require('/opt/lib/users')
const {
  findConversation,
  createConversationDoc,
  enrichConversation,
} = require('/opt/lib/conversations')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const targetUserId = event.targetUserId
  assertRequired({ targetUserId }, ['targetUserId'])

  const targetUser = await getUserById(targetUserId)
  if (!targetUser || targetUser.status !== 'active') {
    const err = new Error('目标用户不存在')
    err.statusCode = 404
    throw err
  }

  let conversation = await findConversation(userId, targetUserId)
  if (!conversation) {
    conversation = await createConversationDoc(userId, targetUserId)
  }
  return enrichConversation(conversation, userId)
})
