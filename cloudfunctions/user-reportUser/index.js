const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const targetUserId = event.userId || event.id
  const { reason } = event
  assertRequired({ targetUserId, reason }, ['userId', 'reason'])

  console.log(`用户 ${userId} 举报了用户 ${targetUserId}: ${reason}`)
  return { message: '举报成功，我们会尽快处理' }
})
