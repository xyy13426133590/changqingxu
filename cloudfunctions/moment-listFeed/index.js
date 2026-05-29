const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { optionalAuth } = require('/opt/auth')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  const viewerId = await optionalAuth(event)
  const { circleId, page = 1, limit = 10 } = event

  const safeLimit = Math.min(Number(limit) || 10, 20)
  const skip = (Number(page) - 1) * safeLimit

  // 可见性过滤
  let visibilityFilter
  if (viewerId) {
    // 登录用户：public + login_only + 私密圈（MVP 暂无私密圈，仅前两种）
    visibilityFilter = _.in(['public', 'login_only'])
  } else {
    visibilityFilter = 'public'
  }

  const query = { status: 'active', visibility: visibilityFilter }
  if (circleId) query.circleId = circleId

  const countRes = await db.collection('moment_posts').where(query).count()
  const total = countRes.total

  const postsRes = await db
    .collection('moment_posts')
    .where(query)
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(safeLimit)
    .get()

  const posts = postsRes.data

  if (!posts || posts.length === 0) {
    return { posts: [], total, hasMore: false, page: Number(page) }
  }

  // 批量获取作者信息
  const authorIds = [...new Set(posts.map((p) => p.authorId))]
  const usersRes = await db
    .collection('users')
    .where({ _id: _.in(authorIds) })
    .field({ _id: true, nickname: true, avatar: true })
    .get()

  const userMap = {}
  for (const u of usersRes.data) {
    userMap[u._id] = u
  }

  // 批量判断是否点赞
  let likedSet = new Set()
  if (viewerId && posts.length > 0) {
    const postIds = posts.map((p) => p._id)
    const likesRes = await db
      .collection('moment_likes')
      .where({ postId: _.in(postIds), userId: viewerId })
      .field({ postId: true })
      .get()
    likedSet = new Set(likesRes.data.map((l) => l.postId))
  }

  const result = posts.map((post) => {
    const author = userMap[post.authorId] || { _id: post.authorId, nickname: '已注销', avatar: '' }
    const masked = post.visibility === 'login_only' && !viewerId

    return {
      id: post._id,
      author: {
        id: author._id,
        nickname: author.nickname || '用户',
        avatar: author.avatar || '',
      },
      content: masked ? null : post.content || '',
      media: masked ? [] : (post.media || []),
      location: post.location || null,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      isLiked: likedSet.has(post._id),
      visibility: post.visibility,
      createdAt: post.createdAt,
      masked,
    }
  })

  return {
    posts: result,
    total,
    hasMore: skip + posts.length < total,
    page: Number(page),
  }
})
