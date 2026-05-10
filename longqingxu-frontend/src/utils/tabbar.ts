/** 隐藏原生 TabBar（与 pages.json 内联 TabBar 二选一展示）。custom: true 时微信会拒绝 hideTabBar，故需 custom: false。 */
export function safeHideNativeTabBar() {
  uni.hideTabBar({
    animation: false,
    fail() {
      /* 忽略：非 Tab 页或已隐藏等 */
    },
  })
}
