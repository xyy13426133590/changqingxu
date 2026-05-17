import { API_BASE_URL } from '@/services/api'

/**
 * 将语音/图片等媒体地址解析为可被 InnerAudioContext / image 加载的完整 URL。
 */
export function resolveVoicePlaySrc(raw: string | undefined | null): string {
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
  if (s.startsWith('/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '')
    return `${origin}${s}`
  }
  return s
}
