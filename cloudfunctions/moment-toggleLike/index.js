const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { postId } = event
  assertRequired({ postId }, ['postId'])

  // 检查帖子是否存在
  const postRes = await db.collection('moment_posts').doc(postId).get()
  const post = postRes.data
  if (!post || post.status === 'deleted') {
    const err = new Error('动态不存在')
    err.statusCode = 404
    throw err
  }

  // 检查是否已点赞
  const likeRes = await db
    .collection('moment_likes')
    .where({ postId, userId })
    .count()

  const alreadyLiked = likeRes.total > 0

  if (alreadyLiked) {
    // 取消点赞
    await db.collection('moment_likes').where({ postId, userId }).remove()
    await db
      .collection('moment_posts')
      .doc(postId)
      .update({ data: { likeCount: _.increment(-1) } })

    const updatedPost = await db
      .collection('moment_posts')
      .doc(postId)
      .field({ likeCount: true })
      .get()

    return { liked: false, likeCount: Math.max(0, updatedPost.data.likeCount || 0) }
  } else {
    // 点赞
    await db.collection('moment_likes').add({
      data: { postId, userId, createdAt: new Date().toISOString() },
    })
    await db
      .collection('moment_posts')
      .doc(postId)
      .update({ data: { likeCount: _.increment(1) } })

    const updatedPost = await db
      .collection('moment_posts')
      .doc(postId)
      .field({ likeCount: true })
      .get()

    return { liked: true, likeCount: updatedPost.data.likeCount || 1 }
  }
})
