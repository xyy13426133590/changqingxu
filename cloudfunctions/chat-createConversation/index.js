const cloud = require('wx-server-sdk')
const {
  CLOUD_ENV,
  CONVERSATION_COLLECTION,
  USER_COLLECTION,
} = require('/opt/constants')

cloud.init({ env: CLOUD_ENV })

const { wrapHandler } = require('/opt/response')
const { extractToken, verifyToken } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')
const { formatConversationResponse } = require('/opt/lib/conversations')

const db = cloud.database({ env: CLOUD_ENV })
const CONV_COL = CONVERSATION_COLLECTION
const USER_COL = USER_COLLECTION

function assertValidUserId(userId) {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    const err = new Error('登录已失效，请重新登录')
    err.statusCode = 401
    throw err
  }
  return userId.trim()
}

function isMissingUserId(value) {
  return value == null || value === ''
}

async function resolveUserId(event) {
  const token = extractToken(event)
  if (!token) {
    const err = new Error('请先登录')
    err.statusCode = 401
    throw err
  }
  let payload
  try {
    payload = verifyToken(token)
  } catch {
    const err = new Error('请先登录')
    err.statusCode = 401
    throw err
  }

  let uid = assertValidUserId(payload.sub || payload.id || payload.userId)

  try {
    const byId = await db.collection(USER_COL).doc(uid).get()
    if (byId.data) return byId.data._id
  } catch {
    /* doc 不存在 */
  }

  if (payload.phone) {
    const byPhone = await db.collection(USER_COL).where({ phone: payload.phone }).limit(1).get()
    if (byPhone.data[0]) return byPhone.data[0]._id
  }

  const err = new Error('登录已失效，请重新登录')
  err.statusCode = 401
  throw err
}

async function getUserByIdLocal(userId) {
  try {
    const res = await db.collection(USER_COL).doc(userId).get()
    return res.data || null
  } catch {
    return null
  }
}

async function listConversationsForTarget(targetUserId) {
  const [asUser2, asUser1] = await Promise.all([
    db.collection(CONV_COL).where({ userId2: targetUserId }).limit(50).get(),
    db.collection(CONV_COL).where({ userId1: targetUserId }).limit(50).get(),
  ])
  const map = new Map()
  for (const doc of [...asUser2.data, ...asUser1.data]) {
    map.set(doc._id, doc)
  }
  return [...map.values()]
}

function findPairConversation(docs, userId, targetUserId) {
  return docs.find(
    (c) =>
      (c.userId1 === userId && c.userId2 === targetUserId)
      || (c.userId1 === targetUserId && c.userId2 === userId),
  ) || null
}

function findBrokenConversations(docs, targetUserId) {
  return docs.filter(
    (c) =>
      (c.userId2 === targetUserId && isMissingUserId(c.userId1))
      || (c.userId1 === targetUserId && isMissingUserId(c.userId2)),
  )
}

async function removeBrokenConversations(brokenDocs) {
  for (const doc of brokenDocs) {
    try {
      await db.collection(CONV_COL).doc(doc._id).remove()
    } catch {
      /* 忽略单条删除失败 */
    }
  }
}

async function listAllConversations(limit = 100) {
  const res = await db.collection(CONV_COL).limit(limit).get()
  return res.data || []
}

async function cleanupAllBrokenConversations() {
  const all = await listAllConversations()
  const broken = all.filter(
    (c) => isMissingUserId(c.userId1) || isMissingUserId(c.userId2),
  )
  await removeBrokenConversations(broken)
  return broken
}

async function findConversationRobust(userId, targetUserId) {
  const byTarget = await listConversationsForTarget(targetUserId)
  const hit = findPairConversation(byTarget, userId, targetUserId)
  if (hit) return hit

  const [asUser1, asUser2] = await Promise.all([
    db.collection(CONV_COL).where({ userId1: userId }).limit(50).get(),
    db.collection(CONV_COL).where({ userId2: userId }).limit(50).get(),
  ])
  const map = new Map()
  for (const doc of [...asUser1.data, ...asUser2.data]) {
    map.set(doc._id, doc)
  }
  const byUser = findPairConversation([...map.values()], userId, targetUserId)
  if (byUser) return byUser

  // 兜底：全表扫描（集合通常很小）
  const all = await listAllConversations()
  return findPairConversation(all, userId, targetUserId)
}

