const cloud = require('wx-server-sdk')
const { CLOUD_ENV, MOMENT_POST_COLLECTION, USER_COLLECTION } = require('/opt/constants')

// 固定与小程序 .env 中 VITE_CLOUD_ENV 一致，避免 DYNAMIC_CURRENT_ENV 指错环境
cloud.init({ env: CLOUD_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')

const db = cloud.database({ env: CLOUD_ENV })
const API_VERSION = 'moment-createPost/add-v4'

function normalizeMedia(media) {
  return (media || []).map((m) => {
    const item = { type: m.type, fileID: String(m.fileID) }
    if (m.type === 'video' && m.duration != null) {
      item.duration = Number(m.duration)
    }
    if (m.width != null) item.width = Number(m.width)
    if (m.height != null) item.height = Number(m.height)
    return item
  })
}

function buildPostData(userId, event) {
  const { circleId = 'default_public', visibility = 'public', content, media = [], location } = event
  const trimmedContent = typeof content === 'string' ? content.trim() : ''
  const normalizedMedia = normalizeMedia(media)

  const postData = {
    authorId: userId,
    circleId: circleId || 'default_public',
    visibility,
    media: normalizedMedia,
    likeCount: 0,
    commentCount: 0,
    status: 'active',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  }

  if (trimmedContent) {
    postData.content = trimmedContent
  }

  if (location && typeof location === 'object' && location.name) {
    const loc = { name: String(location.name) }
    if (location.latitude != null && !Number.isNaN(Number(location.latitude))) {
      loc.latitude = Number(location.latitude)
    }
    if (location.longitude != null && !Number.isNaN(Number(location.longitude))) {
      loc.longitude = Number(location.longitude)
    }
    postData.location = loc
  }

  return { postData, trimmedContent, normalizedMedia }
}

function formatDbError(e, method) {
  const parts = [
    `[${API_VERSION}]`,
    method,
    e && (e.errCode != null ? `code=${e.errCode}` : ''),
    e && (e.errMsg || e.message || String(e)),
  ].filter(Boolean)
  return parts.join(' ')
}

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  const { postData, trimmedContent, normalizedMedia } = buildPostData(userId, event)

  if (!trimmedContent && normalizedMedia.length === 0) {
    const err = new Error('请添加内容或图片')
    err.statusCode = 400
    throw err
  }

  if (trimmedContent.length > 500) {
    const err = new Error('文案最多500字')
    err.statusCode = 400
    throw err
  }

  if (normalizedMedia.length > 0) {
    const images = normalizedMedia.filter((m) => m.type === 'image')
    const videos = normalizedMedia.filter((m) => m.type === 'video')
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
    for (const m of normalizedMedia) {
      if (!m.fileID || !m.fileID.startsWith('cloud://')) {
        const err = new Error('图片未上传完成，请删除后重新添加')
        err.statusCode = 400
        throw err
      }
    }
  }

  const validVisibility = ['public', 'login_only', 'circle_members']
  if (!validVisibility.includes(postData.visibility)) {
    const err = new Error('可见性参数错误')
    err.statusCode = 400
    throw err
  }

  // 预检：确认当前环境能访问 moment_posts（排除环境/集合名错误）
  try {
    await db.collection(MOMENT_POST_COLLECTION).count()
  } catch (preErr) {
    console.error('[moment-createPost] preflight count fail:', preErr)
    const err = new Error(
      formatDbError(preErr, 'count') +
        `。请确认云函数与小程序均使用环境 ${CLOUD_ENV}，且集合 ${MOMENT_POST_COLLECTION} 已创建`,
    )
    err.statusCode = 500
    throw err
  }

  let addRes
  const method = 'collection.add'
  try {
    addRes = await db.collection(MOMENT_POST_COLLECTION).add({ data: postData })
  } catch (e1) {
    console.error('[moment-createPost] add fail (full):', e1)
    // 若控制台开启了严格 schema，auditStatus 等扩展字段可能导致失败，再试精简字段
    const minimal = {
      authorId: postData.authorId,
      circleId: postData.circleId,
      visibility: postData.visibility,
      media: postData.media,
      likeCount: 0,
      commentCount: 0,
      status: 'active',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    }
    if (postData.content) minimal.content = postData.content
    if (postData.location) minimal.location = postData.location

    try {
      addRes = await db.collection(MOMENT_POST_COLLECTION).add({ data: minimal })
    } catch (e2) {
      console.error('[moment-createPost] add fail (minimal):', e2)
      const err = new Error(
        `${formatDbError(e1, method)} | 重试: ${formatDbError(e2, method)}`,
      )
      err.statusCode = 500
      throw err
    }
  }

  const userRes = await db
    .collection(USER_COLLECTION)
    .doc(userId)
    .field({ _id: true, nickname: true, avatar: true })
    .get()

  const author = userRes.data || { _id: userId, nickname: '用户', avatar: '' }
  const createdAt = new Date().toISOString()

  return {
    id: addRes._id,
    author: { id: author._id, nickname: author.nickname || '', avatar: author.avatar || '' },
    content: postData.content || '',
    media: postData.media,
    location: postData.location || null,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    visibility: postData.visibility,
    createdAt,
    masked: false,
    _apiVersion: API_VERSION,
  }
})
