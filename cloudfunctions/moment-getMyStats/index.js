const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  const viewerId = await requireAuth(event)

  const query = { authorId: viewerId, status: 'active' }

  const countRes = await db.collection('moment_posts').where(query).count()
  const postCount = countRes.total

  let totalLikes = 0
  let totalComments = 0

  if (postCount > 0) {
    // 分批拉取所有帖，聚合点赞/评论数（腾讯云 DB 不支持 SUM，逐条汇总）
    // 每批最多20条，最多取前100帖计算统计（MVP 足够）
    const batchLimit = 20
    const batchCount = Math.min(Math.ceil(postCount / batchLimit), 5)

    for (let i = 0; i < batchCount; i++) {
      const res = await db
        .collection('moment_posts')
        .where(query)
        .field({ likeCount: true, commentCount: true })
        .skip(i * batchLimit)
        .limit(batchLimit)
        .get()
      for (const p of res.data) {
        totalLikes += p.likeCount || 0
        totalComments += p.commentCount || 0
      }
    }
  }

  return { postCount, totalLikes, totalComments }
})
