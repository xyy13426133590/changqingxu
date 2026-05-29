"use strict";
const services_api = require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
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
function saveAuthResponse(data) {
  return __async(this, null, function* () {
    services_api.setToken(data.accessToken, data.refreshToken);
    return data;
  });
}
function apiRegister(params) {
  return __async(this, null, function* () {
    {
      const data2 = yield services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.auth.register, params, { skipAuth: true });
      return saveAuthResponse(data2);
    }
  });
}
function apiLogin(params) {
  return __async(this, null, function* () {
    {
      const data2 = yield services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.auth.login, params, { skipAuth: true });
      return saveAuthResponse(data2);
    }
  });
}
function apiSmsLogin(params) {
  return __async(this, null, function* () {
    {
      const data2 = yield services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.auth.smsLogin, params, { skipAuth: true });
      return saveAuthResponse(data2);
    }
  });
}
function apiSendSms(params) {
  return __async(this, null, function* () {
    {
      return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.auth.sendSms, params, { skipAuth: true });
    }
  });
}
function apiWechatLogin(params) {
  return __async(this, null, function* () {
    {
      const data2 = yield services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.auth.wechatLogin, params, { skipAuth: true });
      return saveAuthResponse(data2);
    }
  });
}
exports.apiLogin = apiLogin;
exports.apiRegister = apiRegister;
exports.apiSendSms = apiSendSms;
exports.apiSmsLogin = apiSmsLogin;
exports.apiWechatLogin = apiWechatLogin;
