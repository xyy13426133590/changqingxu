const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { formatUserCard } = require('/opt/lib/users')
const { USER_COLLECTION, MATCH_COLLECTION } = require('/opt/constants')

const USER_COL = USER_COLLECTION
const MATCH_COL = MATCH_COLLECTION

function isActiveUser(user) {
  if (!user) return false
  return !user.status || user.status === 'active'
}

function applyUserFilters(users, filterSettings) {
  const fs = filterSettings || {}
  const { ageRange, education, incomeRange } = fs
  return users.filter((u) => {
    if (ageRange?.min != null && ageRange?.max != null && u.age != null) {
      if (u.age < ageRange.min || u.age > ageRange.max) return false
    }
    if (Array.isArray(education) && education.length > 0) {
      if (!education.includes(u.education)) return false
    }
    if (incomeRange?.min) {
      const target = incomeRange.max || incomeRange.min
      if (u.income !== target && u.income !== incomeRange.min) return false
    }
    return true
  })
}

async function getDevUserById(userId) {
  const res = await db.collection(USER_COL).doc(userId).get()
  return res.data || null
}

async function getMatchedUserIds(userId) {
  try {
    const res = await db.collection(MATCH_COL).where({ userId }).field({ targetUserId: true }).get()
    return (res.data || []).map((m) => m.targetUserId)
  } catch {
    return []
  }
}

async function queryRecommendations(userId, matchedUserIds, applyFilters) {
  const exclude = new Set([userId, ...(matchedUserIds || [])].filter(Boolean))
  const res = await db.collection(USER_COL).limit(100).get()
  let users = (res.data || []).filter((u) => isActiveUser(u) && !exclude.has(u._id))

  if (applyFilters) {
    const me = await getDevUserById(userId)
    users = applyUserFilters(users, me?.filterSettings)
  }

  return users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const page = Number(event.page) || 1
  const limit = Number(event.limit) || 10

  const user = await getDevUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }

  const matchedUserIds = await getMatchedUserIds(userId)
  const skip = (page - 1) * limit
  let recycled = false

  let users = await queryRecommendations(userId, matchedUserIds, true)
  if (users.length === 0) {
    users = await queryRecommendations(userId, matchedUserIds, false)
  }
  if (users.length === 0 && matchedUserIds.length > 0) {
    users = await queryRecommendations(userId, [], false)
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
