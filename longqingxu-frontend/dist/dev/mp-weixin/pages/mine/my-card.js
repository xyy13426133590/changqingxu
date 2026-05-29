"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_date = require("../../utils/date.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my-card",
  setup(__props) {
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    const userStore = stores_user.useUserStore();
    const metaZodiac = common_vendor.computed(() => userStore.profile.zodiac || "兔");
    const metaZodiacSign = common_vendor.computed(() => userStore.profile.zodiacSign || "天秤座");
    const metaRiyuan = common_vendor.computed(() => {
      if (userStore.profile.riyuan)
        return userStore.profile.riyuan;
      const birthday = userStore.profile.birthday;
      if (birthday) {
        const d = new Date(birthday);
        if (!Number.isNaN(d.getTime())) {
          return utils_date.getBirthInfo(d).riyuan;
        }
      }
      return "甲木";
    });
    const metaZodiacEmoji = common_vendor.computed(() => utils_date.getZodiacEmoji(metaZodiac.value));
    const metaSignSymbol = common_vendor.computed(() => utils_date.getZodiacSignSymbol(metaZodiacSign.value));
    const metaRiyuanEmoji = common_vendor.computed(() => utils_date.getRiyuanEmoji(metaRiyuan.value));
    common_vendor.onMounted(() => {
      void userStore.hydrateProfile();
    });
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/index");
    }
    function goToMessages() {
      common_vendor.index.switchTab({ url: "/pages/messages/index" });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(goBack, "fe"),
        b: common_vendor.s(capsuleNavRowStyle.value),
        c: common_vendor.s(capsuleNavOuterStyle.value),
        d: common_vendor.unref(userStore).profile.avatar,
        e: common_vendor.t(common_vendor.unref(userStore).profile.nickname),
        f: common_vendor.t(common_vendor.unref(userStore).profile.age != null ? common_vendor.unref(userStore).profile.age + "岁" : "年龄保密"),
        g: common_vendor.t(common_vendor.unref(userStore).profile.mbti),
        h: common_vendor.t(metaZodiacEmoji.value),
        i: common_vendor.t(metaZodiac.value),
        j: common_vendor.t(metaSignSymbol.value),
        k: common_vendor.t(metaZodiacSign.value),
        l: common_vendor.t(metaRiyuanEmoji.value),
        m: common_vendor.t(metaRiyuan.value),
        n: common_vendor.t(common_vendor.unref(userStore).profile.location || "北京"),
        o: common_vendor.t(common_vendor.unref(userStore).profile.education || "本科"),
        p: common_vendor.t(common_vendor.unref(userStore).profile.occupation || "产品经理"),
        q: common_vendor.t(common_vendor.unref(userStore).profile.income || "20万-30万"),
        r: common_vendor.t(common_vendor.unref(userStore).profile.bio || "喜欢旅行、摄影和烘焙，期待遇见有趣的你～"),
        s: (_a = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _a.length
      }, ((_b = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _b.length) ? {
        t: common_vendor.f(common_vendor.unref(userStore).profile.hobbies, (hobby, k0, i0) => {
          return {
            a: common_vendor.t(hobby),
            b: hobby
          };
        })
      } : {}, {
        v: common_vendor.unref(userStore).profile.isRealName
      }, common_vendor.unref(userStore).profile.isRealName ? {} : {}, {
        w: common_vendor.o(goBack, "81"),
        x: common_vendor.o(goToMessages, "6f")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-985ac3ab"]]);
wx.createPage(MiniProgramPage);
