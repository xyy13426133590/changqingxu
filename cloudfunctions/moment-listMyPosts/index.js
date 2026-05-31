const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')

const db = cloud.database()
const _ = db.command

exports.main = wrapHandler(async (event) => {
  const viewerId = await requireAuth(event)
  const { page = 1, limit = 10 } = event

  const safeLimit = Math.min(Number(limit) || 10, 20)
  const skip = (Number(page) - 1) * safeLimit

  const query = { authorId: viewerId, status: 'active' }

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

  // 获取当前用户信息（所有帖子都属于同一人，只查一次）
  let authorInfo = { nickname: '', avatar: '' }
  try {
    const userRes = await db
      .collection('dev_users')
      .doc(viewerId)
      .field({ _id: true, nickname: true, avatar: true })
      .get()
    if (userRes.data) {
      authorInfo = {
        nickname: userRes.data.nickname || '',
        avatar: userRes.data.avatar || '',
      }
    }
  } catch {
    // 获取失败时保留空字符串，不影响列表展示
  }

  // 批量判断是否点赞
  const postIds = posts.map((p) => p._id)
  const likesRes = await db
    .collection('moment_likes')
    .where({ postId: _.in(postIds), userId: viewerId })
    .field({ postId: true })
    .get()
  const likedSet = new Set(likesRes.data.map((l) => l.postId))

  const result = posts.map((post) => ({
    id: post._id,
    author: {
      id: viewerId,
      nickname: authorInfo.nickname,
      avatar: authorInfo.avatar,
    },
    content: post.content || '',
    media: post.media || [],
    location: post.location || null,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
    isLiked: likedSet.has(post._id),
    visibility: post.visibility,
    createdAt: post.createdAt,
    masked: false,
  }))

  return {
    posts: result,
    total,
    hasMore: skip + posts.length < total,
    page: Number(page),
  }
})
