"use strict";
const common_vendor = require("../common/vendor.js");
var define_import_meta_env_default = {};
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const API_BASE_URL = (define_import_meta_env_default.VITE_API_BASE_URL || "").replace(/\/$/, "");
(define_import_meta_env_default.VITE_WS_BASE_URL || "").replace(/\/$/, "");
function setToken(accessToken, refreshToken) {
  common_vendor.index.setStorageSync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    common_vendor.index.setStorageSync(REFRESH_TOKEN_KEY, refreshToken);
  }
}
function getToken() {
  return common_vendor.index.getStorageSync(ACCESS_TOKEN_KEY) || "";
}
function clearToken() {
  common_vendor.index.removeStorageSync(ACCESS_TOKEN_KEY);
  common_vendor.index.removeStorageSync(REFRESH_TOKEN_KEY);
}
exports.API_BASE_URL = API_BASE_URL;
exports.clearToken = clearToken;
exports.getToken = getToken;
exports.setToken = setToken;
