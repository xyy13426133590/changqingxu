"use strict";
const common_vendor = require("../common/vendor.js");
function upxToPx(upx) {
  var _a;
  try {
    const n = common_vendor.index.upx2px(upx);
    if (typeof n === "number" && !Number.isNaN(n))
      return n;
  } catch (e) {
  }
  return upx / 750 * ((_a = common_vendor.index.getSystemInfoSync().windowWidth) != null ? _a : 375);
}
function getCapsuleNavMetrics() {
  var _a, _b;
  const sys = common_vendor.index.getSystemInfoSync();
  const statusBar = (_a = sys.statusBarHeight) != null ? _a : 0;
  const winW = (_b = sys.windowWidth) != null ? _b : 375;
  const fallback = {
    paddingTopPx: statusBar,
    rowHeightPx: Math.max(44, Math.round(upxToPx(72))),
    paddingRightPx: 16,
    outerPaddingBottomPx: 8
  };
  try {
    if (typeof common_vendor.index.getMenuButtonBoundingClientRect === "function") {
      const m = common_vendor.index.getMenuButtonBoundingClientRect();
      if (m && typeof m.top === "number" && m.top > 0 && typeof m.height === "number" && m.height > 0) {
        const capTop = m.top;
        const capH = m.height;
        const backH = Math.round(upxToPx(72));
        const rowHeightPx = Math.max(capH, backH, 32);
        const paddingRightPx = Math.max(
          Math.round(upxToPx(16)),
          Math.ceil(winW - m.left + upxToPx(8))
        );
        return {
          paddingTopPx: capTop,
          rowHeightPx,
          paddingRightPx,
          outerPaddingBottomPx: 8
        };
      }
    }
  } catch (e) {
  }
  return fallback;
}
function getCapsuleNavOuterStyle() {
  const { paddingTopPx, outerPaddingBottomPx } = getCapsuleNavMetrics();
  return {
    paddingTop: `${paddingTopPx}px`,
    paddingBottom: `${outerPaddingBottomPx}px`,
    boxSizing: "border-box"
  };
}
function getCapsuleNavRowStyle() {
  const { rowHeightPx, paddingRightPx } = getCapsuleNavMetrics();
  return {
    height: `${rowHeightPx}px`,
    paddingRight: `${paddingRightPx}px`,
    boxSizing: "border-box"
  };
}
function getCapsulePageTopPaddingStyle() {
  const { paddingTopPx } = getCapsuleNavMetrics();
  return { paddingTop: `${paddingTopPx}px`, boxSizing: "border-box" };
}
exports.getCapsuleNavOuterStyle = getCapsuleNavOuterStyle;
exports.getCapsuleNavRowStyle = getCapsuleNavRowStyle;
exports.getCapsulePageTopPaddingStyle = getCapsulePageTopPaddingStyle;
