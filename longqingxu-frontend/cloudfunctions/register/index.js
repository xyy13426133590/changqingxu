/**
 * 云函数：register
 * event: { phone, password, nickname, code?, token? }
 */
const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const USERS = 'cq_users'
const SESSIONS = 'cq_auth_sessions'
const DEMO_SMS = '888888'
const SALT_ROUNDS = 10
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

function demoCodeOk(code) {
  if (!code || String(code).trim() === '') return true
  return String(code).trim() === DEMO_SMS
}

exports.main = async (event) => {
  const db = cloud.database()
  try {
    const phone = sanitizePhone(event.phone)
    const password = String(event.password || '')
    const nickname = String(event.nickname || '').trim()
    const code = event.code

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return rejectResponse('请输入正确的手机号')
    }
    if (password.length < 6 || password.length > 32) {
      return rejectResponse('密码长度为 6～32 位')
    }
    if (nickname.length < 2 || nickname.length > 16) {
      return rejectResponse('昵称长度为 2～16 个字')
    }
    if (!demoCodeOk(code)) {
      return rejectResponse('验证码错误')
    }

    const dup = await db.collection(USERS).where({ phone }).limit(1).get()
    if (dup.data && dup.data.length > 0) {
      return rejectResponse('该手机号已被注册', 'CONFLICT')
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS)
    const wxCtx = cloud.getWXContext ? cloud.getWXContext() : {}
    const openId = wxCtx.OPENID || ''

    const addRes = await db.collection(USERS).add({
      data: {
        phone,
        passwordHash,
        nickname,
        avatar: '',
        gender: 'unknown',
        isRealName: false,
        isFaceVerified: false,
        isVip: false,
        vipExpiry: null,
        openId: openId || '',
        filterSettings: {},
        status: 'active',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
        lastLoginAt: db.serverDate(),
      },
    })

    const userId = addRes._id

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

    return ok({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        phone,
        nickname,
        avatar: '',
        isRealName: false,
        isFaceVerified: false,
        isVip: false,
      },
    })
  } catch (e) {
    console.error('register error', e)
    return rejectResponse(e.message || '注册失败', 'INTERNAL_ERROR')
  }
}
