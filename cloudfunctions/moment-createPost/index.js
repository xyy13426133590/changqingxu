const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

const db = cloud.database()

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { circleId = 'default_public', visibility = 'public', content, media = [], location } = event

  // 校验：内容和媒体至少有一个
  if ((!content || !content.trim()) && (!media || media.length === 0)) {
    const err = new Error('请添加内容或图片')
    err.statusCode = 400
    throw err
  }

  // 内容长度
  if (content && content.length > 500) {
    const err = new Error('文案最多500字')
    err.statusCode = 400
    throw err
  }

  // 媒体校验
  if (media && media.length > 0) {
    const images = media.filter((m) => m.type === 'image')
    const videos = media.filter((m) => m.type === 'video')
    if (images.length > 9) {
      const err = new Error('图片最多9张')
      err.statusCode = 400
      throw err
    }
    if (videos.length > 1) {
      const err = new Error('视频最多1个')
      err.statusCode = 400
      throw err
    }
    if (images.length > 0 && videos.length > 0) {
      const err = new Error('图片和视频不能同时发布')
      err.statusCode = 400
      throw err
    }
    for (const v of videos) {
      if (v.duration && v.duration > 60) {
        const err = new Error('视频时长不超过60秒')
        err.statusCode = 400
        throw err
      }
    }
    for (const m of media) {
      if (!m.fileID || !m.fileID.startsWith('cloud://')) {
        const err = new Error('媒体文件 fileID 格式错误')
        err.statusCode = 400
        throw err
      }
    }
  }

  const validVisibility = ['public', 'login_only', 'circle_members']
  if (!validVisibility.includes(visibility)) {
    const err = new Error('可见性参数错误')
    err.statusCode = 400
    throw err
  }

  const now = new Date().toISOString()
  const postData = {
    authorId: userId,
    circleId: circleId || 'default_public',
    visibility,
    content: content ? content.trim() : '',
    media: media || [],
    location: location || null,
    likeCount: 0,
    commentCount: 0,
    status: 'active',
    auditStatus: 'passed',
    createdAt: now,
    updatedAt: now,
  }

  const addRes = await db.collection('moment_posts').add({ data: postData })

  // 获取作者信息
  const userRes = await db
    .collection('dev_users')
    .doc(userId)
    .field({ _id: true, nickname: true, avatar: true })
    .get()

  const author = userRes.data || { _id: userId, nickname: '用户', avatar: '' }

  return {
    id: addRes._id,
    author: { id: author._id, nickname: author.nickname, avatar: author.avatar || '' },
    content: postData.content,
    media: postData.media,
    location: postData.location,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    visibility,
    createdAt: now,
    masked: false,
  }
})
