const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertPhone, assertRequired } = require('/opt/validate')
const { db } = require('/opt/db')
const { generateTokens, formatAuthUser } = require('/opt/auth')
const { getUserByPhone } = require('/opt/lib/users')
const { verifySmsCode, createUser, updateLastLogin } = require('/opt/lib/auth-helper')

exports.main = wrapHandler(async (event) => {
  const { phone, code } = event
  assertRequired({ phone, code }, ['phone', 'code'])
  assertPhone(phone)

  await verifySmsCode(db.collection('sms_codes'), phone, code, 'login')

  let user = await getUserByPhone(phone)
  if (!user) {
    user = await createUser({
      phone,
      nickname: `用户${phone.slice(-4)}`,
    })
  }

  const tokens = await generateTokens(user)
  await updateLastLogin(user._id)

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: formatAuthUser(user),
  }
})
