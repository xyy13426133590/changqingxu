const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { optionalAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  await optionalAuth(event)
  const { postId, page = 1, limit = 20 } = event
  assertRequired({ postId }, ['postId'])

  const safeLimit = Math.min(Number(limit) || 20, 50)
  const skip = (Number(page) - 1) * safeLimit

  const countRes = await db.collection('moment_comments').where({ postId }).count()
  const total = countRes.total

  const commentsRes = await db
    .collection('moment_comments')
    .where({ postId })
    .orderBy('createdAt', 'asc')
    .skip(skip)
    .limit(safeLimit)
    .get()

  const comments = commentsRes.data
  if (!comments || comments.length === 0) {
    return { comments: [], total, hasMore: false, page: Number(page) }
  }

  // 批量获取评论者信息
  const userIds = [...new Set(comments.map((c) => c.userId))]
  const usersRes = await db
    .collection('users')
    .where({ _id: _.in(userIds) })
    .field({ _id: true, nickname: true, avatar: true })
    .get()

  const userMap = {}
  for (const u of usersRes.data) {
    userMap[u._id] = u
  }

  const result = comments.map((comment) => {
    const author = userMap[comment.userId] || { _id: comment.userId, nickname: '用户', avatar: '' }
    return {
      id: comment._id,
      author: { id: author._id, nickname: author.nickname || '用户', avatar: author.avatar || '' },
      content: comment.content,
      createdAt: comment.createdAt,
    }
  })

  return {
    comments: result,
    total,
    hasMore: skip + comments.length < total,
    page: Number(page),
  }
})
