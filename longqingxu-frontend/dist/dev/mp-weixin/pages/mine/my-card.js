"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_date = require("../../utils/date.js");
const utils_navigation = require("../../utils/navigation.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my-card",
  setup(__props) {
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
        a: common_vendor.o(goBack, "26"),
        b: common_vendor.unref(userStore).profile.avatar,
        c: common_vendor.t(common_vendor.unref(userStore).profile.nickname),
        d: common_vendor.t(common_vendor.unref(userStore).profile.age != null ? common_vendor.unref(userStore).profile.age + "岁" : "年龄保密"),
        e: common_vendor.t(common_vendor.unref(userStore).profile.mbti),
        f: common_vendor.t(metaZodiacEmoji.value),
        g: common_vendor.t(metaZodiac.value),
        h: common_vendor.t(metaSignSymbol.value),
        i: common_vendor.t(metaZodiacSign.value),
        j: common_vendor.t(metaRiyuanEmoji.value),
        k: common_vendor.t(metaRiyuan.value),
        l: common_vendor.t(common_vendor.unref(userStore).profile.location || "北京"),
        m: common_vendor.t(common_vendor.unref(userStore).profile.education || "本科"),
        n: common_vendor.t(common_vendor.unref(userStore).profile.occupation || "产品经理"),
        o: common_vendor.t(common_vendor.unref(userStore).profile.income || "20万-30万"),
        p: common_vendor.t(common_vendor.unref(userStore).profile.bio || "喜欢旅行、摄影和烘焙，期待遇见有趣的你～"),
        q: (_a = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _a.length
      }, ((_b = common_vendor.unref(userStore).profile.hobbies) == null ? void 0 : _b.length) ? {
        r: common_vendor.f(common_vendor.unref(userStore).profile.hobbies, (hobby, k0, i0) => {
          return {
            a: common_vendor.t(hobby),
            b: hobby
          };
        })
      } : {}, {
        s: common_vendor.unref(userStore).profile.isRealName
      }, common_vendor.unref(userStore).profile.isRealName ? {} : {}, {
        t: common_vendor.o(goBack, "93"),
        v: common_vendor.o(goToMessages, "7b")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-985ac3ab"]]);
wx.createPage(MiniProgramPage);
