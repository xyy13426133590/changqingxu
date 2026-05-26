/**
 * 云函数：login
 * event: { phone, password, token? }
 */
const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const USERS = 'cq_users'
const SESSIONS = 'cq_auth_sessions'
const SESSION_ACCESS_MS = 7 * 24 * 60 * 60 * 1000
const SESSION_REFRESH_MS = 30 * 24 * 60 * 60 * 1000

function nowIso() {
  return new Date().toISOString()
}

function ok(data) {
  return { code: 'SUCCESS', message: '请求成功', data, timestamp: nowIso() }
}

function rejectResponse(message, code = 'BAD_REQUEST') {
  return { code, message, data: null, timestamp: nowIso() }
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex')
}

function sanitizePhone(p) {
  return String(p || '')
    .trim()
    .replace(/\s+/g, '')
}

function formatUserDoc(doc) {
  return {
    id: doc._id,
    phone: doc.phone || '',
    nickname: doc.nickname || '用户',
    avatar: doc.avatar || '',
    isRealName: !!doc.isRealName,
    isFaceVerified: !!doc.isFaceVerified,
    isVip: !!doc.isVip,
  }
}

async function createSession(db, userId, openId) {
  const accessToken = randomToken()
  const refreshToken = randomToken()
  const t = Date.now()
  await db.collection(SESSIONS).add({
    data: {
      userId,
      accessToken,
      refreshToken,
      accessExpiresAt: new Date(t + SESSION_ACCESS_MS),
      refreshExpiresAt: new Date(t + SESSION_REFRESH_MS),
      openId: openId || '',
      createdAt: new Date(t),
    },
  })
  return { accessToken, refreshToken }
}

exports.main = async (event) => {
  const db = cloud.database()
  try {
    const phone = sanitizePhone(event.phone)
    const password = String(event.password || '')

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return rejectResponse('请输入正确的手机号')
    }
    if (password.length < 6 || password.length > 32) {
      return rejectResponse('密码长度为 6～32 位')
    }

    const { data } = await db.collection(USERS).where({ phone }).limit(1).get()

    if (!data || data.length === 0) {
      return rejectResponse('手机号或密码错误', 'UNAUTHORIZED')
    }

    const row = data[0]
    if (!row.passwordHash) {
      return rejectResponse('该账号仅支持其它登录方式', 'FORBIDDEN')
    }

    const match = bcrypt.compareSync(password, row.passwordHash)
    if (!match) {
      return rejectResponse('手机号或密码错误', 'UNAUTHORIZED')
    }

    const wxCtx = cloud.getWXContext ? cloud.getWXContext() : {}
    const openId = wxCtx.OPENID || ''

    const { accessToken, refreshToken } = await createSession(db, row._id, openId)

    await db.collection(USERS).doc(row._id).update({
      data: {
        lastLoginAt: new Date(),
        ...(openId && !row.openId ? { openId } : {}),
      },
    })

    return ok({
      accessToken,
      refreshToken,
      user: formatUserDoc(row),
    })
  } catch (e) {
    console.error('login error', e)
    return rejectResponse(e.message || '登录失败', 'INTERNAL_ERROR')
  }
}
