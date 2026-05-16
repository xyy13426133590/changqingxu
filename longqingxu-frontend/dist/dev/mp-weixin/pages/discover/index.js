"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_discover = require("../../stores/discover.js");
const stores_user = require("../../stores/user.js");
const stores_messages = require("../../stores/messages.js");
const services_api = require("../../services/api.js");
const utils_devApi = require("../../utils/dev-api.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_tabbar = require("../../utils/tabbar.js");
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
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const discoverStore = stores_discover.useDiscoverStore();
    const userStore = stores_user.useUserStore();
    const messagesStore = stores_messages.useMessagesStore();
    const headerAvatarSrc = common_vendor.computed(
      () => utils_avatar.resolveAvatar(userStore.profile.avatar, userStore.profile.id)
    );
    const cardAvatarSrc = common_vendor.ref(utils_avatar.DEMO_AVATARS[0]);
    const currentUser = common_vendor.computed(() => discoverStore.currentUser);
    common_vendor.watch(
      currentUser,
      (u) => {
        cardAvatarSrc.value = (u == null ? void 0 : u.avatar) || utils_avatar.resolveAvatar("", u == null ? void 0 : u.id);
      },
      { immediate: true }
    );
    function onCardAvatarError() {
      const u = currentUser.value;
      cardAvatarSrc.value = utils_avatar.resolveAvatar("", u == null ? void 0 : u.id);
    }
    const dailyUsers = common_vendor.computed(() => discoverStore.dailyRecommendations);
    const pageLoading = common_vendor.ref(false);
    const dailyEmptyHint = common_vendor.computed(() => {
      if (!services_api.getToken())
        return "登录后查看每日推荐";
      if (discoverStore.loadError)
        return "加载失败，请点重新加载";
      return "暂无推荐，可点下方重新浏览";
    });
    const emptyHint = common_vendor.computed(() => {
      if (utils_devApi.isMpWeixinLocalhostApi()) {
        return utils_devApi.mpWeixinApiHint();
      }
      if (!userStore.isLogin && !services_api.getToken()) {
        return "登录后可查看推荐用户；本地可先执行后端 seed:dev 写入演示账号。";
      }
      if (discoverStore.loadError) {
        return discoverStore.loadError;
      }
      if (discoverStore.recommendationsRecycled) {
        return "本地演示账号较少，你已滑完一轮；系统已重新展示推荐。继续滑卡会再次看完，可点「重新浏览」清空记录。";
      }
      if (userStore.isLogin) {
        return "已看完当前推荐，或筛选过严。可点「重新浏览」清空滑卡记录，或放宽筛选条件。";
      }
      return "库里暂无其他用户。请先登录，或运行 pnpm run seed:dev 写入演示数据。";
    });
    function reloadDiscover() {
      return __async(this, null, function* () {
        if (utils_devApi.isMpWeixinLocalhostApi()) {
          common_vendor.index.showModal({
            title: "接口地址",
            content: utils_devApi.mpWeixinApiHint(),
            showCancel: false
          });
          return;
        }
        yield loadDiscoverIfAuthed();
        if (hasAuthSession() && !discoverStore.currentUser) {
          common_vendor.index.showToast({ title: "仍无推荐，请检查后端与数据库", icon: "none" });
        }
      });
    }
    function resetDiscoverSwipes() {
      return __async(this, null, function* () {
        if (!services_api.getToken()) {
          goLogin();
          return;
        }
        pageLoading.value = true;
        try {
          const ok = yield discoverStore.resetAndReloadDiscover();
          if (ok) {
            common_vendor.index.showToast({ title: "已恢复推荐", icon: "success" });
          } else {
            common_vendor.index.showToast({ title: "仍无推荐，请检查后端或 seed 数据", icon: "none" });
          }
        } finally {
          pageLoading.value = false;
        }
      });
    }
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/auth/login" });
    }
    const touchStartX = common_vendor.ref(0);
    const touchStartY = common_vendor.ref(0);
    const touchEndX = common_vendor.ref(0);
    const touchEndY = common_vendor.ref(0);
    const translateX = common_vendor.ref(0);
    const translateY = common_vendor.ref(0);
    const rotate = common_vendor.ref(0);
    const isAnimating = common_vendor.ref(false);
    const likeOverlayOpacity = common_vendor.computed(
      () => Math.min(1, Math.max(0, translateX.value / 110))
    );
    const passOverlayOpacity = common_vendor.computed(
      () => Math.min(1, Math.max(0, -translateX.value / 110))
    );
    const cardStyle = common_vendor.computed(() => {
      const absX = Math.abs(translateX.value);
      const scale = 1 + Math.min(absX / 2200, 0.035);
      const transition = isAnimating.value ? "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease" : "none";
      return {
        transform: `translateX(${translateX.value}px) translateY(${translateY.value}px) rotate(${rotate.value}deg) scale(${scale})`,
        transition,
        willChange: isAnimating.value || absX > 8 ? "transform" : "auto"
      };
    });
    function getZodiacEmoji(zodiac) {
      const map = {
        "鼠": "🐭",
        "牛": "🐮",
        "虎": "🐯",
        "兔": "🐰",
        "龙": "🐲",
        "蛇": "🐍",
        "马": "🐴",
        "羊": "🐑",
        "猴": "🐵",
        "鸡": "🐔",
        "狗": "🐶",
        "猪": "🐷"
      };
      return map[zodiac] || "🐰";
    }
    function getZodiacSignEmoji(sign) {
      const map = {
        白羊座: "♈",
        金牛座: "♉",
        双子座: "♊",
        巨蟹座: "♋",
        狮子座: "♌",
        处女座: "♍",
        天秤座: "♎",
        天蝎座: "♏",
        射手座: "♐",
        摩羯座: "♑",
        水瓶座: "♒",
        双鱼座: "♓"
      };
      return map[sign] || "⭐";
    }
    function getRiyuanEmoji(riyuan) {
      if (/甲|乙/.test(riyuan))
        return "🌲";
      if (/丙|丁/.test(riyuan))
        return "🔥";
      if (/戊|己/.test(riyuan))
        return "⛰️";
      if (/庚|辛/.test(riyuan))
        return "⚙️";
      return "💧";
    }
    function handleTouchStart(e) {
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
      isAnimating.value = false;
    }
    function handleTouchMove(e) {
      const deltaX = e.touches[0].clientX - touchStartX.value;
      const deltaY = e.touches[0].clientY - touchStartY.value;
      translateX.value = deltaX;
      translateY.value = deltaY;
      rotate.value = deltaX * 0.05;
      touchEndX.value = e.touches[0].clientX;
      touchEndY.value = e.touches[0].clientY;
    }
    function handleTouchEnd(e) {
      touchEndX.value = e.changedTouches[0].clientX;
      touchEndY.value = e.changedTouches[0].clientY;
      const threshold = 110;
      isAnimating.value = true;
      if (translateX.value > threshold) {
        translateX.value = 520;
        rotate.value = 28;
        setTimeout(() => {
          commitLike();
          resetCard();
        }, 360);
      } else if (translateX.value < -threshold) {
        translateX.value = -520;
        rotate.value = -28;
        setTimeout(() => {
          commitPass();
          resetCard();
        }, 360);
      } else {
        translateX.value = 0;
        translateY.value = 0;
        rotate.value = 0;
        setTimeout(() => {
          isAnimating.value = false;
        }, 380);
      }
    }
    function handleCardTap() {
      const moveX = Math.abs(touchEndX.value - touchStartX.value);
      const moveY = Math.abs(touchEndY.value - touchStartY.value);
      const TAP_THRESHOLD = 10;
      if (moveX < TAP_THRESHOLD && moveY < TAP_THRESHOLD && currentUser.value) {
        navigateToUserDetail(currentUser.value.id);
      }
    }
    function resetCard() {
      translateX.value = 0;
      translateY.value = 0;
      rotate.value = 0;
      touchStartX.value = 0;
      touchStartY.value = 0;
      touchEndX.value = 0;
      touchEndY.value = 0;
      setTimeout(() => {
        isAnimating.value = false;
      }, 40);
    }
    function commitLike() {
      if (!currentUser.value)
        return;
      discoverStore.likeUser(currentUser.value.id);
    }
    function commitPass() {
      if (!currentUser.value)
        return;
      discoverStore.dislikeUser(currentUser.value.id);
    }
    function handleGreeting() {
      return __async(this, null, function* () {
        const peer = currentUser.value;
        if (!(peer == null ? void 0 : peer.id)) {
          common_vendor.index.showToast({ title: "用户信息异常，请刷新推荐", icon: "none" });
          return;
        }
        if (!userStore.isLogin) {
          common_vendor.index.navigateTo({ url: "/pages/auth/welcome" });
          return;
        }
        common_vendor.index.showLoading({ mask: true, title: "准备聊天…" });
        try {
          const convId = yield messagesStore.createConversation(
            peer.id,
            peer.nickname,
            peer.avatar
          );
          if (!convId) {
            common_vendor.index.showToast({ title: "创建会话失败", icon: "none" });
            return;
          }
          yield messagesStore.setCurrentConversation(convId);
          yield messagesStore.loadMessages(convId);
          common_vendor.index.navigateTo({ url: `/pages/messages/chat?conversationId=${convId}` });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "创建会话失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    }
    function navigateToFilter() {
      common_vendor.index.switchTab({ url: "/pages/filter/index" });
    }
    function navigateToMessages() {
      common_vendor.index.switchTab({ url: "/pages/messages/index" });
    }
    function navigateToUserDetail(userId) {
      common_vendor.index.navigateTo({ url: `/pages/user/detail?id=${userId}` });
    }
    function openReportFlow(source) {
      console.log("Report from:", source);
    }
    function hideNativeTabBar() {
      utils_tabbar.safeHideNativeTabBar();
    }
    function hasAuthSession() {
      return !!(services_api.getToken() || userStore.token || userStore.isLogin);
    }
    function loadDiscoverIfAuthed() {
      return __async(this, null, function* () {
        if (!hasAuthSession()) {
          discoverStore.clearDiscoverData();
          return;
        }
        pageLoading.value = true;
        try {
          discoverStore.repairFiltersState();
          yield discoverStore.loadDiscoverPage();
          if (!discoverStore.currentUser && discoverStore.users.length === 0) {
            yield discoverStore.resetAndReloadDiscover();
          }
          void userStore.hydrateProfile();
        } finally {
          pageLoading.value = false;
        }
      });
    }
    common_vendor.watch(
      () => userStore.isLogin,
      (loggedIn) => {
        if (loggedIn && hasAuthSession()) {
          void loadDiscoverIfAuthed();
        }
      }
    );
    common_vendor.onShow(() => __async(this, null, function* () {
      hideNativeTabBar();
      common_vendor.nextTick$1(hideNativeTabBar);
      if (utils_devApi.isMpWeixinLocalhostApi()) {
        common_vendor.index.showToast({ title: "请配置局域网 API 地址", icon: "none", duration: 3e3 });
      }
      yield loadDiscoverIfAuthed();
    }));
    common_vendor.onMounted(() => {
      hideNativeTabBar();
      void loadDiscoverIfAuthed();
    });
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: headerAvatarSrc.value,
        b: common_vendor.o(navigateToFilter, "1b"),
        c: common_vendor.unref(messagesStore).totalUnread > 0
      }, common_vendor.unref(messagesStore).totalUnread > 0 ? {
        d: common_vendor.t(common_vendor.unref(messagesStore).totalUnread > 99 ? "99+" : common_vendor.unref(messagesStore).totalUnread)
      } : {}, {
        e: common_vendor.o(navigateToMessages, "66"),
        f: common_vendor.f(dailyUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.nickname),
            c: user.id,
            d: common_vendor.o(($event) => navigateToUserDetail(user.id), user.id)
          };
        }),
        g: !pageLoading.value && dailyUsers.value.length === 0
      }, !pageLoading.value && dailyUsers.value.length === 0 ? {
        h: common_vendor.t(dailyEmptyHint.value)
      } : {}, {
        i: pageLoading.value
      }, pageLoading.value ? {} : !currentUser.value ? common_vendor.e({
        k: common_vendor.t(emptyHint.value),
        l: common_vendor.unref(userStore).isLogin
      }, common_vendor.unref(userStore).isLogin ? {
        m: common_vendor.o(resetDiscoverSwipes, "54")
      } : {}, {
        n: !common_vendor.unref(userStore).isLogin ? 1 : "",
        o: common_vendor.o(reloadDiscover, "6e"),
        p: !common_vendor.unref(userStore).isLogin
      }, !common_vendor.unref(userStore).isLogin ? {
        q: common_vendor.o(goLogin, "a1")
      } : {
        r: common_vendor.o(navigateToFilter, "f6")
      }) : common_vendor.e({
        s: currentUser.value
      }, currentUser.value ? common_vendor.e({
        t: cardAvatarSrc.value,
        v: common_vendor.o(onCardAvatarError, "ae"),
        w: likeOverlayOpacity.value,
        x: passOverlayOpacity.value,
        y: currentUser.value.isRealName
      }, currentUser.value.isRealName ? {} : {}, {
        z: currentUser.value.isVip
      }, currentUser.value.isVip ? {} : {}, {
        A: common_vendor.o(($event) => openReportFlow("home"), "35"),
        B: common_vendor.t(currentUser.value.nickname),
        C: common_vendor.t(currentUser.value.gender === "female" ? "♀" : "♂"),
        D: common_vendor.n(currentUser.value.gender),
        E: common_vendor.t(currentUser.value.matchReason),
        F: common_vendor.t(currentUser.value.matchTagline),
        G: common_vendor.t(currentUser.value.matchScore),
        H: common_vendor.t(currentUser.value.age),
        I: common_vendor.t(currentUser.value.location),
        J: common_vendor.t((_a = currentUser.value.height) != null ? _a : "—"),
        K: currentUser.value.zodiac
      }, currentUser.value.zodiac ? {
        L: common_vendor.t(getZodiacEmoji(currentUser.value.zodiac)),
        M: common_vendor.t(currentUser.value.zodiac)
      } : {}, {
        N: currentUser.value.zodiacSign
      }, currentUser.value.zodiacSign ? {
        O: common_vendor.t(getZodiacSignEmoji(currentUser.value.zodiacSign)),
        P: common_vendor.t(currentUser.value.zodiacSign)
      } : {}, {
        Q: currentUser.value.riyuan
      }, currentUser.value.riyuan ? {
        R: common_vendor.t(getRiyuanEmoji(currentUser.value.riyuan)),
        S: common_vendor.t(currentUser.value.riyuan)
      } : {}, {
        T: currentUser.value.mbti
      }, currentUser.value.mbti ? {
        U: common_vendor.t(currentUser.value.mbti)
      } : {}, {
        V: currentUser.value.education
      }, currentUser.value.education ? {
        W: common_vendor.t(currentUser.value.education)
      } : {}, {
        X: currentUser.value.occupation
      }, currentUser.value.occupation ? {
        Y: common_vendor.t(currentUser.value.occupation)
      } : {}, {
        Z: currentUser.value.income
      }, currentUser.value.income ? {
        aa: common_vendor.t(currentUser.value.income)
      } : {}, {
        ab: common_vendor.t(currentUser.value.bio),
        ac: common_vendor.t(currentUser.value.matchReason),
        ad: currentUser.value.id
      }) : {}, {
        ae: common_vendor.s(cardStyle.value),
        af: common_vendor.o(handleTouchStart, "4e"),
        ag: common_vendor.o(handleTouchMove, "9a"),
        ah: common_vendor.o(handleTouchEnd, "8f"),
        ai: common_vendor.o(handleCardTap, "33")
      }), {
        j: !currentUser.value,
        aj: currentUser.value && !pageLoading.value
      }, currentUser.value && !pageLoading.value ? {} : {}, {
        ak: currentUser.value && !pageLoading.value
      }, currentUser.value && !pageLoading.value ? {
        al: common_vendor.o(commitPass, "a5"),
        am: common_vendor.o(handleGreeting, "16"),
        an: common_vendor.o(commitLike, "a3")
      } : {}, {
        ao: common_vendor.p({
          active: "discover"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-20534a7c"]]);
wx.createPage(MiniProgramPage);
