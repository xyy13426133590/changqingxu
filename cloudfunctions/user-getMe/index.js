const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { getUserById, formatUserResponse, isActiveUser } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await getUserById(userId)
  if (!user || !isActiveUser(user)) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }
  return formatUserResponse(user)
})
