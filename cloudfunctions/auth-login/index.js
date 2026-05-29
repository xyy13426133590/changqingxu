const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertPhone, assertRequired } = require('/opt/validate')
const { generateTokens, formatAuthUser } = require('/opt/auth')
const { getUserByPhone } = require('/opt/lib/users')
const { updateLastLogin } = require('/opt/lib/auth-helper')

exports.main = wrapHandler(async (event) => {
  const { phone, password } = event
  assertRequired({ phone, password }, ['phone', 'password'])
  assertPhone(phone)

  const user = await getUserByPhone(phone)
  if (!user || !user.passwordHash) {
    const err = new Error('手机号或密码错误')
    err.statusCode = 401
    throw err
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const err = new Error('手机号或密码错误')
    err.statusCode = 401
    throw err
  }

  const tokens = await generateTokens(user)
  await updateLastLogin(user._id)

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: formatAuthUser(user),
  }
})
