const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { USER_COLLECTION } = require('/opt/constants')

const USER_COL = USER_COLLECTION

function isActiveUser(user) {
  if (!user) return false
  return !user.status || user.status === 'active'
}

exports.main = wrapHandler(async (event) => {
  let userId = null
  try {
    userId = await requireAuth(event)
  } catch {
    // 允许未登录时也返回集合统计
  }

  const res = await db.collection(USER_COL).limit(100).get()
  const activeUsers = (res.data || []).filter(isActiveUser)
  const me = userId
    ? activeUsers.find((u) => u._id === userId) || (await db.collection(USER_COL).doc(userId).get()).data
    : null
  const others = userId
    ? activeUsers.filter((u) => u._id !== userId)
    : activeUsers

  return {
    collection: USER_COL,
    userId,
    yourUserFound: !!me,
    yourUserActive: me ? isActiveUser(me) : false,
    totalActiveUsers: activeUsers.length,
    recommendableForYou: others.length,
    sampleNicknames: others.slice(0, 5).map((u) => u.nickname || u._id),
  }
})
