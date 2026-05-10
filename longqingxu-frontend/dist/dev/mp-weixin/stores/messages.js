"use strict";
const common_vendor = require("../common/vendor.js");
const utils_avatar = require("../utils/avatar.js");
function seedConversationTimes() {
  const t1 = /* @__PURE__ */ new Date();
  t1.setHours(10, 21, 0, 0);
  const t2 = /* @__PURE__ */ new Date();
  t2.setDate(t2.getDate() - 1);
  t2.setHours(18, 30, 0, 0);
  return { t1: t1.toISOString(), t2: t2.toISOString() };
}
const { t1: seedT1, t2: seedT2 } = seedConversationTimes();
const useMessagesStore = common_vendor.defineStore("messages", () => {
  const conversations = common_vendor.ref([
    {
      id: "c1",
      userId: "u1",
      nickname: "林溪",
      avatar: utils_avatar.avatarUrl(),
      lastMessage: "周末要不要一起看展？",
      lastMessageTime: seedT1,
      unreadCount: 1,
      isTop: false
    },
    {
      id: "c2",
      userId: "u2",
      nickname: "苏晴",
      avatar: utils_avatar.avatarUrl(),
      lastMessage: "好的，回见",
      lastMessageTime: seedT2,
      unreadCount: 0,
      isTop: false
    }
  ]);
  const messages = common_vendor.ref({
    c1: [
      {
        id: "m1",
        conversationId: "c1",
        senderId: "u1",
        content: "你好呀，看了你的资料很投缘～",
        type: "text",
        status: "read",
        createdAt: "2024-01-15 10:15:00"
      },
      {
        id: "m2",
        conversationId: "c1",
        senderId: "me",
        content: "谢谢，我也觉得～",
        type: "text",
        status: "read",
        createdAt: "2024-01-15 10:18:00"
      },
      {
        id: "m3",
        conversationId: "c1",
        senderId: "u1",
        content: "周末要不要一起看展？",
        type: "text",
        status: "sent",
        createdAt: "2024-01-15 10:21:00"
      }
    ]
  });
  const currentConversationId = common_vendor.ref("");
  const currentConversation = common_vendor.computed(() => {
    return conversations.value.find((c) => c.id === currentConversationId.value);
  });
  const currentMessages = common_vendor.computed(() => {
    return messages.value[currentConversationId.value] || [];
  });
  const totalUnread = common_vendor.computed(() => {
    return conversations.value.reduce((sum, c) => sum + c.unreadCount, 0);
  });
  function setCurrentConversation(id) {
    currentConversationId.value = id;
    const conv = conversations.value.find((c) => c.id === id);
    if (conv) {
      conv.unreadCount = 0;
    }
  }
  function sendMessage(content, type = "text", extra) {
    if (!currentConversationId.value)
      return;
    const newMessage = {
      id: `m${Date.now()}`,
      conversationId: currentConversationId.value,
      senderId: "me",
      content,
      type,
      status: "sending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      duration: extra == null ? void 0 : extra.duration
    };
    if (!messages.value[currentConversationId.value]) {
      messages.value[currentConversationId.value] = [];
    }
    messages.value[currentConversationId.value].push(newMessage);
    const conv = conversations.value.find((c) => c.id === currentConversationId.value);
    if (conv) {
      conv.lastMessage = getMessageSummary(type, content);
      conv.lastMessageTime = (/* @__PURE__ */ new Date()).toISOString();
    }
    setTimeout(() => {
      newMessage.status = "sent";
    }, 500);
  }
  function getMessageSummary(type, content) {
    switch (type) {
      case "image":
        return "[图片]";
      case "voice":
        return "[语音]";
      case "emoji":
        return "[表情]";
      default:
        return content.slice(0, 50);
    }
  }
  function receiveMessage(conversationId, message) {
    if (!messages.value[conversationId]) {
      messages.value[conversationId] = [];
    }
    messages.value[conversationId].push(message);
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = getMessageSummary(message.type, message.content);
      conv.lastMessageTime = message.createdAt || (/* @__PURE__ */ new Date()).toISOString();
      if (conversationId !== currentConversationId.value) {
        conv.unreadCount++;
      }
    }
  }
  function createConversation(userId, nickname, avatar) {
    const existing = conversations.value.find((c) => c.userId === userId);
    if (existing) {
      return existing.id;
    }
    const newConv = {
      id: `c${Date.now()}`,
      userId,
      nickname,
      avatar,
      lastMessage: "",
      lastMessageTime: "",
      unreadCount: 0,
      isTop: false
    };
    conversations.value.unshift(newConv);
    return newConv.id;
  }
  function deleteConversation(id) {
    const index = conversations.value.findIndex((c) => c.id === id);
    if (index > -1) {
      conversations.value.splice(index, 1);
      delete messages.value[id];
      if (currentConversationId.value === id) {
        currentConversationId.value = "";
      }
    }
  }
  function topConversation(id) {
    const conv = conversations.value.find((c) => c.id === id);
    if (conv) {
      conv.isTop = !conv.isTop;
      conversations.value.sort((a, b) => {
        if (a.isTop && !b.isTop)
          return -1;
        if (!a.isTop && b.isTop)
          return 1;
        return 0;
      });
    }
  }
  function clearMessages(conversationId) {
    messages.value[conversationId] = [];
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = "";
      conv.lastMessageTime = "";
    }
  }
  function lastMessageTimestamp(timeStr) {
    if (!timeStr)
      return 0;
    if (timeStr === "刚刚")
      return Date.now();
    if (timeStr === "昨天") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(12, 0, 0, 0);
      return d.getTime();
    }
    const hm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (hm) {
      const d = /* @__PURE__ */ new Date();
      d.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0);
      return d.getTime();
    }
    const t = new Date(timeStr).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  function pad2(n) {
    return n.toString().padStart(2, "0");
  }
  function formatTime(timeStr) {
    if (!timeStr)
      return "";
    if (timeStr === "刚刚")
      return "刚刚";
    let msgDate = new Date(timeStr);
    if (!Number.isFinite(msgDate.getTime())) {
      const hm = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (hm) {
        msgDate = /* @__PURE__ */ new Date();
        msgDate.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0);
      } else if (timeStr === "昨天") {
        return "昨天";
      } else {
        return timeStr;
      }
    }
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - msgDate.getTime();
    if (diffMs >= 0 && diffMs < 6e4)
      return "刚刚";
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDayStart = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
    const diffDays = Math.floor((todayStart.getTime() - msgDayStart.getTime()) / 864e5);
    if (diffDays === 0) {
      return `${pad2(msgDate.getHours())}:${pad2(msgDate.getMinutes())}`;
    }
    if (diffDays === 1) {
      return "昨天";
    }
    if (msgDate.getFullYear() === now.getFullYear()) {
      return `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`;
    }
    return `${msgDate.getFullYear()}/${pad2(msgDate.getMonth() + 1)}/${pad2(msgDate.getDate())}`;
  }
  return {
    conversations,
    messages,
    currentConversationId,
    currentConversation,
    currentMessages,
    totalUnread,
    setCurrentConversation,
    sendMessage,
    receiveMessage,
    createConversation,
    deleteConversation,
    topConversation,
    clearMessages,
    formatTime,
    lastMessageTimestamp
  };
}, {
  persist: {
    key: "messages-store",
    paths: ["conversations", "messages"]
  }
});
exports.useMessagesStore = useMessagesStore;
