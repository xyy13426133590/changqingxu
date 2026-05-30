const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { formatMatchResponse } = require('/opt/lib/matches')
const { getUserById } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const res = await db.collection('dev_matches')
    .where({ userId, isMutual: true })
    .orderBy('createdAt', 'desc')
    .get()

  const results = []
  for (const match of res.data) {
    const targetUser = await getUserById(match.targetUserId)
    if (targetUser) {
      results.push(formatMatchResponse(match, targetUser))
    }
  }
  return results
})
