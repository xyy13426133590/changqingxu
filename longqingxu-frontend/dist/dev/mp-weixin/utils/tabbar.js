"use strict";
const common_vendor = require("../common/vendor.js");
function safeHideNativeTabBar() {
  common_vendor.index.hideTabBar({
    animation: false,
    fail() {
    }
  });
}
exports.safeHideNativeTabBar = safeHideNativeTabBar;
