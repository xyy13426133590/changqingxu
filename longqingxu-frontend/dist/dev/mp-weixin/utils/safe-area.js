"use strict";
const common_vendor = require("../common/vendor.js");
function getStatusBarHeight() {
  var _a;
  try {
    const info = common_vendor.index.getSystemInfoSync();
    return (_a = info.statusBarHeight) != null ? _a : 0;
  } catch (e) {
    return 0;
  }
}
function getPageSafeTopStyle() {
  return { paddingTop: `${getStatusBarHeight()}px` };
}
exports.getPageSafeTopStyle = getPageSafeTopStyle;
