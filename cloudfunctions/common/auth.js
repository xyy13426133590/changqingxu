const jwt = require('jsonwebtoken')

function getJwtSecret() {
  return process.env.JWT_SECRET || 'changqingxu-dev-secret-change-me'
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
  if (event?.token) return event.token
  const auth = event?.headers?.authorization || event?.headers?.Authorization
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7)
  return null
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
  formatAuthUser,
}
