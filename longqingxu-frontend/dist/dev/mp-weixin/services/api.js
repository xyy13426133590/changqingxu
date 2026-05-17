"use strict";
const common_vendor = require("../common/vendor.js");
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const API_BASE_URL = "http://192.168.1.34:3000/api";
const WS_BASE_URL = "ws://192.168.1.34:3000/chat";
function getToken() {
  return common_vendor.index.getStorageSync("token") || null;
}
function setToken(token, refreshToken) {
  common_vendor.index.setStorageSync("token", token);
  common_vendor.index.setStorageSync("refreshToken", refreshToken);
}
function clearToken() {
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("refreshToken");
}
function request(config) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header = __spreadValues({
      "Content-Type": "application/json"
    }, config.header);
    if (token && !config.skipAuth) {
      header["Authorization"] = `Bearer ${token}`;
    }
    common_vendor.index.request(__spreadProps(__spreadValues({}, config), {
      url: `${API_BASE_URL}${config.url}`,
      header,
      success: (res) => {
        const response = res.data;
        if (res.statusCode >= 400) {
          common_vendor.index.showToast({
            title: (response == null ? void 0 : response.message) || "请求失败",
            icon: "none"
          });
          reject(new Error((response == null ? void 0 : response.message) || "请求失败"));
          return;
        }
        if (response.code !== "SUCCESS") {
          if (res.statusCode === 401) {
            clearToken();
            common_vendor.index.reLaunch({ url: "/pages/auth/login" });
          }
          common_vendor.index.showToast({
            title: response.message || "操作失败",
            icon: "none"
          });
          reject(new Error(response.message));
          return;
        }
        resolve(response.data);
      },
      fail: () => {
        const hint = `无法连接服务器，请检查后端是否启动及 .env 中 VITE_API_BASE_URL（当前：${API_BASE_URL}）`;
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2800
        });
        reject(new Error(hint));
      }
    }));
  });
}
function get(url, params, config) {
  let queryString = "";
  if (params) {
    const query = Object.entries(params).filter(([_, value]) => value !== void 0 && value !== null).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
    if (query) {
      queryString = `?${query}`;
    }
  }
  return request(__spreadValues({
    method: "GET",
    url: `${url}${queryString}`
  }, config));
}
function post(url, data, config) {
  return request(__spreadValues({
    method: "POST",
    url,
    data
  }, config));
}
function put(url, data, config) {
  return request(__spreadValues({
    method: "PUT",
    url,
    data
  }, config));
}
function uploadFile(url, filePath, name = "file", formData) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    common_vendor.index.uploadFile({
      url: `${API_BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        const raw = res.data;
        const statusOk = typeof res.statusCode === "number" && res.statusCode >= 200 && res.statusCode < 300;
        try {
          const data = JSON.parse(raw);
          if (!statusOk || data.code !== "SUCCESS") {
            const hint = (data == null ? void 0 : data.message) || (statusOk ? "上传失败" : `上传失败 (${res.statusCode})`);
            common_vendor.index.showToast({ title: hint, icon: "none" });
            reject(new Error(hint));
            return;
          }
          resolve(data.data);
        } catch (e) {
          if (!statusOk) {
            const hint = typeof raw === "string" ? `上传失败 (${res.statusCode})` : "上传失败";
            common_vendor.index.showToast({ title: hint, icon: "none" });
            reject(new Error(hint));
            return;
          }
          common_vendor.index.showToast({ title: "上传响应异常", icon: "none" });
          reject(new Error("INVALID_UPLOAD_RESPONSE"));
        }
      },
      fail: reject
    });
  });
}
exports.API_BASE_URL = API_BASE_URL;
exports.WS_BASE_URL = WS_BASE_URL;
exports.clearToken = clearToken;
exports.get = get;
exports.getToken = getToken;
exports.post = post;
exports.put = put;
exports.setToken = setToken;
exports.uploadFile = uploadFile;
