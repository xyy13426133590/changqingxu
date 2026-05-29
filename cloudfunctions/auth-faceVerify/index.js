const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { assertRequired } = require('/opt/validate')
const { requireAuth } = require('/opt/auth')
const { db } = require('/opt/db')
const { getUserById } = require('/opt/lib/users')
const { createLivenessBizToken, getLivenessResult } = require('/opt/utils/faceid')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { action = 'confirm', bizToken } = event

  if (action === 'getToken') {
    const user = await getUserById(userId)
    if (!user) {
      const err = new Error('用户不存在')
      err.statusCode = 404
      throw err
    }
    if (!user.isRealName || !user.legalName) {
      const err = new Error('请先完成实名认证')
      err.statusCode = 400
      throw err
    }
    const token = await createLivenessBizToken({
      userId,
      name: user.legalName,
      idCard: event.idCard || user.idCardMasked || '',
    })
    return { bizToken: token }
  }

  assertRequired({ bizToken }, ['bizToken'])
  const result = await getLivenessResult(bizToken)
  if (!result.success) {
    const err = new Error(result.message || '人脸核验未通过')
    err.statusCode = 400
    throw err
  }

  await db.collection('users').doc(userId).update({
    data: { isFaceVerified: true, updatedAt: new Date() },
  })

  return { message: '人脸核验成功' }
})
