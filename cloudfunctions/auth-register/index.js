const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertPhone, assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { SALT_ROUNDS, DEMO_SMS_CODE } = require('/opt/constants')
const { generateTokens, formatAuthUser } = require('/opt/auth')
const { getUserByPhone } = require('/opt/lib/users')
const { verifySmsCode, createUser, updateLastLogin } = require('/opt/lib/auth-helper')

exports.main = wrapHandler(async (event) => {
  const { phone, password, nickname, code } = event
  assertRequired({ phone, password, nickname }, ['phone', 'password', 'nickname'])
  assertPhone(phone)

  const existing = await getUserByPhone(phone)
  if (existing) {
    const err = new Error('该手机号已被注册')
    err.statusCode = 400
    throw err
  }

  if (code && code !== DEMO_SMS_CODE) {
    await verifySmsCode(db.collection('sms_codes'), phone, code, 'register')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await createUser({ phone, passwordHash, nickname })
  const tokens = await generateTokens(user)
  await updateLastLogin(user._id)

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: formatAuthUser(user),
  }
})