function summarizeDocs(docs) {
  return docs.map((d) => `${d._id}[${d.userId1 || '(空)'}↔${d.userId2 || '(空)'}]`).join('；')
}

function buildIndexConflictHint(userId, targetUserId, relatedDocs, allDocs, dbErrMsg) {
  const broken = allDocs.filter(
    (c) => isMissingUserId(c.userId1) || isMissingUserId(c.userId2),
  )
  if (broken.length > 0) {
    return `dev_conversations 中有 ${broken.length} 条 userId 缺失的记录，请手动删除：${summarizeDocs(broken)}`
  }

  const mine = findPairConversation(allDocs, userId, targetUserId)
  if (mine) {
    return `会话已存在（_id: ${mine._id}），请返回消息页刷新后重试。`
  }

  if (dbErrMsg.includes('null')) {
    return (
      '索引冲突：可能存在 userId 为空的隐藏记录。'
      + `当前库中共 ${allDocs.length} 条：${summarizeDocs(allDocs) || '无'}。`
      + ' 建议清空 dev_conversations 后重新打招呼。'
    )
  }

  return `数据库写入冲突。当前会话：${summarizeDocs(allDocs) || '无'}。详情：${dbErrMsg.slice(0, 160)}`
}

async function cleanupBrokenForTarget(targetUserId) {
  const docs = await listConversationsForTarget(targetUserId)
  const broken = findBrokenConversations(docs, targetUserId)
  await removeBrokenConversations(broken)
  return broken.length
}

async function createConversationWithAdd(userId, targetUserId) {
  const uid1 = String(userId)
  const uid2 = String(targetUserId)
  const now = new Date()
  const addRes = await db.collection(CONV_COL).add({
    data: {
      userId1: uid1,
      userId2: uid2,
      lastMessageId: null,
      lastMessageAt: null,
      unreadCount1: 0,
      unreadCount2: 0,
      isPinned1: false,
      isPinned2: false,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    },
  })
  return {
    _id: addRes._id,
    userId1: uid1,
    userId2: uid2,
    lastMessageId: null,
    lastMessageAt: null,
    unreadCount1: 0,
    unreadCount2: 0,
    isPinned1: false,
    isPinned2: false,
    isBlocked: false,
    createdAt: now,
    updatedAt: now,
  }
}

async function enrichConversationLocal(conversation, currentUserId) {
  const isUser1 = conversation.userId1 === currentUserId
  const targetUserId = isUser1 ? conversation.userId2 : conversation.userId1
  const targetUser = await getUserByIdLocal(targetUserId)
  return formatConversationResponse(conversation, currentUserId, targetUser, null)
}

exports.main = wrapHandler(async (event) => {
  const userId = await resolveUserId(event)
  const targetUserId = event.targetUserId
  assertRequired({ targetUserId }, ['targetUserId'])

  if (targetUserId === userId) {
    const err = new Error('不能与自己发起会话')
    err.statusCode = 400
    throw err
  }

  const targetUser = await getUserByIdLocal(targetUserId)
  if (!targetUser || targetUser.status !== 'active') {
    const err = new Error('目标用户不存在')
    err.statusCode = 404
    throw err
  }

  // 清掉全表 userId 缺失的脏文档（字段不存在时 where(null) 查不到）
  await cleanupAllBrokenConversations()
  await cleanupBrokenForTarget(targetUserId)

  let conversation = await findConversationRobust(userId, targetUserId)

  if (!conversation) {
    try {
      conversation = await createConversationWithAdd(userId, targetUserId)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('E11000')) {
        await cleanupAllBrokenConversations()
        await cleanupBrokenForTarget(targetUserId)
        conversation = await findConversationRobust(userId, targetUserId)
        if (!conversation) {
          try {
            conversation = await createConversationWithAdd(userId, targetUserId)
          } catch (retryErr) {
            const retryMsg = retryErr?.message || ''
            if (retryMsg.includes('E11000')) {
              conversation = await findConversationRobust(userId, targetUserId)
            }
            if (!conversation) {
              const allDocs = await listAllConversations()
              const hint = buildIndexConflictHint(
                userId,
                targetUserId,
                await listConversationsForTarget(targetUserId),
                allDocs,
                retryMsg || msg,
              )
              const err = new Error(hint)
              err.statusCode = 500
              throw err
            }
          }
        }
      } else {
        throw e
      }
    }
  }

  return enrichConversationLocal(conversation, userId)
})
