"use strict";
const common_vendor = require("../common/vendor.js");
const services_auth = require("../services/auth.js");
const utils_avatar = require("../utils/avatar.js");
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
const MOCK_DEFAULT_AVATAR = utils_avatar.avatarUrl();
function profileFromMockUser(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: MOCK_DEFAULT_AVATAR,
    gender: "female",
    birthday: "",
    age: 26,
    hometown: "北京",
    location: "北京朝阳区",
    zodiac: "兔",
    zodiacSign: "天秤座",
    mbti: "INFP",
    riyuan: "甲木",
    education: "本科",
    occupation: "产品经理",
    jobLevel: "中级",
    income: "10万-20万",
    bio: "认真生活，期待遇见同频的你～",
    hobbies: [],
    isRealName: false,
    isFaceVerified: false,
    isVip: false
  };
}
function maskIdCard(id) {
  const s = id.trim();
  if (s.length < 8)
    return "****************";
  return `${s.slice(0, 4)}**********${s.slice(-4)}`;
}
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref("");
  const isLogin = common_vendor.ref(false);
  const realNameDraft = common_vendor.ref(null);
  const profile = common_vendor.ref({
    nickname: "小雨",
    avatar: utils_avatar.avatarUrl(),
    zodiac: "兔",
    zodiacSign: "天秤座",
    mbti: "INFP",
    riyuan: "甲木",
    age: 26,
    location: "北京朝阳区",
    height: 162,
    education: "本科",
    occupation: "产品经理",
    income: "20万-30万",
    isRealName: true,
    isVip: true
  });
  const dailyGreetings = common_vendor.ref(3);
  const maxDailyGreetings = common_vendor.ref(3);
  const remainingGreetings = common_vendor.computed(() => dailyGreetings.value);
  const canGreet = common_vendor.computed(() => dailyGreetings.value > 0 || profile.value.isVip);
  const vipStatus = common_vendor.computed(() => {
    if (!profile.value.isVip)
      return "none";
    return profile.value.vipExpiry && new Date(profile.value.vipExpiry) > /* @__PURE__ */ new Date() ? "active" : "expired";
  });
  function init() {
    const savedToken = common_vendor.index.getStorageSync("token");
    if (savedToken) {
      token.value = savedToken;
      isLogin.value = true;
    } else {
      token.value = "";
      isLogin.value = false;
      profile.value = {};
    }
    resetDailyGreetings();
  }
  function loginByPhone(phone, password) {
    return __async(this, null, function* () {
      const { token: t, user } = yield services_auth.authLogin({ phone, password });
      setLogin(t, profileFromMockUser(user));
    });
  }
  function loginBySms(phone, code) {
    return __async(this, null, function* () {
      const { token: t, user } = yield services_auth.authLoginBySms(phone, code);
      setLogin(t, profileFromMockUser(user));
    });
  }
  function loginByWeChat() {
    return __async(this, null, function* () {
      const { token: t, user } = yield services_auth.authLoginWechatMock();
      setLogin(t, profileFromMockUser(user));
    });
  }
  function setRealNameDraft(payload) {
    realNameDraft.value = payload;
  }
  function clearRealNameDraft() {
    realNameDraft.value = null;
  }
  function hasRealNameDraft() {
    return !!realNameDraft.value;
  }
  function applyFaceVerificationSuccess() {
    const d = realNameDraft.value;
    if (d) {
      profile.value = __spreadProps(__spreadValues({}, profile.value), {
        legalName: d.legalName,
        idCardMasked: maskIdCard(d.idCard),
        isRealName: true,
        isFaceVerified: true
      });
      realNameDraft.value = null;
    } else {
      profile.value = __spreadProps(__spreadValues({}, profile.value), { isFaceVerified: true });
    }
  }
  function registerByPhone(phone, password, nickname) {
    return __async(this, null, function* () {
      const { token: t, user } = yield services_auth.authRegister({ phone, password, nickname });
      setLogin(t, profileFromMockUser(user));
    });
  }
  function resetDailyGreetings() {
    const lastReset = common_vendor.index.getStorageSync("greetingLastReset");
    const today = (/* @__PURE__ */ new Date()).toDateString();
    if (lastReset !== today) {
      dailyGreetings.value = maxDailyGreetings.value;
      common_vendor.index.setStorageSync("greetingLastReset", today);
    }
  }
  function useGreeting() {
    if (profile.value.isVip)
      return true;
    if (dailyGreetings.value > 0) {
      dailyGreetings.value--;
      return true;
    }
    return false;
  }
  function setLogin(userToken, userProfile) {
    token.value = userToken;
    profile.value = __spreadValues({}, userProfile);
    isLogin.value = true;
    common_vendor.index.setStorageSync("token", userToken);
  }
  function logout() {
    token.value = "";
    isLogin.value = false;
    profile.value = {};
    realNameDraft.value = null;
    common_vendor.index.removeStorageSync("token");
  }
  function updateProfile(data) {
    profile.value = __spreadValues(__spreadValues({}, profile.value), data);
  }
  function upgradeVip(planId, expiryDate) {
    profile.value.isVip = true;
    profile.value.vipExpiry = expiryDate;
  }
  return {
    token,
    isLogin,
    profile,
    dailyGreetings,
    remainingGreetings,
    canGreet,
    vipStatus,
    init,
    resetDailyGreetings,
    useGreeting,
    setLogin,
    loginByPhone,
    loginBySms,
    loginByWeChat,
    setRealNameDraft,
    clearRealNameDraft,
    hasRealNameDraft,
    applyFaceVerificationSuccess,
    registerByPhone,
    logout,
    updateProfile,
    upgradeVip
  };
}, {
  persist: {
    key: "user-store",
    paths: ["token", "profile", "dailyGreetings"]
  }
});
exports.useUserStore = useUserStore;
