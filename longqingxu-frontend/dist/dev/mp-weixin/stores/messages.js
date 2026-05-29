"use strict";
const common_vendor = require("../common/vendor.js");
const services_apiConversation = require("../services/api-conversation.js");
const utils_avatar = require("../utils/avatar.js");
const services_apiUpload = require("../services/api-upload.js");
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
function summarizeLast(type, content) {
  switch (type) {
    case "image":
      return "[图片]";
    case "voice":
      return "[语音]";
    case "emoji":
      return "[表情]";
    default:
      return (content || "").slice(0, 50);
  }
}
function mapApiConversation(row) {
  var _a, _b, _c, _d, _e, _f, _g;
  const last = row.lastMessage;
  const lastContent = last ? summarizeLast(last.type, last.content) : "";
  const lastTime = (last == null ? void 0 : last.createdAt) ? typeof last.createdAt === "string" ? last.createdAt : new Date(last.createdAt).toISOString() : row.updatedAt != null ? typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString() : "";
  return {
    id: row.id,
    userId: (_b = (_a = row.targetUser) == null ? void 0 : _a.id) != null ? _b : row.targetUserId,
    nickname: ((_c = row.targetUser) == null ? void 0 : _c.nickname) || "",
    avatar: utils_avatar.resolveAvatar((_d = row.targetUser) == null ? void 0 : _d.avatar, (_e = row.targetUser) == null ? void 0 : _e.id),
    lastMessage: lastContent,
    lastMessageTime: lastTime,
    unreadCount: (_f = row.unreadCount) != null ? _f : 0,
    isTop: (_g = row.isPinned) != null ? _g : false
  };
}
function mapApiMessage(m) {
  const t = m.type === "text" || m.type === "image" || m.type === "voice" || m.type === "emoji" ? m.type : "text";
  let content = m.content;
  if (t === "voice") {
    if (m.mediaUrl) {
      content = JSON.stringify({ url: m.mediaUrl, duration: (m.mediaDuration || 1) * 1e3 });
    }
  } else if (t === "image" && m.mediaUrl) {
    content = m.mediaUrl;
  }
  const createdAt = typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString();
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content,
    type: t,
    status: m.isRead ? "read" : "sent",
    createdAt,
    duration: m.mediaDuration != null ? m.mediaDuration * 1e3 : void 0
  };
}
function mapSocketPayload(p) {
  return mapApiMessage({
    id: p.id,
    conversationId: p.conversationId,
    senderId: p.senderId,
    receiverId: p.receiverId,
    type: p.type || "text",
    content: p.content,
    mediaUrl: p.mediaUrl,
    mediaDuration: p.mediaDuration,
    isRead: p.isRead,
    createdAt: p.createdAt
  });
}
const useMessagesStore = common_vendor.defineStore("messages", () => {
  const conversations = common_vendor.ref([]);
  const messages = common_vendor.ref({});
  const currentConversationId = common_vendor.ref("");
  const currentConversation = common_vendor.computed(
    () => conversations.value.find((c) => c.id === currentConversationId.value)
  );
  const currentMessages = common_vendor.computed(() => messages.value[currentConversationId.value] || []);
  const totalUnread = common_vendor.computed(
    () => conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  );
  function fetchConversations() {
    return __async(this, null, function* () {
      try {
        const rows = yield services_apiConversation.apiGetConversations();
        conversations.value = rows.map(mapApiConversation);
        const ids = new Set(rows.map((r) => r.id));
        const next = {};
        Object.keys(messages.value).forEach((k) => {
          if (ids.has(k))
            next[k] = messages.value[k];
        });
        messages.value = next;
      } catch (e) {
        conversations.value = [];
      }
    });
  }
  function loadMessages(conversationId) {
    return __async(this, null, function* () {
      try {
        const { messages: rows } = yield services_apiConversation.apiGetMessages(conversationId, 1, 100);
        const mapped = rows.map(mapApiMessage).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        messages.value = __spreadProps(__spreadValues({}, messages.value), { [conversationId]: mapped });
      } catch (e) {
        messages.value = __spreadProps(__spreadValues({}, messages.value), { [conversationId]: [] });
      }
    });
  }
  function applyIncomingMessage(raw) {
    const m = "receiverId" in raw && typeof raw.receiverId === "string" ? mapSocketPayload(raw) : mapApiMessage(raw);
    const convId = m.conversationId;
    const list = messages.value[convId] || [];
    if (list.some((x) => x.id === m.id))
      return;
    messages.value = __spreadProps(__spreadValues({}, messages.value), { [convId]: [...list, m] });
    const conv = conversations.value.find((c) => c.id === convId);
    if (conv) {
      conv.lastMessage = summarizeLast(m.type, m.content);
      conv.lastMessageTime = m.createdAt;
      if (convId !== currentConversationId.value)
        conv.unreadCount++;
    }
  }
  function setCurrentConversation(id) {
    return __async(this, null, function* () {
      currentConversationId.value = id;
      const conv = conversations.value.find((c) => c.id === id);
      if (conv)
        conv.unreadCount = 0;
      try {
        yield services_apiConversation.apiMarkMessagesRead(id);
      } catch (e) {
      }
    });
  }
  function sendMessage(content, type = "text", extra) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const cid = currentConversationId.value;
      const conv = conversations.value.find((c) => c.id === cid);
      if (!cid || !conv)
        return;
      const tempId = `temp_${Date.now()}`;
      const optimistic = {
        id: tempId,
        conversationId: cid,
        senderId: "__local__",
        content,
        type,
        status: "sending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        duration: extra == null ? void 0 : extra.duration
      };
      messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: [...messages.value[cid] || [], optimistic] });
      conv.lastMessage = summarizeLast(type, content);
      conv.lastMessageTime = optimistic.createdAt;
      if (type === "voice") {
        let filePath = "";
        let durationMs = (_a = extra == null ? void 0 : extra.duration) != null ? _a : 0;
        try {
          const o = JSON.parse(content);
          if (o.url)
            filePath = o.url.trim();
          if (typeof o.duration === "number" && o.duration > 0)
            durationMs = o.duration;
        } catch (e) {
        }
        if (!filePath) {
          const arrFail = ((_b = messages.value[cid]) == null ? void 0 : _b.filter((m) => m.id !== tempId)) || [];
          messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: arrFail });
          common_vendor.index.showToast({ title: "语音文件无效", icon: "none" });
          return;
        }
        try {
          const { url } = yield services_apiUpload.apiUploadVoice(filePath);
          const durationSec = Math.max(1, Math.ceil(durationMs / 1e3));
          const saved = yield services_apiConversation.apiSendMessage({
            conversationId: cid,
            receiverId: conv.userId,
            type: "voice",
            content: "[语音]",
            mediaUrl: url,
            mediaDuration: durationSec
          });
          const mapped = mapApiMessage(saved);
          const arr = ((_c = messages.value[cid]) == null ? void 0 : _c.filter((m) => m.id !== tempId)) || [];
          messages.value = __spreadProps(__spreadValues({}, messages.value), {
            [cid]: [...arr, mapped].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          });
          const lc = conversations.value.find((c) => c.id === cid);
          if (lc) {
            lc.lastMessage = summarizeLast(mapped.type, mapped.content);
            lc.lastMessageTime = mapped.createdAt;
          }
        } catch (e) {
          const arrFail = ((_d = messages.value[cid]) == null ? void 0 : _d.filter((m) => m.id !== tempId)) || [];
          messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: arrFail });
          common_vendor.index.showToast({ title: "语音发送失败", icon: "none" });
        }
        return;
      }
      if (type === "image") {
        const filePath = content.trim();
        if (!filePath) {
          messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: ((_e = messages.value[cid]) == null ? void 0 : _e.filter((m) => m.id !== tempId)) || [] });
          common_vendor.index.showToast({ title: "图片文件无效", icon: "none" });
          return;
        }
        try {
          const { url } = yield services_apiUpload.apiUploadImage(filePath);
          const saved = yield services_apiConversation.apiSendMessage({
            conversationId: cid,
            receiverId: conv.userId,
            type: "image",
            content: url,
            mediaUrl: url
          });
          const mapped = mapApiMessage(saved);
          const arr = ((_f = messages.value[cid]) == null ? void 0 : _f.filter((m) => m.id !== tempId)) || [];
          messages.value = __spreadProps(__spreadValues({}, messages.value), {
            [cid]: [...arr, mapped].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          });
          const lc = conversations.value.find((c) => c.id === cid);
          if (lc) {
            lc.lastMessage = summarizeLast(mapped.type, mapped.content);
            lc.lastMessageTime = mapped.createdAt;
          }
        } catch (e) {
          messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: ((_g = messages.value[cid]) == null ? void 0 : _g.filter((m) => m.id !== tempId)) || [] });
          common_vendor.index.showToast({ title: "图片发送失败", icon: "none" });
        }
        return;
      }
      if (type === "emoji") {
        try {
          const saved = yield services_apiConversation.apiSendMessage({
            conversationId: cid,
            receiverId: conv.userId,
            type: "emoji",
            content
          });
          const mapped = mapApiMessage(saved);
          const arr = ((_h = messages.value[cid]) == null ? void 0 : _h.filter((m) => m.id !== tempId)) || [];
          messages.value = __spreadProps(__spreadValues({}, messages.value), {
            [cid]: [...arr, mapped].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          });
          const lc = conversations.value.find((c) => c.id === cid);
          if (lc) {
            lc.lastMessage = summarizeLast(mapped.type, mapped.content);
            lc.lastMessageTime = mapped.createdAt;
          }
        } catch (e) {
          messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: ((_i = messages.value[cid]) == null ? void 0 : _i.filter((m) => m.id !== tempId)) || [] });
          common_vendor.index.showToast({ title: "表情发送失败", icon: "none" });
        }
        return;
      }
      const payload = {
        conversationId: cid,
        receiverId: conv.userId,
        type,
        content
      };
      try {
        const saved = yield services_apiConversation.apiSendMessage(payload);
        const mapped = mapApiMessage(saved);
        const arr = ((_j = messages.value[cid]) == null ? void 0 : _j.filter((m) => m.id !== tempId)) || [];
        messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: [...arr, mapped].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) });
        const lc = conversations.value.find((c) => c.id === cid);
        if (lc) {
          lc.lastMessage = summarizeLast(mapped.type, mapped.content);
          lc.lastMessageTime = mapped.createdAt;
        }
      } catch (e) {
        const arr = ((_k = messages.value[cid]) == null ? void 0 : _k.filter((m) => m.id !== tempId)) || [];
        messages.value = __spreadProps(__spreadValues({}, messages.value), { [cid]: arr });
      }
    });
  }
  function createConversation(peerUserId, nickname, avatar) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      if (!peerUserId) {
        throw new Error("对方用户 ID 无效");
      }
      const row = yield services_apiConversation.apiCreateConversation(peerUserId);
      if (!(row == null ? void 0 : row.id)) {
        throw new Error("创建会话失败，请稍后重试");
      }
      const mapped = mapApiConversation(row);
      if (!mapped.id) {
        throw new Error("会话数据异常");
      }
      if (!mapped.userId) {
        mapped.userId = (_c = (_b = (_a = row.targetUser) == null ? void 0 : _a.id) != null ? _b : row.targetUserId) != null ? _c : peerUserId;
      }
      if (!mapped.nickname && nickname)
        mapped.nickname = nickname;
      if (!mapped.avatar && avatar)
        mapped.avatar = utils_avatar.resolveAvatar(avatar, mapped.userId);
      const ix = conversations.value.findIndex((c) => c.id === mapped.id);
      if (ix >= 0)
        conversations.value.splice(ix, 1);
      conversations.value.unshift(mapped);
      return mapped.id;
    });
  }
  function receiveMessage(conversationId, message) {
    messages.value = __spreadProps(__spreadValues({}, messages.value), {
      [conversationId]: [...messages.value[conversationId] || [], message]
    });
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = summarizeLast(message.type, message.content);
      conv.lastMessageTime = message.createdAt || (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  function deleteConversation(id) {
    const index = conversations.value.findIndex((c) => c.id === id);
    if (index > -1)
      conversations.value.splice(index, 1);
    const next = __spreadValues({}, messages.value);
    delete next[id];
    messages.value = next;
    if (currentConversationId.value === id)
      currentConversationId.value = "";
  }
  function topConversation(id) {
    const conv = conversations.value.find((c) => c.id === id);
    if (conv)
      conv.isTop = !conv.isTop;
  }
  function clearMessages(conversationId) {
    messages.value = __spreadProps(__spreadValues({}, messages.value), { [conversationId]: [] });
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = "";
      conv.lastMessageTime = "";
    }
  }
  function lastMessageTimestamp(timeStr) {
    if (!timeStr)
      return 0;
    const t = new Date(timeStr).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  function pad2(n) {
    return n.toString().padStart(2, "0");
  }
  function formatTime(timeStr) {
    if (!timeStr)
      return "";
    const msgDate = new Date(timeStr);
    if (!Number.isFinite(msgDate.getTime()))
      return timeStr;
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - msgDate.getTime();
    if (diffMs >= 0 && diffMs < 6e4)
      return "刚刚";
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDayStart = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
    const diffDays = Math.floor((todayStart.getTime() - msgDayStart.getTime()) / 864e5);
    if (diffDays === 0)
      return `${pad2(msgDate.getHours())}:${pad2(msgDate.getMinutes())}`;
    if (diffDays === 1)
      return "昨天";
    if (msgDate.getFullYear() === now.getFullYear())
      return `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`;
    return `${msgDate.getFullYear()}/${pad2(msgDate.getMonth() + 1)}/${pad2(msgDate.getDate())}`;
  }
  return {
    conversations,
    messages,
    currentConversationId,
    currentConversation,
    currentMessages,
    totalUnread,
    fetchConversations,
    loadMessages,
    setCurrentConversation,
    sendMessage,
    receiveMessage,
    applyIncomingMessage,
    createConversation,
    deleteConversation,
    topConversation,
    clearMessages,
    formatTime,
    lastMessageTimestamp
  };
});
exports.useMessagesStore = useMessagesStore;
