/** 小程序未配置 download 合法域名时，外链图片不显示，统一走本地占位 */
export const MP_AVATAR_PLACEHOLDER = '/static/avatars/placeholder.png'

export function avatarUrl(remote: string): string {
  // #ifdef MP-WEIXIN
  return MP_AVATAR_PLACEHOLDER
  // #endif
  // #ifndef MP-WEIXIN
  return remote
  // #endif
}
