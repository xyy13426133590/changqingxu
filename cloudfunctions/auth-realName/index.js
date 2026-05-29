const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertRequired } = require('/opt/validate')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { verifyIdName } = require('/opt/utils/faceid')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { legalName, idCard } = event
  assertRequired({ legalName, idCard }, ['legalName', 'idCard'])

  const normalizedIdCard = String(idCard).trim().toUpperCase()
  const result = await verifyIdName({ name: legalName.trim(), idCard: normalizedIdCard })
  if (!result.pass) {
    const err = new Error(result.message || '实名认证失败')
    err.statusCode = 400
    throw err
  }

  const maskedIdCard = normalizedIdCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  await db.collection('users').doc(userId).update({
    data: {
      legalName: legalName.trim(),
      idCardMasked: maskedIdCard,
      isRealName: true,
      updatedAt: new Date(),
    },
  })

  return { message: '实名认证成功' }
})
