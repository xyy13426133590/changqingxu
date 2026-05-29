const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { getUserById, formatUserCard } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const currentUserId = await requireAuth(event)
  const targetId = event.userId || event.id
  assertRequired({ userId: targetId }, ['userId'])

  const user = await getUserById(targetId)
  if (!user || user.status !== 'active') {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }
  return formatUserCard(user)
})
