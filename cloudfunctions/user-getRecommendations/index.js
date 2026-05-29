const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const {
  getUserById,
  getMatchedUserIds,
  queryRecommendationUsers,
  formatUserCard,
} = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const page = Number(event.page) || 1
  const limit = Number(event.limit) || 10

  const user = await getUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }

  const matchedUserIds = await getMatchedUserIds(userId)
  const skip = (page - 1) * limit
  let recycled = false

  let users = await queryRecommendationUsers(userId, matchedUserIds, true)
  if (users.length === 0) {
    users = await queryRecommendationUsers(userId, matchedUserIds, false)
  }
  if (users.length === 0 && matchedUserIds.length > 0) {
    users = await queryRecommendationUsers(userId, [], false)
    recycled = users.length > 0
  }

  const total = users.length
  const pageUsers = users.slice(skip, skip + limit)
  const result = {
    users: pageUsers.map((u) => formatUserCard(u)),
    total,
  }
  if (recycled) result.recycled = true
  return result
})
