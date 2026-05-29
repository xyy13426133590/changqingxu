const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertPhone } = require('/opt/validate')
const { db } = require('/opt/db')
const { generateUUID } = require('/opt/utils/crypto')
const { DEMO_SMS_CODE } = require('/opt/constants')
const { isSmsDemoMode, isSmsConfigured, sendTencentSms } = require('/opt/utils/tencent-sms')

function generateSmsCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

exports.main = wrapHandler(async (event) => {
  const { phone, type = 'login' } = event
  assertPhone(phone)

  const demoMode = isSmsDemoMode() || !isSmsConfigured()
  const code = demoMode ? DEMO_SMS_CODE : generateSmsCode()
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 5)
  const id = generateUUID()

  if (!demoMode) {
    await sendTencentSms(phone, code)
  }

  await db.collection('sms_codes').doc(id).set({
    data: {
      _id: id,
      phone,
      code,
      type,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    },
  })

  const result = { message: '验证码发送成功' }
  if (demoMode) {
    result.code = code
  }
  return result
})
