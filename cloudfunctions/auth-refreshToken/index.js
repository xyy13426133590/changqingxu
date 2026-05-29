const cloud = require('wx-server-sdk')
const jwt = require('jsonwebtoken')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertRequired } = require('/opt/validate')
const { getUserById } = require('/opt/lib/users')

exports.main = wrapHandler(async (event) => {
  const { refreshToken } = event
  assertRequired({ refreshToken }, ['refreshToken'])

  try {
    const secret = process.env.JWT_SECRET || 'changqingxu-dev-secret-change-me'
    const payload = jwt.verify(refreshToken, secret)
    const user = await getUserById(payload.sub)
    if (!user || user.status !== 'active') {
      const err = new Error('用户不存在')
      err.statusCode = 401
      throw err
    }
    const accessToken = jwt.sign(
      { sub: user._id, phone: user.phone || '' },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    )
    return { accessToken }
  } catch {
    const err = new Error('刷新令牌无效或已过期')
    err.statusCode = 401
    throw err
  }
})
