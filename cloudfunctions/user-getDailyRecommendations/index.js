const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { DAILY_RECOMMENDATION_COUNT } = require('/opt/constants')
const {
  getMatchedUserIds,
  queryRecommendationUsers,
  formatUserCard,
} = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const matchedUserIds = await getMatchedUserIds(userId)

  let users = await queryRecommendationUsers(
    userId,
    matchedUserIds,
    false,
    DAILY_RECOMMENDATION_COUNT,
    true,
  )
  let recycled = false
  if (users.length === 0 && matchedUserIds.length > 0) {
    users = await queryRecommendationUsers(
      userId,
      [],
      false,
      DAILY_RECOMMENDATION_COUNT,
      true,
    )
    recycled = users.length > 0
  }

  const result = { users: users.map((u) => formatUserCard(u)) }
  if (recycled) result.recycled = true
  return result
})
