"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const services_auth = require("../../services/auth.js");
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
  AuthSafetyTips();
}
const AuthSafetyTips = () => "../../components/AuthSafetyTips.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "register",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const phone = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      const ph = options == null ? void 0 : options.phone;
      if (typeof ph === "string" && ph.trim()) {
        try {
          phone.value = decodeURIComponent(ph.trim());
        } catch (_e2) {
          phone.value = ph.trim();
        }
      }
    });
    const nickname = common_vendor.ref("");
    const password = common_vendor.ref("");
    const password2 = common_vendor.ref("");
    const agreed = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    function goBack() {
      common_vendor.index.navigateBack({ fail: () => common_vendor.index.redirectTo({ url: "/pages/auth/welcome" }) });
    }
    function goLogin() {
      common_vendor.index.redirectTo({ url: "/pages/auth/login" });
    }
    function submit() {
      return __async(this, null, function* () {
        if (loading.value || !agreed.value)
          return;
        const p = phone.value.trim();
        const nick = nickname.value.trim();
        const pwd = password.value;
        const pwd2 = password2.value;
        if (!services_auth.validatePhone(p)) {
          common_vendor.index.showToast({ title: "请输入正确手机号", icon: "none" });
          return;
        }
        if (nick.length < 2 || nick.length > 16) {
          common_vendor.index.showToast({ title: "昵称为 2～16 字符", icon: "none" });
          return;
        }
        if (!services_auth.validatePassword(pwd)) {
          common_vendor.index.showToast({ title: "密码为 6～32 位", icon: "none" });
          return;
        }
        if (pwd !== pwd2) {
          common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
          return;
        }
        loading.value = true;
        try {
          yield userStore.registerByPhone(p, pwd, nick);
          common_vendor.index.showToast({ title: "注册成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/mine/profile-edit" });
          }, 400);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "注册失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
        } finally {
          loading.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "ec"),
        b: phone.value,
        c: common_vendor.o(($event) => phone.value = $event.detail.value, "c3"),
        d: nickname.value,
        e: common_vendor.o(($event) => nickname.value = $event.detail.value, "82"),
        f: password.value,
        g: common_vendor.o(($event) => password.value = $event.detail.value, "6f"),
        h: password2.value,
        i: common_vendor.o(($event) => password2.value = $event.detail.value, "ba"),
        j: agreed.value
      }, agreed.value ? {} : {}, {
        k: agreed.value ? 1 : "",
        l: common_vendor.o(($event) => agreed.value = !agreed.value, "c1"),
        m: common_vendor.t(loading.value ? "提交中…" : "注 册"),
        n: loading.value || !agreed.value ? 1 : "",
        o: common_vendor.o(submit, "64"),
        p: common_vendor.o(goLogin, "04")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3d5ab0d5"]]);
wx.createPage(MiniProgramPage);
