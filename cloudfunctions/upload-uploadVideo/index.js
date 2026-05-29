const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  assertRequired({ fileID: event.fileID }, ['fileID'])

  const { fileID, ext = 'mp4', duration } = event

  if (duration && Number(duration) > 60) {
    const err = new Error('视频时长不超过60秒')
    err.statusCode = 400
    throw err
  }

  const tempRes = await cloud.getTempFileURL({ fileList: [fileID] })
  const fileInfo = tempRes.fileList[0]
  if (!fileInfo || fileInfo.status !== 0) {
    const err = new Error('获取文件 URL 失败')
    err.statusCode = 400
    throw err
  }

  const hash = crypto.randomBytes(8).toString('hex')
  const fileName = `moments/videos/${userId}/${Date.now()}_${hash}.${ext}`

  return {
    url: fileInfo.tempFileURL,
    fileID,
    fileName,
    duration: duration || null,
  }
})
