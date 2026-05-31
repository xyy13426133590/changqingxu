const { db, _ } = require('/opt/db')
const { MATCH_COLLECTION } = require('/opt/constants')
const { generateUUID } = require('/opt/utils/crypto')
const { prepareSetPayload, prepareUpdatePayload } = require('/opt/utils/db-write')
const { getUserById } = require('./users')

const MATCH_COL = MATCH_COLLECTION

async function getMatch(userId, targetUserId) {
  const res = await db.collection(MATCH_COL).where({ userId, targetUserId }).limit(1).get()
  return res.data[0] || null
}

async function getReverseLike(userId, targetUserId) {
  const res = await db.collection(MATCH_COL)
    .where({
      userId: targetUserId,
      targetUserId: userId,
      action: _.in(['like', 'super_like']),
    })
    .limit(1)
    .get()
  return res.data[0] || null
}

async function saveMatch(doc) {
  const now = new Date()
  if (doc._id) {
    const { data, createdAt } = prepareUpdatePayload(doc, now)
    await db.collection(MATCH_COL).doc(doc._id).update({ data })
    return { _id: doc._id, createdAt: createdAt ?? doc.createdAt, ...data }
  }
  const id = generateUUID()
  const { data, record } = prepareSetPayload(doc, id, now)
  await db.collection(MATCH_COL).doc(id).set({ data })
  return record
}

function formatMatchResponse(match, targetUser) {
  return {
    id: match._id,
    userId: match.userId,
    targetUserId: match.targetUserId,
    action: match.action,
    isMutual: !!match.isMutual,
    createdAt: match.createdAt,
    targetUser: {
      id: targetUser._id,
      nickname: targetUser.nickname || '',
      avatar: targetUser.avatar || '',
    },
  }
}

async function setMatchAction(userId, targetUserId, action) {
  if (userId === targetUserId) {
    const err = new Error('不能对自己进行操作')
    err.statusCode = 409
    throw err
  }
  const targetUser = await getUserById(targetUserId)
  if (!targetUser || targetUser.status !== 'active') {
    const err = new Error('目标用户不存在')
    err.statusCode = 404
    throw err
  }
  const existingMatch = await getMatch(userId, targetUserId)
  const reverseMatch = await getReverseLike(userId, targetUserId)

  if (action === 'super_like') {
    const data = existingMatch
      ? { ...existingMatch, action: 'super_like', isMutual: true }
      : { userId, targetUserId, action: 'super_like', isMutual: true }
    const saved = await saveMatch(data)
    return formatMatchResponse(saved, targetUser)
  }

  if (action === 'dislike') {
    if (existingMatch) {
      if (existingMatch.isMutual && reverseMatch) {
        await saveMatch({ ...reverseMatch, isMutual: false })
      }
      const saved = await saveMatch({ ...existingMatch, action: 'dislike', isMutual: false })
      return formatMatchResponse(saved, targetUser)
    }
    const saved = await saveMatch({ userId, targetUserId, action: 'dislike', isMutual: false })
    return formatMatchResponse(saved, targetUser)
  }

  const isMutual = !!reverseMatch
  if (existingMatch) {
    const saved = await saveMatch({ ...existingMatch, action: 'like', isMutual })
    if (reverseMatch && !reverseMatch.isMutual) {
      await saveMatch({ ...reverseMatch, isMutual: true })
    }
    return formatMatchResponse(saved, targetUser)
  }
  const saved = await saveMatch({ userId, targetUserId, action: 'like', isMutual })
  if (reverseMatch) {
    await saveMatch({ ...reverseMatch, isMutual: true })
  }
  return formatMatchResponse(saved, targetUser)
}

module.exports = {
  setMatchAction,
  formatMatchResponse,
  getMatch,
}
