"use strict";
const common_vendor = require("../common/vendor.js");
const services_api = require("./api.js");
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
const CLOUD_ENV = "prod-love-app-d8gn9cxenfb74c1ac";
let cloudInitialized = false;
function redirectToLogin() {
  services_api.clearToken();
  try {
    common_vendor.index.reLaunch({ url: "/pages/auth/login" });
  } catch (e) {
  }
}
function initCloud() {
  var _a;
  if (cloudInitialized)
    return;
  const wxCloud = (_a = globalThis == null ? void 0 : globalThis.wx) == null ? void 0 : _a.cloud;
  if (wxCloud) {
    wxCloud.init({
      env: CLOUD_ENV,
      traceUser: true
    });
    cloudInitialized = true;
  }
}
function callCloud(_0) {
  return __async(this, arguments, function* (name, data = {}, options = {}) {
    var _a;
    initCloud();
    const payload = __spreadValues({}, data);
    if (!options.skipAuth) {
      const accessToken = services_api.getToken();
      if (accessToken)
        payload.token = accessToken;
    }
    const wxCloud = (_a = globalThis == null ? void 0 : globalThis.wx) == null ? void 0 : _a.cloud;
    if (!wxCloud)
      throw new Error("当前环境不支持云函数");
    const res = yield wxCloud.callFunction({
      name,
      data: payload
    });
    const result = (res == null ? void 0 : res.result) || {};
    if (result.code === "SUCCESS") {
      return result.data;
    }
    if (result.code === "UNAUTHORIZED") {
      redirectToLogin();
    }
    throw new Error(result.message || "云函数调用失败");
  });
}
function cloudUploadFile(cloudPath, filePath) {
  return __async(this, null, function* () {
    var _a;
    initCloud();
    const wxCloud = (_a = globalThis == null ? void 0 : globalThis.wx) == null ? void 0 : _a.cloud;
    if (!wxCloud)
      throw new Error("当前环境不支持云存储上传");
    return wxCloud.uploadFile({
      cloudPath,
      filePath
    });
  });
}
exports.CLOUD_ENV = CLOUD_ENV;
exports.callCloud = callCloud;
exports.cloudUploadFile = cloudUploadFile;
exports.initCloud = initCloud;
