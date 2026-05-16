"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_messages = require("../../stores/messages.js");
const stores_user = require("../../stores/user.js");
const utils_navigation = require("../../utils/navigation.js");
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
    const messagesStore = stores_messages.useMessagesStore();
    common_vendor.onShow(() => __async(this, null, function* () {
      utils_tabbar.safeHideNativeTabBar();
      const userStore = stores_user.useUserStore();
      if (userStore.isLogin) {
        yield messagesStore.fetchConversations();
      }
    }));
    const sortedConversations = common_vendor.computed(() => {
      return [...messagesStore.conversations].sort((a, b) => {
        if (a.isTop && !b.isTop)
          return -1;
        if (!a.isTop && b.isTop)
          return 1;
        return messagesStore.lastMessageTimestamp(b.lastMessageTime) - messagesStore.lastMessageTimestamp(a.lastMessageTime);
      });
    });
    function formatTime(timeStr) {
      return messagesStore.formatTime(timeStr);
    }
    function goBack() {
      utils_navigation.navigateBackTo("/pages/discover/index");
    }
    function enterChat(conv) {
      return __async(this, null, function* () {
        yield messagesStore.setCurrentConversation(conv.id);
        yield messagesStore.loadMessages(conv.id);
        common_vendor.index.navigateTo({
          url: `/pages/messages/chat?conversationId=${conv.id}`
        });
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "ba"),
        b: sortedConversations.value.length === 0
      }, sortedConversations.value.length === 0 ? {} : {}, {
        c: common_vendor.f(sortedConversations.value, (conv, k0, i0) => {
          return common_vendor.e({
            a: conv.avatar,
            b: conv.unreadCount > 0
          }, conv.unreadCount > 0 ? {
            c: common_vendor.t(conv.unreadCount > 99 ? "99+" : conv.unreadCount)
          } : {}, {
            d: common_vendor.t(conv.nickname),
            e: common_vendor.t(formatTime(conv.lastMessageTime)),
            f: common_vendor.t(conv.lastMessage || "暂无消息"),
            g: conv.id,
            h: conv.isTop ? 1 : "",
            i: common_vendor.o(($event) => enterChat(conv), conv.id)
          });
        }),
        d: common_vendor.p({
          active: "messages"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b246703a"]]);
wx.createPage(MiniProgramPage);
