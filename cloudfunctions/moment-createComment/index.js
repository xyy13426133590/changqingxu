const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { postId, content } = event
  assertRequired({ postId, content }, ['postId', 'content'])

  if (!content.trim()) {
    const err = new Error('评论内容不能为空')
    err.statusCode = 400
    throw err
  }
  if (content.length > 200) {
    const err = new Error('评论最多200字')
    err.statusCode = 400
    throw err
  }

  // 检查帖子存在
  const postRes = await db.collection('moment_posts').doc(postId).get()
  const post = postRes.data
  if (!post || post.status === 'deleted') {
    const err = new Error('动态不存在')
    err.statusCode = 404
    throw err
  }

  const now = new Date().toISOString()
  const commentData = {
    postId,
    userId,
    content: content.trim(),
    replyToCommentId: event.replyToCommentId || null,
    createdAt: now,
  }

  const addRes = await db.collection('moment_comments').add({ data: commentData })

  // 更新评论计数
  await db
    .collection('moment_posts')
    .doc(postId)
    .update({ data: { commentCount: _.increment(1) } })

  // 获取评论者信息
  const userRes = await db
    .collection('users')
    .doc(userId)
    .field({ _id: true, nickname: true, avatar: true })
    .get()

  const author = userRes.data || { _id: userId, nickname: '用户', avatar: '' }

  return {
    id: addRes._id,
    author: { id: author._id, nickname: author.nickname, avatar: author.avatar || '' },
    content: commentData.content,
    createdAt: now,
  }
})
