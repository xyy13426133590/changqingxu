"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "face-verify",
  setup(__props) {
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    const userStore = stores_user.useUserStore();
    const onlyFace = common_vendor.ref(false);
    const running = common_vendor.ref(false);
    const step = common_vendor.ref(0);
    const hasDraft = common_vendor.computed(() => userStore.hasRealNameDraft());
    const canStart = common_vendor.computed(() => onlyFace.value || hasDraft.value || userStore.profile.isRealName);
    const actionHints = [
      { icon: "😮", label: "张嘴" },
      { icon: "↔️", label: "摇头" },
      { icon: "😉", label: "眨眼" }
    ];
    const stepTitle = common_vendor.computed(() => {
      if (running.value) {
        if (step.value === 0)
          return "请张嘴";
        if (step.value === 1)
          return "请缓慢摇头";
        return "请眨眼";
      }
      return "请正对手机";
    });
    const stepDesc = common_vendor.computed(() => {
      if (running.value)
        return "保持面部在圆圈内，光线充足";
      return "按提示完成活体动作，保障账号安全";
    });
    const stepEmoji = common_vendor.computed(() => {
      if (!running.value)
        return "🧑";
      if (step.value === 0)
        return "😮";
      if (step.value === 1)
        return "🙂";
      return "😉";
    });
    common_vendor.onLoad((q) => {
      onlyFace.value = (q == null ? void 0 : q.onlyFace) === "1" || (q == null ? void 0 : q.onlyFace) === "true";
    });
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/index");
    }
    function goRealName() {
      common_vendor.index.redirectTo({ url: "/pages/auth/real-name" });
    }
    function onStart() {
      if (running.value)
        return;
      if (!onlyFace.value && !hasDraft.value && !userStore.profile.isRealName) {
        common_vendor.index.showToast({ title: "请先完成实名信息", icon: "none" });
        return;
      }
      running.value = true;
      step.value = 0;
      const t1 = setTimeout(() => {
        step.value = 1;
      }, 900);
      const t2 = setTimeout(() => {
        step.value = 2;
      }, 1800);
      setTimeout(() => {
        clearTimeout(t1);
        clearTimeout(t2);
        userStore.applyFaceVerificationSuccess();
        running.value = false;
        common_vendor.index.showToast({ title: "认证成功（演示）", icon: "success" });
        setTimeout(() => {
          utils_navigation.navigateBackTo("/pages/mine/index");
        }, 500);
      }, 2800);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "87"),
        b: common_vendor.s(capsuleNavRowStyle.value),
        c: common_vendor.s(capsuleNavOuterStyle.value),
        d: onlyFace.value
      }, onlyFace.value ? {} : !hasDraft.value ? {
        f: common_vendor.o(goRealName, "02")
      } : {}, {
        e: !hasDraft.value,
        g: common_vendor.t(stepEmoji.value),
        h: common_vendor.t(stepTitle.value),
        i: common_vendor.t(stepDesc.value),
        j: common_vendor.f(actionHints, (a, i, i0) => {
          return {
            a: common_vendor.t(a.icon),
            b: common_vendor.t(a.label),
            c: i
          };
        }),
        k: common_vendor.t(running.value ? "识别中…" : "开始识别"),
        l: running.value || !canStart.value ? 1 : "",
        m: common_vendor.o(onStart, "aa")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b2099581"]]);
wx.createPage(MiniProgramPage);
