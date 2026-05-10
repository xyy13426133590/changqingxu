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
const REGISTRY_KEY = "cqx_mock_auth_users";
const DEMO_TEST_PHONE = "13800138000";
const DEMO_TEST_PASSWORD = "test888";
const DEMO_TEST_NICKNAME = "演示用户";
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function withBuiltInDemoUser(map) {
  if (map[DEMO_TEST_PHONE])
    return map;
  return __spreadProps(__spreadValues({}, map), {
    [DEMO_TEST_PHONE]: {
      id: "u_demo_builtin",
      phone: DEMO_TEST_PHONE,
      password: DEMO_TEST_PASSWORD,
      nickname: DEMO_TEST_NICKNAME,
      createdAt: 0
    }
  });
}
function readStorageRegistry() {
  try {
    const raw = common_vendor.index.getStorageSync(REGISTRY_KEY);
    if (!raw)
      return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_e) {
    return {};
  }
}
function readRegistry() {
  return withBuiltInDemoUser(__spreadValues({}, readStorageRegistry()));
}
function writeRegistry(map) {
  common_vendor.index.setStorageSync(REGISTRY_KEY, JSON.stringify(map));
}
const PHONE_RE = /^1[3-9]\d{9}$/;
function validatePhone(phone) {
  return PHONE_RE.test(phone.trim());
}
function validatePassword(pwd) {
  return pwd.length >= 6 && pwd.length <= 32;
}
const LOGIN_ERR_ACCOUNT_NOT_FOUND = "LOGIN_ERR_ACCOUNT_NOT_FOUND";
function makeToken(userId) {
  return `mock_${userId}_${Date.now()}`;
}
function authRegister(params) {
  return __async(this, null, function* () {
    yield delay(280);
    const phone = params.phone.trim();
    if (!validatePhone(phone))
      throw new Error("请输入正确的11位手机号");
    if (!validatePassword(params.password))
      throw new Error("密码为 6～32 位");
    const nick = params.nickname.trim();
    if (nick.length < 2 || nick.length > 16)
      throw new Error("昵称为 2～16 个字符");
    const map = readStorageRegistry();
    if (map[phone])
      throw new Error("该手机号已注册，请直接登录");
    const user = {
      id: `u_${Date.now()}`,
      phone,
      password: params.password,
      nickname: nick,
      createdAt: Date.now()
    };
    map[phone] = user;
    writeRegistry(map);
    return { token: makeToken(user.id), user };
  });
}
function authLogin(params) {
  return __async(this, null, function* () {
    yield delay(260);
    const phone = params.phone.trim();
    if (!validatePhone(phone))
      throw new Error("请输入正确的11位手机号");
    if (!params.password)
      throw new Error("请输入密码");
    if (phone === DEMO_TEST_PHONE && params.password === DEMO_TEST_PASSWORD) {
      const merged = readRegistry();
      const existing = merged[DEMO_TEST_PHONE];
      const user2 = {
        id: existing != null && existing.id != null ? existing.id : "u_demo_builtin",
        phone: DEMO_TEST_PHONE,
        password: DEMO_TEST_PASSWORD,
        nickname: existing != null && existing.nickname != null ? existing.nickname : DEMO_TEST_NICKNAME,
        createdAt: existing != null && existing.createdAt ? existing.createdAt : Date.now()
      };
      return { token: makeToken(user2.id), user: user2 };
    }
    const map = readRegistry();
    const user = map[phone];
    if (!user)
      throw new Error(LOGIN_ERR_ACCOUNT_NOT_FOUND);
    if (user.password !== params.password)
      throw new Error("密码错误");
    return { token: makeToken(user.id), user };
  });
}
const SMS_META_KEY = "cqx_mock_sms_meta";
const DEMO_SMS_CODE = "888888";
function readSmsMeta() {
  try {
    const raw = common_vendor.index.getStorageSync(SMS_META_KEY);
    if (!raw)
      return null;
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}
function writeSmsMeta(m) {
  common_vendor.index.setStorageSync(SMS_META_KEY, JSON.stringify(m));
}
function sendSmsCode(phone) {
  return __async(this, null, function* () {
    yield delay(220);
    const p = phone.trim();
    if (!validatePhone(p))
      throw new Error("请输入正确手机号");
    const now = Date.now();
    const prev = readSmsMeta();
    if (prev && prev.phone === p && now - prev.lastSentAt < 55e3) {
      const wait = Math.ceil((55e3 - (now - prev.lastSentAt)) / 1e3);
      throw new Error(`${wait} 秒后可重新获取`);
    }
    writeSmsMeta({
      phone: p,
      code: DEMO_SMS_CODE,
      expireAt: now + 5 * 60 * 1e3,
      lastSentAt: now
    });
  });
}
function authLoginBySms(phone, code) {
  return __async(this, null, function* () {
    yield delay(260);
    const p = phone.trim();
    const c = code.trim();
    if (!validatePhone(p))
      throw new Error("请输入正确手机号");
    if (!/^\d{4,6}$/.test(c))
      throw new Error("请输入 4～6 位验证码");
    const meta = readSmsMeta();
    const ok = c === DEMO_SMS_CODE || !!meta && meta.phone === p && meta.code === c && Date.now() <= meta.expireAt;
    if (!ok)
      throw new Error("验证码错误或已过期");
    const map = readStorageRegistry();
    let user = map[p];
    if (!user) {
      user = {
        id: `u_${Date.now()}`,
        phone: p,
        password: "__sms_only__",
        nickname: `用户${p.slice(-4)}`,
        createdAt: Date.now()
      };
      map[p] = user;
      writeRegistry(map);
    }
    return { token: makeToken(user.id), user };
  });
}
const WX_DEMO_PHONE = "13900001999";
const WX_DEMO_NICK = "微信用户";
function authLoginWechatMock() {
  return __async(this, null, function* () {
    yield delay(360);
    try {
      yield common_vendor.index.login({ provider: "weixin" });
    } catch (_e) {
    }
    const user = {
      id: "u_wx_demo",
      phone: WX_DEMO_PHONE,
      password: "__wx_demo__",
      nickname: WX_DEMO_NICK,
      createdAt: Date.now()
    };
    return { token: makeToken(user.id), user };
  });
}
exports.DEMO_SMS_CODE = DEMO_SMS_CODE;
exports.DEMO_TEST_PASSWORD = DEMO_TEST_PASSWORD;
exports.DEMO_TEST_PHONE = DEMO_TEST_PHONE;
exports.LOGIN_ERR_ACCOUNT_NOT_FOUND = LOGIN_ERR_ACCOUNT_NOT_FOUND;
exports.authLogin = authLogin;
exports.authLoginBySms = authLoginBySms;
exports.authLoginWechatMock = authLoginWechatMock;
exports.authRegister = authRegister;
exports.sendSmsCode = sendSmsCode;
exports.validatePassword = validatePassword;
exports.validatePhone = validatePhone;
