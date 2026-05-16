"use strict";
const common_vendor = require("../../common/vendor.js");
const services_apiUser = require("../../services/api-user.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_navigation = require("../../utils/navigation.js");
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
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
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
            avatar: utils_avatar.resolveAvatar(c.avatar, c.id)
          });
        } catch (e) {
          errorHint.value = "加载失败，请稍后重试";
        } finally {
          loading.value = false;
        }
      });
    }
    function goBack() {
      utils_navigation.navigateBackTo("/pages/discover/index");
    }
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.o(goBack, "68"),
        b: loading.value
      }, loading.value ? {} : card.value ? {
        d: card.value.avatar,
        e: common_vendor.t(card.value.nickname),
        f: common_vendor.t(card.value.age),
        g: common_vendor.t(card.value.location),
        h: common_vendor.t((_a = card.value.height) != null ? _a : "—"),
        i: common_vendor.t(card.value.matchReason),
        j: common_vendor.t(card.value.matchTagline),
        k: common_vendor.t(card.value.bio)
      } : {
        l: common_vendor.t(errorHint.value || "未找到用户")
      }, {
        c: card.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0b0b35bb"]]);
wx.createPage(MiniProgramPage);
