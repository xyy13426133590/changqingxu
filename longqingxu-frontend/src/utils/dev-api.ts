import { API_BASE_URL } from '@/services/api'

/** 微信小程序无法访问 localhost，需使用电脑局域网 IP */
export function isMpWeixinLocalhostApi(): boolean {
  // #ifdef MP-WEIXIN
  return /localhost|127\.0\.0\.1/i.test(API_BASE_URL)
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

export function mpWeixinApiHint(): string {
  return '小程序无法访问 localhost。请在 longqingxu-frontend/.env 将 VITE_API_BASE_URL 改为电脑局域网 IP（如 http://192.168.1.100:3000/api），重新编译并在开发者工具勾选「不校验合法域名」。'
}
