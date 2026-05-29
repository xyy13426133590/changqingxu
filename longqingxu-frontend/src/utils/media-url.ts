import { USE_CLOUD } from '@/services/cloud'
import { API_BASE_URL } from '@/services/api'

/**
 * 将云存储 fileID（cloud://...）解析为可播放的临时 HTTPS URL。
 * 仅在微信小程序端有效。
 */
async function resolveCloudFileID(fileID: string): Promise<string> {
  // #ifdef MP-WEIXIN
  try {
    const wxCloud = (globalThis as any)?.wx?.cloud
    if (wxCloud) {
      const res = await wxCloud.getTempFileURL({ fileList: [fileID] })
      const info = res?.fileList?.[0]
      if (info?.status === 0 && info.tempFileURL) {
        return info.tempFileURL
      }
    }
  } catch {
    // 解析失败时返回原始 fileID
  }
  // #endif
  return fileID
}

/**
 * 将语音/图片等媒体地址解析为可被 InnerAudioContext / image 加载的完整 URL。
 * 云模式下自动将 cloud:// fileID 转换为临时 HTTPS URL。
 */
export async function resolveVoicePlaySrc(raw: string | undefined | null): Promise<string> {
  const s = (raw ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  if (
    s.startsWith('wxfile://') ||
    s.startsWith('file://') ||
    s.startsWith('http://tmp/') ||
    s.startsWith('https://tmp/') ||
    s.startsWith('blob:')
  ) {
    return s
  }
  if (s.startsWith('cloud://')) {
    return resolveCloudFileID(s)
  }
  if (s.startsWith('/') && !USE_CLOUD) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '')
    return `${origin}${s}`
  }
  return s
}
