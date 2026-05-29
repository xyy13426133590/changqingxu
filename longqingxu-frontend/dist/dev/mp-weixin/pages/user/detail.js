"use strict";
const common_vendor = require("../../common/vendor.js");
const services_apiUser = require("../../services/api-user.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
const utils_date = require("../../utils/date.js");
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
const dash = "—";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    const userId = common_vendor.ref("");
    const loading = common_vendor.ref(true);
    const card = common_vendor.ref(null);
    const errorHint = common_vendor.ref("");
    common_vendor.onLoad((query) => {
      userId.value = (query == null ? void 0 : query.id) || "";
      void loadDetail();
    });
    function loadDetail() {
      return __async(this, null, function* () {
        loading.value = true;
        card.value = null;
        errorHint.value = "";
        const id = userId.value.trim();
        if (!id) {
          loading.value = false;
          return;
        }
        try {
          const c = yield services_apiUser.apiGetUserDetail(id);
          card.value = __spreadProps(__spreadValues({}, c), {
            hobbies: Array.isArray(c.hobbies) ? c.hobbies : [],
            avatar: utils_avatar.resolveAvatar(c.avatar, c.id),
            isFaceVerified: !!c.isFaceVerified
          });
        } catch (e) {
          errorHint.value = "加载失败，请稍后重试";
        } finally {
          loading.value = false;
        }
      });
    }
    const genderLabel = common_vendor.computed(() => {
      var _a;
      const g = (_a = card.value) == null ? void 0 : _a.gender;
      if (g === "male")
        return "♂";
      if (g === "female")
        return "♀";
      return "";
    });
    const summaryLine = common_vendor.computed(() => {
      var _a, _b;
      const c = card.value;
      if (!c)
        return "";
      const parts = [];
      if (typeof c.age === "number" && !Number.isNaN(c.age))
        parts.push(`${c.age}岁`);
      parts.push(((_a = c.location) == null ? void 0 : _a.trim()) || dash);
      const heightStr = typeof c.height === "number" && !Number.isNaN(c.height) ? `${c.height}cm` : dash;
      parts.push(heightStr);
      if (c.weight != null && typeof c.weight === "number" && !Number.isNaN(c.weight)) {
        parts.push(`${c.weight}kg`);
      }
      const ht = (_b = c.hometown) == null ? void 0 : _b.trim();
      if (ht)
        parts.push(`籍贯 ${ht}`);
      return parts.join(" · ");
    });
    const folkMetaLine = common_vendor.computed(() => {
      const c = card.value;
      if (!c)
        return "";
      const z = c.zodiac || "兔";
      const zs = c.zodiacSign || "天秤座";
      const rz = c.riyuan || "甲木";
      return `${utils_date.getZodiacEmoji(z)} ${z} · ${utils_date.getZodiacSignSymbol(zs)} ${zs} · ${utils_date.getRiyuanEmoji(rz)} ${rz} · ${c.mbti || "INFP"}`;
    });
    const displayEducation = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = card.value) == null ? void 0 : _a.education) == null ? void 0 : _b.trim()) || dash;
    });
    const displayOccupation = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = card.value) == null ? void 0 : _a.occupation) == null ? void 0 : _b.trim()) || dash;
    });
    const displayIncome = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = card.value) == null ? void 0 : _a.income) == null ? void 0 : _b.trim()) || dash;
    });
    const bioText = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = card.value) == null ? void 0 : _a.bio) == null ? void 0 : _b.trim()) || "暂未填写介绍";
    });
    const schoolLine = common_vendor.computed(() => {
      var _a, _b;
      const s = (_b = (_a = card.value) == null ? void 0 : _a.school) == null ? void 0 : _b.trim();
      return s || "";
    });
    const tierTag = common_vendor.computed(() => {
      var _a;
      const t = (_a = card.value) == null ? void 0 : _a.schoolTier;
      if (t === "985")
        return "985";
      if (t === "211")
        return "211";
      return "";
    });
    const hasVerifyBadges = common_vendor.computed(() => {
      const c = card.value;
      if (!c)
        return false;
      return !!(c.isRealName || c.isFaceVerified || c.isVip);
    });
    const clampedScore = common_vendor.computed(() => {
      var _a;
      const s = (_a = card.value) == null ? void 0 : _a.matchScore;
      if (typeof s !== "number" || Number.isNaN(s))
        return 0;
      return Math.min(100, Math.max(0, Math.round(s)));
    });
    const matchScorePct = common_vendor.computed(() => clampedScore.value);
    function goBack() {
      utils_navigation.navigateBackTo("/pages/discover/index");
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(goBack, "95"),
        b: common_vendor.s(capsuleNavRowStyle.value),
        c: common_vendor.s(capsuleNavOuterStyle.value),
        d: loading.value
      }, loading.value ? {} : card.value ? common_vendor.e({
        f: card.value.avatar,
        g: common_vendor.t(card.value.nickname),
        h: common_vendor.t(genderLabel.value),
        i: hasVerifyBadges.value
      }, hasVerifyBadges.value ? common_vendor.e({
        j: card.value.isRealName
      }, card.value.isRealName ? {} : {}, {
        k: card.value.isFaceVerified
      }, card.value.isFaceVerified ? {} : {}, {
        l: card.value.isVip
      }, card.value.isVip ? {} : {}) : {}, {
        m: common_vendor.t(summaryLine.value),
        n: common_vendor.t(folkMetaLine.value),
        o: common_vendor.t(displayEducation.value),
        p: schoolLine.value
      }, schoolLine.value ? common_vendor.e({
        q: common_vendor.t(schoolLine.value),
        r: tierTag.value
      }, tierTag.value ? {
        s: common_vendor.t(tierTag.value)
      } : {}) : {}, {
        t: common_vendor.t(displayOccupation.value),
        v: card.value.jobLevel
      }, card.value.jobLevel ? {
        w: common_vendor.t(card.value.jobLevel)
      } : {}, {
        x: card.value.company
      }, card.value.company ? {
        y: common_vendor.t(card.value.company)
      } : {}, {
        z: common_vendor.t(displayIncome.value),
        A: common_vendor.t(card.value.matchReason),
        B: common_vendor.t(card.value.matchTagline),
        C: matchScorePct.value + "%",
        D: common_vendor.t(clampedScore.value),
        E: common_vendor.t(bioText.value),
        F: (_a = card.value.hobbies) == null ? void 0 : _a.length
      }, ((_b = card.value.hobbies) == null ? void 0 : _b.length) ? {
        G: common_vendor.f(card.value.hobbies, (h, k0, i0) => {
          return {
            a: common_vendor.t(h),
            b: h
          };
        })
      } : {}) : {
        H: common_vendor.t(errorHint.value || "未找到用户")
      }, {
        e: card.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0b0b35bb"]]);
wx.createPage(MiniProgramPage);
