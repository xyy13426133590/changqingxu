const jwt = require('jsonwebtoken')

/** 优先云控制台 JWT_SECRET；未配置时仅用于本地/演示，生产务必在控制台配置 */
function getJwtSecret() {
  const fromEnv = (process.env.JWT_SECRET || '').trim()
  return fromEnv || 'changqingxu-dev-secret-change-me'
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '7d'
}

function getRefreshExpiresIn() {
  return process.env.JWT_REFRESH_EXPIRES_IN || '30d'
}

async function generateTokens(user) {
  const payload = { sub: user._id, phone: user.phone || '' }
  const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() })
  const refreshToken = jwt.sign(payload, getJwtSecret(), { expiresIn: getRefreshExpiresIn() })
  return { accessToken, refreshToken }
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret())
}

function extractToken(event) {
  const raw = event?.token ?? event?.data?.token
  if (!raw || typeof raw !== 'string') return null
  let t = raw.trim()
  if (t.startsWith('Bearer ')) t = t.slice(7).trim()
  return t || null
}

async function requireAuth(event) {
  const token = extractToken(event)
  if (!token) {
    const err = new Error('请先登录')
    err.statusCode = 401
    throw err
  }
  try {
    const payload = verifyToken(token)
    return payload.sub
  } catch {
    const err = new Error('请先登录')
    err.statusCode = 401
    throw err
  }
}

/** 有 token 则解析 userId，无 token 或无效则返回 null（游客） */
async function optionalAuth(event) {
  const token = extractToken(event)
  if (!token) return null
  try {
    const payload = verifyToken(token)
    return payload.sub || null
  } catch {
    return null
  }
}

function formatAuthUser(user) {
  return {
    id: user._id,
    phone: user.phone || '',
    nickname: user.nickname || '',
    avatar: user.avatar || '',
    isRealName: !!user.isRealName,
    isFaceVerified: !!user.isFaceVerified,
    isVip: !!user.isVip,
  }
}

module.exports = {
  generateTokens,
  verifyToken,
  extractToken,
  requireAuth,
  optionalAuth,
  formatAuthUser,
}
