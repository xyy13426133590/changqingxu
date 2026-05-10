"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_date = require("../../utils/date.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my-card",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    function goBack() {
      common_vendor.index.navigateBack({
        fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" })
      });
    }
    function goToMessages() {
      common_vendor.index.switchTab({ url: "/pages/messages/index" });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(goBack, "78"),
        b: common_vendor.unref(userStore).profile.avatar,
        c: common_vendor.t(common_vendor.unref(userStore).profile.nickname),
        d: common_vendor.t(common_vendor.unref(userStore).profile.age != null ? common_vendor.unref(userStore).profile.age + "岁" : "年龄保密"),
        e: common_vendor.t(common_vendor.unref(userStore).profile.mbti),
        f: common_vendor.t(common_vendor.unref(utils_date.getZodiacEmoji)(common_vendor.unref(userStore).profile.zodiac || "兔")),
        g: common_vendor.t(common_vendor.unref(userStore).profile.zodiac || "兔"),
        h: common_vendor.t(common_vendor.unref(userStore).profile.zodiacSign || "天秤座"),
        i: common_vendor.t(common_vendor.unref(userStore).profile.location || "北京"),
        j: common_vendor.t(common_vendor.unref(userStore).profile.education || "本科"),
        k: common_vendor.t(common_vendor.unref(userStore).profile.occupation || "产品经理"),
        l: common_vendor.t(common_vendor.unref(userStore).profile.income || "20万-30万"),
        m: common_vendor.t(common_vendor.unref(userStore).profile.bio || "喜欢旅行、摄影、烘焙，期待遇见有趣的你～"),
        n: (_a = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _a.length
      }, ((_b = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _b.length) ? {
        o: common_vendor.f(common_vendor.unref(userStore).profile.hobbies, (hobby, k0, i0) => {
          return {
            a: common_vendor.t(hobby),
            b: hobby
          };
        })
      } : {}, {
        p: common_vendor.unref(userStore).profile.isRealName
      }, common_vendor.unref(userStore).profile.isRealName ? {} : {}, {
        q: common_vendor.o(goBack, "a1"),
        r: common_vendor.o(goToMessages, "e0")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-985ac3ab"]]);
wx.createPage(MiniProgramPage);
