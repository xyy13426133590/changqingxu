const { db } = require('/opt/db')
const { USER_COLLECTION } = require('/opt/constants')
const { generateUUID } = require('/opt/utils/crypto')
const { getUserById } = require('./users')

async function verifySmsCode(dbCol, phone, code, type) {
  const { DEMO_SMS_CODE } = require('/opt/constants')
  if (code === DEMO_SMS_CODE) return

  const res = await dbCol.where({ phone, code, type, isUsed: false })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()
  const smsCode = res.data[0]
  if (!smsCode) {
    const err = new Error('验证码错误或已过期')
    err.statusCode = 401
    throw err
  }
  if (new Date(smsCode.expiresAt) < new Date()) {
    const err = new Error('验证码已过期')
    err.statusCode = 401
    throw err
  }
  await dbCol.doc(smsCode._id).update({ data: { isUsed: true } })
}

async function createUser(data) {
  const id = generateUUID()
  const now = new Date()
  const user = {
    _id: id,
    phone: data.phone || '',
    passwordHash: data.passwordHash || '',
    wechatOpenid: data.wechatOpenid || '',
    wechatUnionid: data.wechatUnionid || '',
    nickname: data.nickname || '',
    avatar: data.avatar || '',
    gender: data.gender || 'unknown',
    status: 'active',
    hobbies: [],
    filterSettings: {},
    isRealName: false,
    isFaceVerified: false,
    isVip: false,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection(USER_COLLECTION).doc(id).set({ data: user })
  return user
}

async function updateLastLogin(userId) {
  await db.collection(USER_COLLECTION).doc(userId).update({
    data: { lastLoginAt: new Date(), updatedAt: new Date() },
  })
}

module.exports = {
  verifySmsCode,
  createUser,
  updateLastLogin,
}
