"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_messages = require("../../stores/messages.js");
const stores_user = require("../../stores/user.js");
const services_chatSocket = require("../../services/chat-socket.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
const utils_mediaUrl = require("../../utils/media-url.js");
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
  ChatInputBar();
}
const ChatInputBar = () => "../../components/ChatInputBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "chat",
  setup(__props) {
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    const messagesStore = stores_messages.useMessagesStore();
    const userStore = stores_user.useUserStore();
    const showRiskBanner = common_vendor.ref(true);
    const conversationId = common_vendor.ref("");
    const playingVoiceId = common_vendor.ref("");
    let voicePlayer = null;
    function stopVoicePlayback() {
      playingVoiceId.value = "";
      if (!voicePlayer)
        return;
      try {
        voicePlayer.stop();
        voicePlayer.destroy();
      } catch (e) {
      }
      voicePlayer = null;
    }
    function isFromMe(msg) {
      const my = userStore.profile.id;
      return msg.senderId === "__local__" || !!my && msg.senderId === my;
    }
    const currentConversation = common_vendor.computed(() => messagesStore.currentConversation);
    const currentMessages = common_vendor.computed(() => messagesStore.currentMessages);
    const lastMessageId = common_vendor.computed(() => {
      const list = currentMessages.value;
      if (list.length === 0)
        return "";
      return list[list.length - 1].id;
    });
    common_vendor.onLoad((options) => __async(this, null, function* () {
      if (options == null ? void 0 : options.conversationId) {
        conversationId.value = options.conversationId;
        yield messagesStore.setCurrentConversation(options.conversationId);
        yield messagesStore.loadMessages(options.conversationId);
      }
      yield services_chatSocket.connectChatSocket({
        onNewMessage: (payload) => messagesStore.applyIncomingMessage(payload)
      });
    }));
    common_vendor.onUnload(() => {
      stopVoicePlayback();
      void services_chatSocket.disconnectChatSocket();
    });
    function goBack() {
      utils_navigation.navigateBackTo("/pages/messages/index");
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
      messagesStore.sendMessage(voiceData, "voice", { duration });
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
    function playVoice(msg) {
      if (msg.type !== "voice")
        return;
      if (playingVoiceId.value === msg.id) {
        stopVoicePlayback();
        return;
      }
      let rawUrl = "";
      try {
        const data = JSON.parse(msg.content);
        rawUrl = (data.url || "").trim();
      } catch (e) {
        rawUrl = (msg.content || "").trim();
      }
      const voiceUrl = utils_mediaUrl.resolveVoicePlaySrc(rawUrl);
      if (!voiceUrl || voiceUrl === "[语音]") {
        common_vendor.index.showToast({ title: "暂无可用音频", icon: "none" });
        return;
      }
      stopVoicePlayback();
      playingVoiceId.value = msg.id;
      const ctx = common_vendor.index.createInnerAudioContext();
      voicePlayer = ctx;
      ctx.obeyMuteSwitch = false;
      ctx.src = voiceUrl;
      ctx.play();
      ctx.onEnded(() => {
        stopVoicePlayback();
      });
      ctx.onError((err) => {
        console.warn("[InnerAudio]", err, voiceUrl);
        stopVoicePlayback();
        common_vendor.index.showToast({ title: "播放失败", icon: "none" });
      });
    }
    function formatDuration(duration) {
      if (!duration)
        return "0";
      return Math.ceil(duration / 1e3).toString();
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(goBack, "6b"),
        b: (_a = currentConversation.value) == null ? void 0 : _a.avatar,
        c: common_vendor.t((_b = currentConversation.value) == null ? void 0 : _b.nickname),
        d: common_vendor.s(capsuleNavRowStyle.value),
        e: common_vendor.s(capsuleNavOuterStyle.value),
        f: showRiskBanner.value
      }, showRiskBanner.value ? {
        g: common_vendor.o(dismissRisk, "ec")
      } : {}, {
        h: common_vendor.f(currentMessages.value, (msg, k0, i0) => {
          var _a2;
          return common_vendor.e({
            a: !isFromMe(msg)
          }, !isFromMe(msg) ? {
            b: (_a2 = currentConversation.value) == null ? void 0 : _a2.avatar
          } : {}, {
            c: msg.type === "text"
          }, msg.type === "text" ? common_vendor.e({
            d: common_vendor.t(msg.content),
            e: isFromMe(msg)
          }, isFromMe(msg) ? common_vendor.e({
            f: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            g: msg.status === "sent"
          }) : {}, {
            h: common_vendor.n(isFromMe(msg) ? "me" : "other")
          }) : msg.type === "image" ? common_vendor.e({
            j: msg.content,
            k: isFromMe(msg)
          }, isFromMe(msg) ? common_vendor.e({
            l: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            m: msg.status === "sent"
          }) : {}, {
            n: common_vendor.n(isFromMe(msg) ? "me" : "other"),
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
            v: isFromMe(msg)
          }, isFromMe(msg) ? common_vendor.e({
            w: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            x: msg.status === "sent"
          }) : {}, {
            y: common_vendor.n(isFromMe(msg) ? "me" : "other"),
            z: common_vendor.o(($event) => playVoice(msg), msg.id)
          }) : msg.type === "emoji" ? common_vendor.e({
            B: common_vendor.t(msg.content),
            C: isFromMe(msg)
          }, isFromMe(msg) ? common_vendor.e({
            D: msg.status === "sending"
          }, msg.status === "sending" ? {} : msg.status === "sent" ? {} : {}, {
            E: msg.status === "sent"
          }) : {}, {
            F: common_vendor.n(isFromMe(msg) ? "me" : "other")
          }) : {}, {
            i: msg.type === "image",
            p: msg.type === "voice",
            A: msg.type === "emoji",
            G: msg.id,
            H: msg.id,
            I: isFromMe(msg) ? 1 : "",
            J: !isFromMe(msg) ? 1 : ""
          });
        }),
        i: lastMessageId.value,
        j: common_vendor.o(onSendText, "e2"),
        k: common_vendor.o(onSendVoice, "d0"),
        l: common_vendor.o(onSendImage, "46"),
        m: common_vendor.p({
          placeholder: "文明发言，涉及站外引导将提示风险…"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4859ecaa"]]);
wx.createPage(MiniProgramPage);
