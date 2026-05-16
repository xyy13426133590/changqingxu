/** Tab 页路径（switchTab 专用） */
const TAB_PAGE_PATHS = new Set([
  '/pages/discover/index',
  '/pages/filter/index',
  '/pages/messages/index',
  '/pages/mine/index',
])

function runNavigateFallback(fallback: () => void) {
  try {
    fallback()
  } catch {
    uni.switchTab({ url: '/pages/discover/index' })
  }
}

/**
 * 安全返回：有页面栈则 navigateBack；否则执行 fallback（避免 delta=0 无反应）
 */
export function navigateBackSafe(fallback: () => void): void {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
      fail: () => runNavigateFallback(fallback),
    })
    return
  }
  runNavigateFallback(fallback)
}

/** 按路径返回：Tab 用 switchTab，其余用 redirectTo */
export function navigateBackTo(url: string): void {
  navigateBackSafe(() => {
    if (TAB_PAGE_PATHS.has(url)) {
      uni.switchTab({ url })
      return
    }
    uni.redirectTo({ url, fail: () => uni.navigateTo({ url }) })
  })
}
