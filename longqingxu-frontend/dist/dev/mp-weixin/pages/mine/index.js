"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_myMoments = require("../../stores/my-moments.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_tabbar = require("../../utils/tabbar.js");
const utils_safeArea = require("../../utils/safe-area.js");
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
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const AUTH_TAG_PENDING = "未认证";
const AUTH_TAG_DONE = "已认证";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const pageTopInsetStyle = common_vendor.computed(() => utils_safeArea.getCapsulePageTopPaddingStyle());
    const defaultAvatar = utils_avatar.DEMO_AVATARS[0];
    const guestAvatarSrc = utils_avatar.DEMO_AVATARS[1];
    const userStore = stores_user.useUserStore();
    const myMomentsStore = stores_myMoments.useMyMomentsStore();
    function strFilled(v) {
      return typeof v === "string" && v.trim().length > 0;
    }
    function numFilled(v) {
      return v != null && typeof v === "number" && !Number.isNaN(v);
    }
    function computeProfileCompletenessPercent(p) {
      var _a, _b;
      const checks = [
        strFilled(p.nickname),
        strFilled(p.avatar),
        p.gender === "male" || p.gender === "female",
        strFilled(p.birthday) || numFilled(p.age),
        numFilled(p.height),
        numFilled(p.weight),
        strFilled(p.location),
        strFilled(p.hometown),
        strFilled(p.education),
        strFilled(p.school),
        strFilled(p.occupation),
        strFilled(p.jobLevel),
        strFilled(p.company),
        strFilled(p.income),
        strFilled(p.bio),
        ((_b = (_a = p.hobbies) == null ? void 0 : _a.length) != null ? _b : 0) > 0,
        strFilled(p.mbti),
        !!p.isRealName,
        !!p.isFaceVerified
      ];
      const hit = checks.filter(Boolean).length;
      return Math.min(100, Math.round(hit / checks.length * 100));
    }
    const profileCompletenessPercent = common_vendor.computed(
      () => userStore.isLogin ? computeProfileCompletenessPercent(userStore.profile) : 0
    );
    common_vendor.onShow(() => {
      utils_tabbar.safeHideNativeTabBar();
      void userStore.hydrateProfile();
      if (userStore.isLogin) {
        void myMomentsStore.loadStats();
      }
    });
    function authMenuTag(done) {
      return done ? { tag: AUTH_TAG_DONE, tagTone: "done" } : { tag: AUTH_TAG_PENDING, tagTone: "pending" };
    }
    const myMomentsTag = common_vendor.computed(() => {
      if (!myMomentsStore.statsLoaded)
        return void 0;
      const count = myMomentsStore.stats.postCount;
      return count > 0 ? `${count} 条` : "去发布";
    });
    const menuItems = common_vendor.computed(() => [
      {
        key: "profile-edit",
        label: "编辑资料",
        icon: "✎",
        iconClass: "purple"
      },
      {
        key: "my-card",
        label: "我的资料卡",
        icon: "🪪",
        iconClass: "orange"
      },
      __spreadValues({
        key: "my-moments",
        label: "我的动态",
        icon: "✦",
        iconClass: "purple"
      }, myMomentsTag.value ? { tag: myMomentsTag.value, tagTone: void 0 } : {}),
      {
        key: "vip-center",
        label: "会员中心",
        icon: "👑",
        iconClass: "amber"
      },
      __spreadValues({
        key: "real-name",
        label: "实名认证",
        icon: "🪪",
        iconClass: "green"
      }, authMenuTag(!!userStore.profile.isRealName)),
      __spreadValues({
        key: "face-verify",
        label: "人脸认证",
        icon: "👤",
        iconClass: "cyan"
      }, authMenuTag(!!userStore.profile.isFaceVerified)),
      {
        key: "discover",
        label: "去发现",
        icon: "🧭",
        iconClass: "purple"
      },
      {
        key: "logout",
        label: "退出登录",
        icon: "⎋",
        iconClass: "gray",
        textClass: "logout-text"
      }
    ]);
    function onMenuTap(key) {
      switch (key) {
        case "profile-edit":
          navigateTo("profile-edit");
          break;
        case "my-card":
          navigateTo("my-card");
          break;
        case "my-moments":
          common_vendor.index.navigateTo({ url: "/pages/mine/my-moments" });
          break;
        case "vip-center":
          navigateTo("vip-center");
          break;
        case "real-name":
          goRealName();
          break;
        case "face-verify":
          goFaceVerify();
          break;
        case "discover":
          common_vendor.index.switchTab({ url: "/pages/discover/index" });
          break;
        case "logout":
          onLogout();
          break;
      }
    }
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/auth/welcome" });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    function goRealName() {
      common_vendor.index.navigateTo({ url: "/pages/auth/real-name" });
    }
    function goFaceVerify() {
      if (!userStore.profile.isRealName) {
        common_vendor.index.showModal({
          title: "提示",
          content: "建议先完成实名认证，再进行人脸核验。演示环境也可跳过证件，仅体验人脸页。",
          confirmText: "去实名",
          cancelText: "仅演示",
          success(res) {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/auth/real-name" });
            } else if (res.cancel) {
              common_vendor.index.navigateTo({ url: "/pages/auth/face-verify?onlyFace=1" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/auth/face-verify" });
    }
    function navigateTo(page) {
      common_vendor.index.navigateTo({ url: `/pages/mine/${page}` });
    }
    function onLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        success(res) {
          if (res.confirm)
            userStore.logout();
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(userStore).isLogin
      }, !common_vendor.unref(userStore).isLogin ? {
        b: common_vendor.unref(guestAvatarSrc),
        c: common_vendor.o(goLogin, "88"),
        d: common_vendor.o(goRegister, "15")
      } : {
        e: common_vendor.unref(userStore).profile.avatar || common_vendor.unref(defaultAvatar),
        f: common_vendor.t(common_vendor.unref(userStore).profile.nickname || "我"),
        g: common_vendor.t(profileCompletenessPercent.value),
        h: `${profileCompletenessPercent.value}%`,
        i: common_vendor.f(menuItems.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.icon),
            b: common_vendor.n(item.iconClass),
            c: common_vendor.t(item.label),
            d: common_vendor.n(item.textClass),
            e: item.tag
          }, item.tag ? {
            f: common_vendor.t(item.tag),
            g: common_vendor.n(item.tagTone)
          } : {}, {
            h: item.key,
            i: item.key === "logout" ? 1 : "",
            j: common_vendor.o(($event) => onMenuTap(item.key), item.key)
          });
        })
      }, {
        j: common_vendor.p({
          active: "mine"
        }),
        k: common_vendor.s(pageTopInsetStyle.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9023ef44"]]);
wx.createPage(MiniProgramPage);
