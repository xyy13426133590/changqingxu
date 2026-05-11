import mpPlaceholder from '@/assets/avatar-placeholder.png'

/** 小程序未配置 download 合法域名时外链头像不显示；用打包后的本地路径，避免 /static 未同步导致 404/500 */
export const MP_AVATAR_PLACEHOLDER = mpPlaceholder as string

export function avatarUrl(remote: string): string {
  // #ifdef MP-WEIXIN
  return MP_AVATAR_PLACEHOLDER
  // #endif
  // #ifndef MP-WEIXIN
  return remote
  // #endif
}
