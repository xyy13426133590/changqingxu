/** 小程序自定义导航栏：状态栏高度（px） */
export function getStatusBarHeight(): number {
  try {
    const info = uni.getSystemInfoSync()
    return info.statusBarHeight ?? 0
  } catch {
    return 0
  }
}

/** 与微信小程序胶囊按钮对齐的布局数据（H5/App 等无胶囊时回退） */
export interface CapsuleNavMetrics {
  /** 顶栏内容区上缘距屏幕顶（≈ 胶囊 top） */
  paddingTopPx: number
  /** 顶栏一行高度（不小于返回按钮与胶囊高度） */
  rowHeightPx: number
  /** 右侧避让胶囊的 padding（px） */
  paddingRightPx: number
  /** 导航行与下方主内容之间的间距（px） */
  outerPaddingBottomPx: number
}

function upxToPx(upx: number): number {
  try {
    const n = uni.upx2px(upx)
    if (typeof n === 'number' && !Number.isNaN(n)) return n
  } catch {
    /* empty */
  }
  return (upx / 750) * (uni.getSystemInfoSync().windowWidth ?? 375)
}

export function getCapsuleNavMetrics(): CapsuleNavMetrics {
  const sys = uni.getSystemInfoSync()
  const statusBar = sys.statusBarHeight ?? 0
  const winW = sys.windowWidth ?? 375
  const fallback: CapsuleNavMetrics = {
    paddingTopPx: statusBar,
    rowHeightPx: Math.max(44, Math.round(upxToPx(72))),
    paddingRightPx: 16,
    outerPaddingBottomPx: 8,
  }

  try {
    if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
      const m = uni.getMenuButtonBoundingClientRect()
      if (m && typeof m.top === 'number' && m.top > 0 && typeof m.height === 'number' && m.height > 0) {
        const capTop = m.top
        const capH = m.height
        const backH = Math.round(upxToPx(72))
        const rowHeightPx = Math.max(capH, backH, 32)
        const paddingRightPx = Math.max(
          Math.round(upxToPx(16)),
          Math.ceil(winW - m.left + upxToPx(8)),
        )
        return {
          paddingTopPx: capTop,
          rowHeightPx,
          paddingRightPx,
          outerPaddingBottomPx: 8,
        }
      }
    }
  } catch {
    /* empty */
  }

  return fallback
}

/** 顶栏外层：上留白 + 可选下间距（包住「与胶囊对齐」的一行） */
export function getCapsuleNavOuterStyle(): Record<string, string> {
  const { paddingTopPx, outerPaddingBottomPx } = getCapsuleNavMetrics()
  return {
    paddingTop: `${paddingTopPx}px`,
    paddingBottom: `${outerPaddingBottomPx}px`,
    boxSizing: 'border-box',
  }
}

/** 顶栏内层一行：固定高度 + 右侧避让胶囊 */
export function getCapsuleNavRowStyle(): Record<string, string> {
  const { rowHeightPx, paddingRightPx } = getCapsuleNavMetrics()
  return {
    height: `${rowHeightPx}px`,
    paddingRight: `${paddingRightPx}px`,
    boxSizing: 'border-box',
  }
}

/** 无自定义顶栏行时，仅把整页内容从胶囊上缘开始排（如「我的」Tab 根页） */
export function getCapsulePageTopPaddingStyle(): Record<string, string> {
  const { paddingTopPx } = getCapsuleNavMetrics()
  return { paddingTop: `${paddingTopPx}px`, boxSizing: 'border-box' }
}

/**
 * 页面顶部安全区内边距（配合 navigationStyle: custom）
 * 与胶囊上缘对齐；若页面已使用 getCapsuleNavOuterStyle，勿再叠套本方法。
 */
export function getPageSafeTopStyle(): { paddingTop: string } {
  const { paddingTopPx } = getCapsuleNavMetrics()
  return { paddingTop: `${paddingTopPx}px` }
}
