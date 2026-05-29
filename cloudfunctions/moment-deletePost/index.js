const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

const db = cloud.database()

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { postId } = event
  assertRequired({ postId }, ['postId'])

  const postRes = await db.collection('moment_posts').doc(postId).get()
  const post = postRes.data
  if (!post || post.status === 'deleted') {
    const err = new Error('动态不存在')
    err.statusCode = 404
    throw err
  }
  if (post.authorId !== userId) {
    const err = new Error('无权操作')
    err.statusCode = 403
    throw err
  }

  await db
    .collection('moment_posts')
    .doc(postId)
    .update({ data: { status: 'deleted', updatedAt: new Date().toISOString() } })

  return { success: true }
})
