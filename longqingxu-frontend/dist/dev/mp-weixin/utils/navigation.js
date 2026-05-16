"use strict";
const common_vendor = require("../common/vendor.js");
const TAB_PAGE_PATHS = /* @__PURE__ */ new Set([
  "/pages/discover/index",
  "/pages/filter/index",
  "/pages/messages/index",
  "/pages/mine/index"
]);
function runNavigateFallback(fallback) {
  try {
    fallback();
  } catch (e) {
    common_vendor.index.switchTab({ url: "/pages/discover/index" });
  }
}
function navigateBackSafe(fallback) {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    common_vendor.index.navigateBack({
      delta: 1,
      fail: () => runNavigateFallback(fallback)
    });
    return;
  }
  runNavigateFallback(fallback);
}
function navigateBackTo(url) {
  navigateBackSafe(() => {
    if (TAB_PAGE_PATHS.has(url)) {
      common_vendor.index.switchTab({ url });
      return;
    }
    common_vendor.index.redirectTo({ url, fail: () => common_vendor.index.navigateTo({ url }) });
  });
}
exports.navigateBackTo = navigateBackTo;
