const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { setMatchAction } = require('/opt/lib/matches')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const targetUserId = event.targetUserId
  assertRequired({ targetUserId }, ['targetUserId'])
  return setMatchAction(userId, targetUserId, 'super_like')
})
