const { db } = require('/opt/db')
const { USER_COLLECTION, MATCH_COLLECTION } = require('/opt/constants')
const { calculateAge, calculateZodiacInfo } = require('/opt/utils/date')

const USER_COL = USER_COLLECTION

function isActiveUser(user) {
  if (!user) return false
  const status = user.status
  return !status || status === 'active'
}

async function getUserById(userId) {
  const res = await db.collection(USER_COL).doc(userId).get()
  return res.data || null
}

async function getUserByPhone(phone) {
  const res = await db.collection(USER_COL).where({ phone }).limit(20).get()
  const user = (res.data || []).find(isActiveUser)
  return user || null
}

async function getUserByOpenid(openid) {
  const res = await db.collection(USER_COL).where({ wechatOpenid: openid }).limit(1).get()
  return res.data[0] || null
}

function formatUserResponse(user) {
  return {
    id: user._id,
    phone: user.phone || '',
    nickname: user.nickname || '',
    avatar: user.avatar || '',
    gender: user.gender || 'unknown',
    age: user.age,
    height: user.height,
    location: user.location || '',
    zodiac: user.zodiac || '',
    zodiacSign: user.zodiacSign || '',
    mbti: user.mbti || '',
    education: user.education || '',
    occupation: user.occupation || '',
    income: user.income || '',
    bio: user.bio || '',
    hobbies: user.hobbies || [],
    isRealName: !!user.isRealName,
    isFaceVerified: !!user.isFaceVerified,
    isVip: !!user.isVip,
    vipExpiry: user.vipExpiry,
    filterSettings: user.filterSettings || {},
    createdAt: user.createdAt,
  }
}

function formatUserCard(user) {
  const matchReasons = ['生肖三合', '星座配对', '日柱相生', '五行互补']
  const matchTaglines = ['志趣相投', '天生一对', '缘分天定', '相辅相成']
  return {
    id: user._id,
    nickname: user.nickname || '',
    avatar: user.avatar || '',
    gender: user.gender || 'unknown',
    age: user.age,
    height: user.height,
    weight: user.weight ?? null,
    hometown: user.hometown || '',
    location: user.location || '',
    zodiac: user.zodiac || '',
    zodiacSign: user.zodiacSign || '',
    mbti: user.mbti || '',
    riyuan: user.riyuan || '',
    education: user.education || '',
    school: user.school || '',
    schoolTier: user.schoolTier ?? null,
    occupation: user.occupation || '',
    jobLevel: user.jobLevel || '',
    company: user.company || '',
    income: user.income || '',
    bio: user.bio || '',
    hobbies: user.hobbies || [],
    isRealName: !!user.isRealName,
    isFaceVerified: !!user.isFaceVerified,
    isVip: !!user.isVip,
    matchReason: matchReasons[Math.floor(Math.random() * matchReasons.length)],
    matchTagline: matchTaglines[Math.floor(Math.random() * matchTaglines.length)],
    matchScore: Math.floor(Math.random() * 30) + 70,
  }
}

function applyProfileUpdates(user, updates) {
  const result = { ...updates }
  if (updates.birthday) {
    const birthDate = new Date(updates.birthday)
    result.age = calculateAge(birthDate)
    Object.assign(result, calculateZodiacInfo(birthDate))
  }
  return result
}

async function getMatchedUserIds(userId) {
  const res = await db.collection(MATCH_COLLECTION).where({ userId }).field({ targetUserId: true }).get()
  return res.data.map((m) => m.targetUserId)
}

function applyUserFilters(users, filterSettings) {
  const fs = filterSettings || {}
  const { ageRange, education, incomeRange } = fs
  return users.filter((u) => {
    if (ageRange?.min != null && ageRange?.max != null && u.age != null) {
      if (u.age < ageRange.min || u.age > ageRange.max) return false
    }
    if (Array.isArray(education) && education.length > 0) {
      if (!education.includes(u.education)) return false
    }
    if (incomeRange?.min) {
      const target = incomeRange.max || incomeRange.min
      if (u.income !== target && u.income !== incomeRange.min) return false
    }
    return true
  })
}

async function listActiveUsers(limit = 100) {
  const res = await db.collection(USER_COL).limit(limit).get()
  return (res.data || []).filter(isActiveUser)
}

async function queryRecommendationUsers(userId, matchedUserIds, applyFilters, take, randomOrder = false) {
  const exclude = new Set([userId, ...(matchedUserIds || [])].filter(Boolean))
  let users = (await listActiveUsers(100)).filter((u) => !exclude.has(u._id))

  if (applyFilters) {
    const current = await getUserById(userId)
    users = applyUserFilters(users, current?.filterSettings)
  }

  if (randomOrder) {
    users = users.sort(() => Math.random() - 0.5)
  } else {
    users = users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }

  if (take != null && take > 0) {
    users = users.slice(0, take)
  }
  return users
}

module.exports = {
  USER_COL,
  isActiveUser,
  getUserById,
  getUserByPhone,
  getUserByOpenid,
  formatUserResponse,
  formatUserCard,
  applyProfileUpdates,
  getMatchedUserIds,
  listActiveUsers,
  applyUserFilters,
  queryRecommendationUsers,
}
