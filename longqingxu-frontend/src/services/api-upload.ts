/**
 * 文件上传 API
 */
import { uploadFile } from './api'

// 上传头像
export function apiUploadAvatar(filePath: string): Promise<{ url: string; fileName: string }> {
  return uploadFile('/upload/avatar', filePath, 'file')
}

// 上传图片
export function apiUploadImage(filePath: string): Promise<{ url: string; fileName: string }> {
  return uploadFile('/upload/image', filePath, 'file')
}

// 上传语音
export function apiUploadVoice(filePath: string): Promise<{ url: string; fileName: string }> {
  return uploadFile('/upload/voice', filePath, 'file')
}
