const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { getUserById } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await getUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }

  const { token, ...filterUpdates } = event
  const filterSettings = { ...(user.filterSettings || {}), ...filterUpdates }
  await db.collection('dev_users').doc(userId).update({
    data: { filterSettings, updatedAt: new Date() },
  })

  return { filterSettings }
})
