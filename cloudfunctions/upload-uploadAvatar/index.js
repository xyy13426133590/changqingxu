const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { wrapHandler } = require('/opt/response')
const { requireAuth } = require('/opt/auth')
const { assertRequired } = require('/opt/validate')

async function resolveUpload(userId, event, folder) {
  assertRequired({ fileID: event.fileID }, ['fileID'])

  const tempRes = await cloud.getTempFileURL({ fileList: [event.fileID] })
  const fileInfo = tempRes.fileList[0]
  if (!fileInfo || fileInfo.status !== 0) {
    const err = new Error('获取文件 URL 失败')
    err.statusCode = 400
    throw err
  }

  const ext = event.ext || 'jpg'
  const hash = crypto.randomBytes(8).toString('hex')
  const fileName = `${folder}/${userId}/${Date.now()}_${hash}.${ext}`

  return {
    url: fileInfo.tempFileURL,
    fileID: event.fileID,
    fileName,
  }
}

exports.main = wrapHandler(async (event) => {
  const userId = await requireAuth(event)
  return resolveUpload(userId, event, 'avatars')
})
