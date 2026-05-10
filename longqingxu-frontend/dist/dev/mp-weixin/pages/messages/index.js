"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_messages = require("../../stores/messages.js");
const utils_tabbar = require("../../utils/tabbar.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    common_vendor.onShow(() => {
      utils_tabbar.safeHideNativeTabBar();
    });
    const messagesStore = stores_messages.useMessagesStore();
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
      common_vendor.index.switchTab({ url: "/pages/discover/index" });
    }
    function enterChat(conv) {
      messagesStore.setCurrentConversation(conv.id);
      common_vendor.index.navigateTo({
        url: `/pages/messages/chat?conversationId=${conv.id}`
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "b3"),
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
