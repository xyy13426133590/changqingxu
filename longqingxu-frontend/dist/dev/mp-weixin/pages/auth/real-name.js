"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "real-name",
  setup(__props) {
    const pageSafeStyle = utils_safeArea.getPageSafeTopStyle();
    const userStore = stores_user.useUserStore();
    const legalName = common_vendor.ref("");
    const idCard = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/index");
    }
    function validateIdCard18(id) {
      const s = id.trim().toUpperCase();
      if (!/^\d{17}[\dX]$/.test(s))
        return { ok: false, msg: "请输入18位身份证号码" };
      const y = Number.parseInt(s.slice(6, 10), 10);
      const m = Number.parseInt(s.slice(10, 12), 10) - 1;
      const d = Number.parseInt(s.slice(12, 14), 10);
      const birth = new Date(y, m, d);
      if (Number.isNaN(birth.getTime()))
        return { ok: false, msg: "身份证号日期无效" };
      let age = (/* @__PURE__ */ new Date()).getFullYear() - birth.getFullYear();
      const md = (/* @__PURE__ */ new Date()).getMonth() - birth.getMonth();
      if (md < 0 || md === 0 && (/* @__PURE__ */ new Date()).getDate() < birth.getDate())
        age--;
      if (age < 18)
        return { ok: false, msg: "根据身份证信息需年满18周岁方可使用" };
      if (age > 120)
        return { ok: false, msg: "身份证信息异常" };
      return { ok: true };
    }
    function onNext() {
      if (submitting.value)
        return;
      const name = legalName.value.trim();
      const id = idCard.value.trim();
      if (name.length < 2 || name.length > 20) {
        common_vendor.index.showToast({ title: "请输入2～20字真实姓名", icon: "none" });
        return;
      }
      const idRes = validateIdCard18(id);
      if (!idRes.ok) {
        common_vendor.index.showToast({ title: idRes.msg || "证件号无效", icon: "none" });
        return;
      }
      submitting.value = true;
      setTimeout(() => {
        userStore.setRealNameDraft({ legalName: name, idCard: id.toUpperCase() });
        submitting.value = false;
        common_vendor.index.navigateTo({ url: "/pages/auth/face-verify" });
      }, 320);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "2f"),
        b: legalName.value,
        c: common_vendor.o(($event) => legalName.value = $event.detail.value, "77"),
        d: idCard.value,
        e: common_vendor.o(($event) => idCard.value = $event.detail.value, "3e"),
        f: common_vendor.t(submitting.value ? "校验中…" : "下一步：人脸识别"),
        g: submitting.value ? 1 : "",
        h: common_vendor.o(onNext, "3f"),
        i: common_vendor.s(common_vendor.unref(pageSafeStyle))
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-56d11343"]]);
wx.createPage(MiniProgramPage);
