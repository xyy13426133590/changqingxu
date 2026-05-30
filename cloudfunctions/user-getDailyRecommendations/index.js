const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { formatUserCard } = require('/opt/lib/users')
const { USER_COLLECTION, MATCH_COLLECTION } = require('/opt/constants')

const USER_COL = USER_COLLECTION
const MATCH_COL = MATCH_COLLECTION
const DAILY_COUNT = 10

function isActiveUser(user) {
  if (!user) return false
  return !user.status || user.status === 'active'
}

async function getMatchedUserIds(userId) {
  try {
    const res = await db.collection(MATCH_COL).where({ userId }).field({ targetUserId: true }).get()
    return (res.data || []).map((m) => m.targetUserId)
  } catch {
    return []
  }
}

async function queryDailyUsers(userId, matchedUserIds) {
  const exclude = new Set([userId, ...(matchedUserIds || [])].filter(Boolean))
  const res = await db.collection(USER_COL).limit(100).get()
  return (res.data || [])
    .filter((u) => isActiveUser(u) && !exclude.has(u._id))
    .sort(() => Math.random() - 0.5)
    .slice(0, DAILY_COUNT)
}

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const matchedUserIds = await getMatchedUserIds(userId)

  let users = await queryDailyUsers(userId, matchedUserIds)
  let recycled = false
  if (users.length === 0 && matchedUserIds.length > 0) {
    users = await queryDailyUsers(userId, [])
    recycled = users.length > 0
  }

  const result = { users: users.map((u) => formatUserCard(u)) }
  if (recycled) result.recycled = true
  return result
})
