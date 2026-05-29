const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { getUserById, formatUserResponse, applyProfileUpdates } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await getUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }

  const { token, ...updates } = event
  const profileUpdates = applyProfileUpdates(user, updates)
  await db.collection('users').doc(userId).update({
    data: { ...profileUpdates, updatedAt: new Date() },
  })

  const updated = await getUserById(userId)
  return formatUserResponse(updated)
})
