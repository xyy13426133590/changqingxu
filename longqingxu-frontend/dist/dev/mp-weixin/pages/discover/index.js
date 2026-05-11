"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_discover = require("../../stores/discover.js");
const stores_user = require("../../stores/user.js");
const stores_messages = require("../../stores/messages.js");
const utils_tabbar = require("../../utils/tabbar.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  _component_transition();
}
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const headerAvatarFallback = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";
const CARD_AVATAR_PLACEHOLDER = "/static/avatars/placeholder.png";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const discoverStore = stores_discover.useDiscoverStore();
    const userStore = stores_user.useUserStore();
    const messagesStore = stores_messages.useMessagesStore();
    const cardAvatarSrc = common_vendor.ref("");
    const currentUser = common_vendor.computed(() => discoverStore.currentUser);
    common_vendor.watch(
      currentUser,
      (u) => {
        cardAvatarSrc.value = (u == null ? void 0 : u.avatar) || CARD_AVATAR_PLACEHOLDER;
      },
      { immediate: true }
    );
    function onCardAvatarError() {
      if (!cardAvatarSrc.value.includes("placeholder")) {
        cardAvatarSrc.value = CARD_AVATAR_PLACEHOLDER;
      }
    }
    const dailyUsers = common_vendor.computed(() => discoverStore.dailyRecommendations);
    const cardTransitionName = common_vendor.ref("cx-heart");
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
      cardTransitionName.value = "cx-heart";
      discoverStore.likeUser(currentUser.value.id);
    }
    function commitPass() {
      if (!currentUser.value)
        return;
      cardTransitionName.value = "cx-pass";
      discoverStore.dislikeUser(currentUser.value.id);
    }
    function handleGreeting() {
      if (currentUser.value) {
        const convId = messagesStore.createConversation(
          currentUser.value.id,
          currentUser.value.nickname,
          currentUser.value.avatar
        );
        common_vendor.index.navigateTo({ url: `/pages/messages/chat?conversationId=${convId}` });
      }
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
    common_vendor.onShow(() => {
      hideNativeTabBar();
      common_vendor.nextTick$1(hideNativeTabBar);
    });
    common_vendor.onMounted(() => {
      hideNativeTabBar();
      discoverStore.generateDailyRecommendations();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(userStore).profile.avatar || headerAvatarFallback,
        b: common_vendor.o(navigateToFilter, "d8"),
        c: common_vendor.unref(messagesStore).totalUnread > 0
      }, common_vendor.unref(messagesStore).totalUnread > 0 ? {
        d: common_vendor.t(common_vendor.unref(messagesStore).totalUnread > 99 ? "99+" : common_vendor.unref(messagesStore).totalUnread)
      } : {}, {
        e: common_vendor.o(navigateToMessages, "ae"),
        f: common_vendor.f(dailyUsers.value, (user, k0, i0) => {
          return {
            a: user.avatar,
            b: common_vendor.t(user.nickname),
            c: user.id,
            d: common_vendor.o(($event) => navigateToUserDetail(user.id), user.id)
          };
        }),
        g: currentUser.value
      }, currentUser.value ? common_vendor.e({
        h: currentUser.value
      }, currentUser.value ? common_vendor.e({
        i: cardAvatarSrc.value,
        j: common_vendor.o(onCardAvatarError, "b7"),
        k: likeOverlayOpacity.value,
        l: passOverlayOpacity.value,
        m: currentUser.value.isRealName
      }, currentUser.value.isRealName ? {} : {}, {
        n: currentUser.value.isVip
      }, currentUser.value.isVip ? {} : {}, {
        o: common_vendor.o(($event) => openReportFlow("home"), "c4"),
        p: common_vendor.t(currentUser.value.nickname),
        q: common_vendor.t(currentUser.value.gender === "female" ? "♀" : "♂"),
        r: common_vendor.n(currentUser.value.gender),
        s: common_vendor.t(currentUser.value.matchReason),
        t: common_vendor.t(currentUser.value.matchTagline),
        v: common_vendor.t(currentUser.value.matchScore),
        w: common_vendor.t(currentUser.value.age),
        x: common_vendor.t(currentUser.value.location),
        y: common_vendor.t(currentUser.value.height),
        z: common_vendor.t(getZodiacEmoji(currentUser.value.zodiac)),
        A: common_vendor.t(currentUser.value.zodiac),
        B: common_vendor.t(getZodiacSignEmoji(currentUser.value.zodiacSign)),
        C: common_vendor.t(currentUser.value.zodiacSign),
        D: common_vendor.t(getRiyuanEmoji(currentUser.value.riyuan)),
        E: common_vendor.t(currentUser.value.riyuan),
        F: common_vendor.t(currentUser.value.mbti),
        G: common_vendor.t(currentUser.value.education),
        H: common_vendor.t(currentUser.value.occupation),
        I: common_vendor.t(currentUser.value.income),
        J: common_vendor.t(currentUser.value.bio),
        K: common_vendor.t(currentUser.value.matchReason),
        L: currentUser.value.id
      }) : {}, {
        M: common_vendor.p({
          name: cardTransitionName.value,
          mode: "out-in",
          appear: false
        }),
        N: common_vendor.s(cardStyle.value),
        O: common_vendor.o(handleTouchStart, "c9"),
        P: common_vendor.o(handleTouchMove, "ac"),
        Q: common_vendor.o(handleTouchEnd, "a9"),
        R: common_vendor.o(handleCardTap, "4f")
      }) : {}, {
        S: common_vendor.o(commitPass, "cd"),
        T: common_vendor.o(handleGreeting, "d3"),
        U: common_vendor.o(commitLike, "5c"),
        V: common_vendor.p({
          active: "discover"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-20534a7c"]]);
wx.createPage(MiniProgramPage);
