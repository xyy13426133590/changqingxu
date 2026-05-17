"use strict";
const common_vendor = require("../common/vendor.js");
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
  EmojiPanel();
}
const EmojiPanel = () => "./EmojiPanel.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ChatInputBar",
  props: {
    placeholder: {}
  },
  emits: ["sendText", "sendVoice", "sendImage"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const mode = common_vendor.ref("text");
    const inputText = common_vendor.ref("");
    const showEmoji = common_vendor.ref(false);
    const canSend = common_vendor.computed(() => inputText.value.trim().length > 0);
    const isRecording = common_vendor.ref(false);
    const willCancel = common_vendor.ref(false);
    const recordStartTime = common_vendor.ref(0);
    const recordDuration = common_vendor.ref(0);
    const recordTimer = common_vendor.ref(null);
    const editingImage = common_vendor.ref("");
    let pendingVoiceStop = null;
    let recorderManagerInited = false;
    const voiceBtnText = common_vendor.computed(() => {
      if (isRecording.value)
        return willCancel.value ? "松开取消" : "录音中…";
      return "按住 说话";
    });
    const formatRecordTime = common_vendor.computed(() => {
      const seconds = Math.floor(recordDuration.value / 1e3);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    });
    function toggleMode(targetMode) {
      mode.value = mode.value === targetMode ? "text" : targetMode;
      showEmoji.value = false;
    }
    function toggleEmoji() {
      showEmoji.value = !showEmoji.value;
      if (showEmoji.value)
        mode.value = "text";
    }
    function onFocus() {
      showEmoji.value = false;
    }
    function sendText() {
      const content = inputText.value.trim();
      if (!content)
        return;
      emit("sendText", content);
      inputText.value = "";
    }
    function onEmojiSelect(emoji) {
      inputText.value += emoji;
    }
    function onEmojiDelete() {
      const str = inputText.value;
      if (str.length === 0)
        return;
      inputText.value = str.slice(0, -1);
    }
    function ensureRecordPermission() {
      return new Promise((resolve) => {
        common_vendor.index.getSetting({
          success(setting) {
            var _a;
            if (((_a = setting.authSetting) == null ? void 0 : _a["scope.record"]) === true) {
              resolve(true);
              return;
            }
            common_vendor.index.authorize({
              scope: "scope.record",
              success() {
                resolve(true);
              },
              fail() {
                common_vendor.index.showModal({
                  title: "需要录音权限",
                  content: "请在设置中允许「麦克风/录音」，以便发送语音。",
                  cancelText: "取消",
                  confirmText: "去设置",
                  success(r) {
                    if (r.confirm)
                      common_vendor.index.openSetting({});
                  }
                });
                resolve(false);
              }
            });
          },
          fail() {
            resolve(false);
          }
        });
      });
    }
    function toastRecorderError(err) {
      console.warn("[RecorderManager]", err);
      const msg = (err.errMsg || "").toLowerCase();
      let title = "录音失败";
      if (msg.includes("auth") || msg.includes("denied") || msg.includes("authorize") || msg.includes("privacy")) {
        title = "未获得录音权限，请去设置开启";
      } else if (msg.includes("not supported") || msg.includes("not support") || msg.includes("simulate") || msg.includes("simulator")) {
        title = "开发者工具可能无麦克风，请用真机试";
      } else if (msg.includes("frequency") || msg.includes("bitrate") || msg.includes("samplerate")) {
        title = "当前设备不支持该录音参数，可在真机再试";
      } else if (msg.length > 3 && msg.length <= 56) {
        title = msg;
      }
      common_vendor.index.showToast({ title, icon: "none", duration: 2800 });
    }
    function recorderStartMp3Compatible(rm) {
      rm.start({
        duration: 6e4,
        format: "mp3",
        sampleRate: 16e3,
        numberOfChannels: 1
      });
    }
    function onVoiceStart() {
      return __async(this, null, function* () {
        var _a;
        const permitted = yield ensureRecordPermission();
        if (!permitted)
          return;
        initRecorderManagerOnce();
        const rm = (_a = common_vendor.index.getRecorderManager) == null ? void 0 : _a.call(common_vendor.index);
        if (!rm) {
          common_vendor.index.showToast({ title: "录音组件不可用", icon: "none" });
          return;
        }
        isRecording.value = true;
        willCancel.value = false;
        recordStartTime.value = Date.now();
        recordDuration.value = 0;
        recordTimer.value = setInterval(() => {
          recordDuration.value = Date.now() - recordStartTime.value;
        }, 100);
        startRecord();
      });
    }
    function onVoiceMove(e) {
      if (!isRecording.value)
        return;
      const touch = e.touches[0];
      const ct = e.currentTarget;
      const startY = ct.startY != null ? ct.startY : touch.clientY;
      e.currentTarget.startY = startY;
      const deltaY = startY - touch.clientY;
      willCancel.value = deltaY > 100;
    }
    function onVoiceEnd() {
      var _a, _b;
      if (!isRecording.value)
        return;
      const cancelled = willCancel.value;
      const startMs = recordStartTime.value;
      pendingVoiceStop = { cancelled, startMs };
      if (recordTimer.value) {
        clearInterval(recordTimer.value);
        recordTimer.value = null;
      }
      isRecording.value = false;
      willCancel.value = false;
      recordDuration.value = 0;
      (_b = (_a = common_vendor.index.getRecorderManager) == null ? void 0 : _a.call(common_vendor.index)) == null ? void 0 : _b.stop();
    }
    function onVoiceCancel() {
      var _a, _b;
      if (!isRecording.value)
        return;
      pendingVoiceStop = { cancelled: true, startMs: recordStartTime.value };
      if (recordTimer.value) {
        clearInterval(recordTimer.value);
        recordTimer.value = null;
      }
      isRecording.value = false;
      willCancel.value = false;
      recordDuration.value = 0;
      (_b = (_a = common_vendor.index.getRecorderManager) == null ? void 0 : _a.call(common_vendor.index)) == null ? void 0 : _b.stop();
    }
    function startRecord() {
      var _a;
      initRecorderManagerOnce();
      const rm = (_a = common_vendor.index.getRecorderManager) == null ? void 0 : _a.call(common_vendor.index);
      if (!rm)
        return;
      recorderStartMp3Compatible(rm);
    }
    function resetRecordState() {
      isRecording.value = false;
      willCancel.value = false;
      recordDuration.value = 0;
      if (recordTimer.value) {
        clearInterval(recordTimer.value);
        recordTimer.value = null;
      }
    }
    function initRecorderManagerOnce() {
      var _a;
      if (recorderManagerInited)
        return;
      const rm = (_a = common_vendor.index.getRecorderManager) == null ? void 0 : _a.call(common_vendor.index);
      if (!rm)
        return;
      recorderManagerInited = true;
      rm.onStop((res) => {
        if (recordTimer.value) {
          clearInterval(recordTimer.value);
          recordTimer.value = null;
        }
        const pend = pendingVoiceStop;
        pendingVoiceStop = null;
        if (!pend) {
          resetRecordState();
          return;
        }
        if (pend.cancelled) {
          resetRecordState();
          return;
        }
        const duration = Date.now() - pend.startMs;
        const path = (res.tempFilePath || "").trim();
        resetRecordState();
        if (duration < 1e3) {
          common_vendor.index.showToast({ title: "录音时间太短", icon: "none" });
          return;
        }
        if (!path) {
          common_vendor.index.showToast({ title: "未获取录音文件", icon: "none" });
          return;
        }
        emit("sendVoice", duration, path);
      });
      rm.onError((err) => {
        pendingVoiceStop = null;
        resetRecordState();
        toastRecorderError(err || {});
      });
    }
    common_vendor.onMounted(() => {
      initRecorderManagerOnce();
    });
    function waveStyle(index) {
      const height = isRecording.value ? 20 + Math.sin(Date.now() / 100 + index) * 20 : 10;
      return {
        height: `${height}rpx`,
        animationDelay: `${index * 0.1}s`
      };
    }
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: (res) => {
          editingImage.value = res.tempFilePaths[0];
        }
      });
    }
    function chooseAlbum() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: (res) => {
          editingImage.value = res.tempFilePaths[0];
        }
      });
    }
    function takeScreenshot() {
      common_vendor.index.showModal({
        title: "选择图片",
        content: "拍照或从相册选择，进入编辑后发送",
        confirmText: "拍摄",
        cancelText: "相册",
        success: (res) => {
          if (res.confirm)
            chooseImage();
          else
            chooseAlbum();
        }
      });
    }
    function cancelEdit() {
      editingImage.value = "";
    }
    function confirmEdit() {
      if (editingImage.value) {
        emit("sendImage", editingImage.value);
        editingImage.value = "";
      }
    }
    function rotateImage() {
      common_vendor.index.showToast({ title: "旋转需接入图片编辑能力", icon: "none" });
    }
    function cropImage() {
      return __async(this, null, function* () {
        const src = editingImage.value;
        if (!src) {
          common_vendor.index.showToast({ title: "请先选择图片", icon: "none" });
          return;
        }
        common_vendor.index.cropImage({
          src,
          cropScale: "1:1",
          success(res) {
            editingImage.value = res.tempFilePath;
            common_vendor.index.showToast({ title: "裁剪完成", icon: "success" });
          },
          fail(err) {
            console.warn("[cropImage]", err);
            common_vendor.index.showToast({ title: "系统裁剪不可用，请升级微信", icon: "none" });
          }
        });
      });
    }
    function addText() {
      common_vendor.index.showModal({
        title: "添加文字",
        editable: true,
        placeholderText: "输入文字",
        success: (res) => {
          if (res.confirm && res.content) {
            common_vendor.index.showToast({ title: `已记录: ${res.content}`, icon: "none" });
          }
        }
      });
    }
    function addMosaic() {
      common_vendor.index.showToast({ title: "马赛克需图像处理库", icon: "none" });
    }
    common_vendor.onUnmounted(() => {
      if (recordTimer.value)
        clearInterval(recordTimer.value);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(mode.value === "voice" ? "⌨️" : "🎙️"),
        b: mode.value === "voice" ? 1 : "",
        c: common_vendor.o(($event) => toggleMode("voice"), "47"),
        d: showEmoji.value ? 1 : "",
        e: common_vendor.o(toggleEmoji, "f9"),
        f: common_vendor.o(chooseAlbum, "09"),
        g: common_vendor.o(chooseImage, "7c"),
        h: common_vendor.o(takeScreenshot, "50"),
        i: mode.value === "voice"
      }, mode.value === "voice" ? {
        j: common_vendor.t(voiceBtnText.value),
        k: isRecording.value ? 1 : "",
        l: willCancel.value ? 1 : "",
        m: common_vendor.o(onVoiceStart, "f2"),
        n: common_vendor.o(onVoiceMove, "d7"),
        o: common_vendor.o(onVoiceEnd, "63"),
        p: common_vendor.o(onVoiceCancel, "a3")
      } : {
        q: _ctx.placeholder,
        r: common_vendor.o(sendText, "e3"),
        s: common_vendor.o(onFocus, "dd"),
        t: inputText.value,
        v: common_vendor.o(($event) => inputText.value = $event.detail.value, "98"),
        w: canSend.value ? 1 : "",
        x: common_vendor.o(sendText, "61")
      }, {
        y: isRecording.value
      }, isRecording.value ? {
        z: common_vendor.f(5, (i, k0, i0) => {
          return {
            a: i,
            b: common_vendor.s(waveStyle(i))
          };
        }),
        A: common_vendor.t(willCancel.value ? "松开取消发送" : "松开发送，上滑取消"),
        B: common_vendor.t(formatRecordTime.value),
        C: willCancel.value ? 1 : ""
      } : {}, {
        D: showEmoji.value
      }, showEmoji.value ? {
        E: common_vendor.o(onEmojiSelect, "be"),
        F: common_vendor.o(onEmojiDelete, "b5"),
        G: common_vendor.p({
          visible: showEmoji.value
        })
      } : {}, {
        H: editingImage.value
      }, editingImage.value ? {
        I: common_vendor.o(cancelEdit, "9e"),
        J: common_vendor.o(confirmEdit, "5a"),
        K: editingImage.value,
        L: common_vendor.o(rotateImage, "91"),
        M: common_vendor.o(cropImage, "00"),
        N: common_vendor.o(addText, "6d"),
        O: common_vendor.o(addMosaic, "51")
      } : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5f0df289"]]);
wx.createComponent(Component);
