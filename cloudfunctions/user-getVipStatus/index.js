const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { getUserById } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const user = await getUserById(userId)
  if (!user) {
    const err = new Error('用户不存在')
    err.statusCode = 404
    throw err
  }

  const now = new Date()
  const isVipActive = user.isVip && user.vipExpiry && new Date(user.vipExpiry) > now

  return {
    isVip: !!isVipActive,
    vipExpiry: user.vipExpiry,
    daysRemaining: isVipActive
      ? Math.ceil((new Date(user.vipExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  }
})
