/**
 * 头像地址：演示图通过 import 打进小程序包（/assets/xxx），避免 /static 未拷贝导致 404。
 */
import { USE_CLOUD } from '@/services/cloud'
import demo0 from '@/assets/avatars/demo-0.jpg'
import demo1 from '@/assets/avatars/demo-1.jpg'
import demo2 from '@/assets/avatars/demo-2.jpg'
import demo3 from '@/assets/avatars/demo-3.jpg'
import demo4 from '@/assets/avatars/demo-4.jpg'

/** 构建后形如 /assets/demo-0.xxxxx.jpg，微信可直接加载 */
export const DEMO_AVATARS: string[] = [demo0, demo1, demo2, demo3, demo4]

const FALLBACK_AVATAR = DEMO_AVATARS[0]

const SEED_AVATAR_INDEX: Record<string, number> = {
  'demo-0.jpg': 0,
  'demo-1.jpg': 1,
  'demo-2.jpg': 2,
  'demo-3.jpg': 3,
  'demo-4.jpg': 4,
}

function demoIndexFromSeedPath(remote: string): number | null {
  for (const [name, idx] of Object.entries(SEED_AVATAR_INDEX)) {
    if (remote.includes(name)) return idx
  }
  return null
}

/** 按用户 id 稳定映射到一张演示图 */
export function demoAvatarByUserId(userId?: string): string {
  if (!userId) return FALLBACK_AVATAR
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash + userId.charCodeAt(i)) % DEMO_AVATARS.length
  }
  return DEMO_AVATARS[hash] ?? FALLBACK_AVATAR
}

/**
 * 解析展示用头像。
 * - 种子数据 `/static/avatars/demo-N.jpg` → 映射到打包后的 DEMO_AVATARS[N]
 * - 已是 `/assets/` 或打包路径 → 原样使用
 * - `cloud://` 文件 ID → 微信 <image> 原生支持，直接返回
 * - 云模式 https → CDN 域已自动信任，直接返回
 * - 非云模式外链 → 小程序可能未白名单，使用本地演示图
 * - 其余空值 → 演示图兜底
 */
export function resolveAvatar(
  remote?: string | null,
  userId?: string,
): string {
  const trimmed = (remote ?? '').trim()

  if (!trimmed) return demoAvatarByUserId(userId)

  if (trimmed.startsWith('/assets/') || trimmed.includes('/assets/')) {
    return trimmed
  }

  if (trimmed.includes('/static/avatars/demo-')) {
    const idx = demoIndexFromSeedPath(trimmed)
    if (idx != null && DEMO_AVATARS[idx]) {
      return DEMO_AVATARS[idx]
    }
  }

  // 微信云存储 fileID，<image> 组件原生支持，直接传入
  if (trimmed.startsWith('cloud://')) {
    return trimmed
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // #ifdef MP-WEIXIN
    // 云模式：图片存储在云 CDN，域名已自动信任，直接使用
    if (USE_CLOUD) return trimmed
    // 非云模式：外链域名可能未加入白名单，用演示图兜底
    return demoAvatarByUserId(userId)
    // #endif
    // #ifndef MP-WEIXIN
    return trimmed
    // #endif
  }

  return demoAvatarByUserId(userId)
}

/** @deprecated 使用 resolveAvatar */
export function avatarUrl(remote: string, userId?: string): string {
  return resolveAvatar(remote, userId)
}

export const MP_AVATAR_PLACEHOLDER = FALLBACK_AVATAR
