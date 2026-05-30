"use strict";
const common_vendor = require("../common/vendor.js");
const services_apiAuth = require("../services/api-auth.js");
const services_apiUser = require("../services/api-user.js");
const services_api = require("../services/api.js");
const services_cloud = require("../services/cloud.js");
const utils_avatar = require("../utils/avatar.js");
const stores_discover = require("./discover.js");
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
function mapApiUserToProfile(p) {
  var _a;
  const gender = p.gender === "male" || p.gender === "female" ? p.gender : "";
  let vipExpiry;
  if (p.vipExpiry != null) {
    vipExpiry = typeof p.vipExpiry === "string" ? p.vipExpiry : new Date(p.vipExpiry).toISOString();
  }
  return {
    id: p.id,
    nickname: p.nickname,
    avatar: utils_avatar.resolveAvatar(p.avatar, p.id),
    gender,
    birthday: (_a = p.birthday) != null ? _a : void 0,
    hometown: p.hometown || "",
    location: p.location || "",
    age: p.age,
    height: p.height,
    weight: p.weight,
    zodiac: p.zodiac || "",
    zodiacSign: p.zodiacSign || "",
    mbti: p.mbti || "",
    riyuan: p.riyuan || "",
    education: p.education || "",
    school: p.school,
    schoolTier: p.schoolTier,
    occupation: p.occupation || "",
    jobLevel: p.jobLevel || "",
    company: p.company,
    bio: p.bio || "",
    hobbies: p.hobbies || [],
    isRealName: !!p.isRealName,
    isFaceVerified: !!p.isFaceVerified,
    isVip: !!p.isVip,
    vipExpiry
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
  const profile = common_vendor.ref({});
  const dailyGreetings = common_vendor.ref(3);
  const maxDailyGreetings = common_vendor.ref(3);
  const remainingGreetings = common_vendor.computed(() => dailyGreetings.value);
  const canGreet = common_vendor.computed(() => dailyGreetings.value > 0 || !!profile.value.isVip);
  const vipStatus = common_vendor.computed(() => {
    if (!profile.value.isVip)
      return "none";
    return profile.value.vipExpiry && new Date(profile.value.vipExpiry) > /* @__PURE__ */ new Date() ? "active" : "expired";
  });
  function init() {
    var _a;
    const savedToken = token.value || services_api.resolveAccessToken();
    if (savedToken) {
      token.value = savedToken;
      isLogin.value = true;
      services_api.setToken(savedToken);
      void hydrateProfile();
    } else if (isLogin.value || ((_a = profile.value) == null ? void 0 : _a.id)) {
      logout();
    } else {
      token.value = "";
      isLogin.value = false;
      profile.value = {};
    }
    resetDailyGreetings();
  }
  function hydrateProfile() {
    return __async(this, null, function* () {
      const t = services_api.resolveAccessToken() || token.value;
      if (!t) {
        logout();
        return false;
      }
      services_api.setToken(t);
      token.value = t;
      try {
        const me = yield services_apiUser.apiGetMe();
        profile.value = __spreadValues(__spreadValues({}, profile.value), mapApiUserToProfile(me));
        isLogin.value = true;
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (e instanceof services_cloud.CloudUnauthorizedError || msg.includes("请先登录") || msg.includes("401") || msg.includes("未授权") || msg.includes("Unauthorized") || msg.includes("登录已过期")) {
          logout();
        }
        return false;
      }
    });
  }
  function loginByPhone(phone, password) {
    return __async(this, null, function* () {
      yield services_apiAuth.apiLogin({ phone, password });
      const me = yield services_apiUser.apiGetMe();
      const access = services_api.getToken();
      if (!access)
        throw new Error("登录态异常");
      setLogin(access, mapApiUserToProfile(me));
    });
  }
  function loginBySms(phone, code) {
    return __async(this, null, function* () {
      const auth = yield services_apiAuth.apiSmsLogin({ phone, code });
      const access = services_api.getToken();
      if (!access)
        throw new Error("登录态异常");
      try {
        const me = yield services_apiUser.apiGetMe();
        setLogin(access, mapApiUserToProfile(me));
      } catch (e) {
        setLogin(access, {
          id: auth.user.id,
          nickname: auth.user.nickname || `用户${phone.slice(-4)}`,
          avatar: utils_avatar.resolveAvatar(auth.user.avatar, auth.user.id),
          gender: "",
          hometown: "",
          location: "",
          zodiac: "",
          zodiacSign: "",
          mbti: "",
          riyuan: "",
          education: "",
          occupation: "",
          jobLevel: "",
          income: "",
          bio: "",
          hobbies: [],
          isRealName: !!auth.user.isRealName,
          isFaceVerified: !!auth.user.isFaceVerified,
          isVip: !!auth.user.isVip
        });
      }
    });
  }
  function loginByWeChat() {
    return __async(this, null, function* () {
      let code;
      const loginRes = yield common_vendor.index.login({ provider: "weixin" });
      code = loginRes.code;
      if (!code) {
        throw new Error("请在微信小程序中使用微信登录，或使用手机号登录");
      }
      yield services_apiAuth.apiWechatLogin({ code });
      const me = yield services_apiUser.apiGetMe();
      const access = services_api.getToken();
      if (!access)
        throw new Error("登录态异常");
      setLogin(access, mapApiUserToProfile(me));
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
      yield services_apiAuth.apiRegister({ phone, password, nickname });
      const me = yield services_apiUser.apiGetMe();
      const access = services_api.getToken();
      if (!access)
        throw new Error("登录态异常");
      setLogin(access, mapApiUserToProfile(me));
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
    services_api.setToken(userToken);
  }
  function logout() {
    services_api.clearToken();
    token.value = "";
    isLogin.value = false;
    profile.value = {};
    realNameDraft.value = null;
    stores_discover.useDiscoverStore().clearDiscoverData();
  }
  function updateProfile(data) {
    profile.value = __spreadValues(__spreadValues({}, profile.value), data);
  }
  function upgradeVip(_planId, expiryDate) {
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
    hydrateProfile,
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
    paths: ["token", "profile", "dailyGreetings"],
    afterRestore: (ctx) => {
      var _a;
      const store = ctx.store;
      if (store.token) {
        services_api.setToken(store.token);
        store.isLogin = true;
      } else if (store.isLogin || ((_a = store.profile) == null ? void 0 : _a.id)) {
        store.isLogin = false;
        store.profile = {};
      }
    }
  }
});
exports.useUserStore = useUserStore;
