"use strict";
const services_api = require("./api.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function apiRegister(params) {
  return __async(this, null, function* () {
    const data = yield services_api.post("/auth/register", params);
    services_api.setToken(data.accessToken, data.refreshToken);
    return data;
  });
}
function apiLogin(params) {
  return __async(this, null, function* () {
    const data = yield services_api.post("/auth/login", params);
    services_api.setToken(data.accessToken, data.refreshToken);
    return data;
  });
}
function apiSmsLogin(params) {
  return __async(this, null, function* () {
    const data = yield services_api.post("/auth/sms-login", params);
    services_api.setToken(data.accessToken, data.refreshToken);
    return data;
  });
}
function apiSendSms(params) {
  return __async(this, null, function* () {
    return services_api.post("/auth/send-sms", params);
  });
}
function apiWechatLogin(params) {
  return __async(this, null, function* () {
    const data = yield services_api.post("/auth/wechat-login", params);
    services_api.setToken(data.accessToken, data.refreshToken);
    return data;
  });
}
exports.apiLogin = apiLogin;
exports.apiRegister = apiRegister;
exports.apiSendSms = apiSendSms;
exports.apiSmsLogin = apiSmsLogin;
exports.apiWechatLogin = apiWechatLogin;
