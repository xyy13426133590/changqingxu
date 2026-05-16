/** 小程序自定义导航栏：状态栏高度（px） */
export function getStatusBarHeight(): number {
  try {
    const info = uni.getSystemInfoSync()
    return info.statusBarHeight ?? 0
  } catch {
    return 0
  }
}

/** 页面顶部安全区内边距（配合 navigationStyle: custom） */
export function getPageSafeTopStyle(): { paddingTop: string } {
  return { paddingTop: `${getStatusBarHeight()}px` }
}
