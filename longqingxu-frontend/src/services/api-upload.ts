/**
 * 文件上传 API
 */
import { uploadFile } from './api'
import { USE_CLOUD, callCloud, cloudUploadFile } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

function getExt(filePath: string, fallback: string): string {
  const match = filePath.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1].toLowerCase() : fallback
}

async function cloudUpload(
  folder: 'avatars' | 'images' | 'voices',
  filePath: string,
  fnName: string,
): Promise<{ url: string; fileName: string }> {
  const ext = getExt(filePath, folder === 'voices' ? 'aac' : 'jpg')
  const cloudPath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const uploadRes = await cloudUploadFile(cloudPath, filePath)
  return callCloud(fnName, { fileID: uploadRes.fileID, ext })
}

export function apiUploadAvatar(filePath: string): Promise<{ url: string; fileName: string }> {
  if (USE_CLOUD) return cloudUpload('avatars', filePath, CLOUD_API_MAP.upload.avatar)
  return uploadFile('/upload/avatar', filePath, 'file')
}

export function apiUploadImage(filePath: string): Promise<{ url: string; fileName: string }> {
  if (USE_CLOUD) return cloudUpload('images', filePath, CLOUD_API_MAP.upload.image)
  return uploadFile('/upload/image', filePath, 'file')
}

export function apiUploadVoice(filePath: string): Promise<{ url: string; fileName: string }> {
  if (USE_CLOUD) return cloudUpload('voices', filePath, CLOUD_API_MAP.upload.voice)
  return uploadFile('/upload/voice', filePath, 'file')
}
