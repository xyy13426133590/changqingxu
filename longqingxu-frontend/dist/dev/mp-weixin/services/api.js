"use strict";
const common_vendor = require("../common/vendor.js");
var define_import_meta_env_default = {};
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const LEGACY_TOKEN_KEY = "token";
const PINIA_USER_STORE_KEY = "user-store";
const API_BASE_URL = (define_import_meta_env_default.VITE_API_BASE_URL || "").replace(/\/$/, "");
(define_import_meta_env_default.VITE_WS_BASE_URL || "").replace(/\/$/, "");
function readPiniaPersistedToken() {
  try {
    const raw = common_vendor.index.getStorageSync(PINIA_USER_STORE_KEY);
    if (!raw)
      return "";
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const t = parsed == null ? void 0 : parsed.token;
    return typeof t === "string" ? t : "";
  } catch (e) {
    return "";
  }
}
function resolveAccessToken() {
  return common_vendor.index.getStorageSync(ACCESS_TOKEN_KEY) || common_vendor.index.getStorageSync(LEGACY_TOKEN_KEY) || readPiniaPersistedToken() || "";
}
function setToken(accessToken, refreshToken) {
  common_vendor.index.setStorageSync(ACCESS_TOKEN_KEY, accessToken);
  common_vendor.index.setStorageSync(LEGACY_TOKEN_KEY, accessToken);
  if (refreshToken) {
    common_vendor.index.setStorageSync(REFRESH_TOKEN_KEY, refreshToken);
  }
}
function getToken() {
  const token = resolveAccessToken();
  if (token && !common_vendor.index.getStorageSync(ACCESS_TOKEN_KEY)) {
    common_vendor.index.setStorageSync(ACCESS_TOKEN_KEY, token);
  }
  return token;
}
function clearToken() {
  common_vendor.index.removeStorageSync(ACCESS_TOKEN_KEY);
  common_vendor.index.removeStorageSync(REFRESH_TOKEN_KEY);
  common_vendor.index.removeStorageSync(LEGACY_TOKEN_KEY);
}
exports.API_BASE_URL = API_BASE_URL;
exports.clearToken = clearToken;
exports.getToken = getToken;
exports.resolveAccessToken = resolveAccessToken;
exports.setToken = setToken;
