"use strict";
const services_api = require("../services/api.js");
function isMpWeixinLocalhostApi() {
  return /localhost|127\.0\.0\.1/i.test(services_api.API_BASE_URL);
}
function mpWeixinApiHint() {
  return "小程序无法访问 localhost。请在 longqingxu-frontend/.env 将 VITE_API_BASE_URL 改为电脑局域网 IP（如 http://192.168.1.100:3000/api），重新编译并在开发者工具勾选「不校验合法域名」。";
}
exports.isMpWeixinLocalhostApi = isMpWeixinLocalhostApi;
exports.mpWeixinApiHint = mpWeixinApiHint;
