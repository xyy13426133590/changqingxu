"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_messages = require("../../stores/messages.js");
if (!Math) {
  ChatInputBar();
}
const ChatInputBar = () => "../../components/ChatInputBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "chat",
  setup(__props) {
    const messagesStore = stores_messages.useMessagesStore();
    const showRiskBanner = common_vendor.ref(true);
    const conversationId = common_vendor.ref("");
    const playingVoiceId = common_vendor.ref("");
    const currentConversation = common_vendor.computed(() => messagesStore.currentConversation);
    const currentMessages = common_vendor.computed(() => messagesStore.currentMessages);
    const lastMessageId = common_vendor.computed(() => {
      const messages = currentMessages.value;
      if (messages.length === 0)
        return "";
      return messages[messages.length - 1].id;
    });
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.conversationId) {
        conversationId.value = options.conversationId;
        messagesStore.setCurrentConversation(options.conversationId);
      }
    });
    function goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack({ delta: 1 });
        return;
      }
      common_vendor.index.switchTab({ url: "/pages/messages/index" });
    }
    function dismissRisk() {
      showRiskBanner.value = false;
    }
    function onSendText(content) {
      messagesStore.sendMessage(content, "text");
      scrollToBottom();
    }
    function onSendVoice(duration, tempFilePath) {
      const voiceData = JSON.stringify({
        url: tempFilePath,
        duration
      });
      messagesStore.sendMessage(voiceData, "voice");
      const messages = messagesStore.currentMessages;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        lastMsg.duration = duration;
      }
      scrollToBottom();
    }
    function onSendImage(tempFilePath) {
      messagesStore.sendMessage(tempFilePath, "image");
      scrollToBottom();
    }
    function scrollToBottom() {
      common_vendor.nextTick$1(() => {
        lastMessageId.value;
      });
    }
    function previewImage(url) {
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    }
    function playVoice(content) {
      try {
        const data = JSON.parse(content);
        const voiceUrl = data.url || content;
        const messages = messagesStore.currentMessages;
        const msg = messages.find((m) => m.content === content && m.type === "voice");
        if (msg) {
          playingVoiceId.value = msg.id;
        }
        const innerAudioContext = common_vendor.index.createInnerAudioContext();
        innerAudioContext.src = voiceUrl;
        innerAudioContext.play();
        innerAudioContext.onEnded(() => {
          playingVoiceId.value = "";
          innerAudioContext.destroy();
        });
        innerAudioContext.onError(() => {
          playingVoiceId.value = "";
          common_vendor.index.showToast({ title: "播放失败", icon: "none" });
          innerAudioContext.destroy();
        });
      } catch (_e2) {
        common_vendor.index.showToast({ title: "语音解析失败", icon: "none" });
      }
    }
    function formatDuration(duration) {
      if (!duration)
        return "0";
      return Math.ceil(duration / 1e3).toString();
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(goBack, "8e"),
        b: (_a = currentConversation.value) == null ? void 0 : _a.avatar,
        c: common_vendor.t((_b = currentConversation.value) == null ? void 0 : _b.nickname),
        d: showRiskBanner.value
      }, showRiskBanner.value ? {
        e: common_vendor.o(dismissRisk, "5f")
      } : {}, {
        f: common_vendor.f(currentMessages.value, (msg, k0, i0) => {
          var _a2;
          return common_vendor.e({
            a: msg.senderId !== "me"
          }, msg.senderId !== "me" ? {
            b: (_a2 = currentConversation.value) == null ? void 0 : _a2.avatar
          } : {}, {
            c: msg.type === "text"
          }, msg.type === "text" ? common_vendor.e({
            d: common_vendor.t(msg.content),
            e: msg.senderId === "me"
          }, msg.senderId === "me" ? common_vendor.e({
            f: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            g: msg.status === "sent"
          }) : {}, {
            h: common_vendor.n(msg.senderId === "me" ? "me" : "other")
          }) : msg.type === "image" ? common_vendor.e({
            j: msg.content,
            k: msg.senderId === "me"
          }, msg.senderId === "me" ? common_vendor.e({
            l: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            m: msg.status === "sent"
          }) : {}, {
            n: common_vendor.n(msg.senderId === "me" ? "me" : "other"),
            o: common_vendor.o(($event) => previewImage(msg.content), msg.id)
          }) : msg.type === "voice" ? common_vendor.e({
            q: common_vendor.t(playingVoiceId.value === msg.id ? "🔊" : "▶️"),
            r: common_vendor.t(formatDuration(msg.duration)),
            s: common_vendor.f(5, (i, k1, i1) => {
              return {
                a: i
              };
            }),
            t: `${Math.random() * 30 + 10}rpx`,
            v: msg.senderId === "me"
          }, msg.senderId === "me" ? common_vendor.e({
            w: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            x: msg.status === "sent"
          }) : {}, {
            y: common_vendor.n(msg.senderId === "me" ? "me" : "other"),
            z: common_vendor.o(($event) => playVoice(msg.content), msg.id)
          }) : msg.type === "emoji" ? common_vendor.e({
            B: common_vendor.t(msg.content),
            C: msg.senderId === "me"
          }, msg.senderId === "me" ? common_vendor.e({
            D: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            E: msg.status === "sent"
          }) : {}, {
            F: common_vendor.n(msg.senderId === "me" ? "me" : "other")
          }) : {}, {
            i: msg.type === "image",
            p: msg.type === "voice",
            A: msg.type === "emoji",
            G: msg.id,
            H: msg.id,
            I: msg.senderId === "me" ? 1 : "",
            J: msg.senderId !== "me" ? 1 : ""
          });
        }),
        g: lastMessageId.value,
        h: common_vendor.o(onSendText, "83"),
        i: common_vendor.o(onSendVoice, "21"),
        j: common_vendor.o(onSendImage, "03"),
        k: common_vendor.p({
          placeholder: "文明发言，涉及站外引导将提示风险…"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4859ecaa"]]);
wx.createPage(MiniProgramPage);
