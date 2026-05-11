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
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const phone = common_vendor.ref("");
    const smsCode = common_vendor.ref("");
    const phoneLoginExpanded = common_vendor.ref(false);
    const loadingSms = common_vendor.ref(false);
    const loadingWx = common_vendor.ref(false);
    const smsSending = common_vendor.ref(false);
    const smsCooldown = common_vendor.ref(0);
    const demoSms = services_auth.DEMO_SMS_CODE;
    let smsTimer = null;
    common_vendor.onUnmounted(() => {
      if (smsTimer) {
        clearInterval(smsTimer);
        smsTimer = null;
      }
    });
    common_vendor.onBackPress(() => {
      if (phoneLoginExpanded.value) {
        closePhoneLogin();
        return true;
      }
      return false;
    });
    function goBack() {
      common_vendor.index.navigateBack({ fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" }) });
    }
    function openPhoneLogin() {
      if (loadingWx.value)
        return;
      phoneLoginExpanded.value = true;
    }
    function closePhoneLogin() {
      phoneLoginExpanded.value = false;
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    function startSmsCooldown() {
      if (smsTimer)
        clearInterval(smsTimer);
      smsCooldown.value = 59;
      smsTimer = setInterval(() => {
        smsCooldown.value--;
        if (smsCooldown.value <= 0 && smsTimer) {
          clearInterval(smsTimer);
          smsTimer = null;
        }
      }, 1e3);
    }
    function onSendSms() {
      return __async(this, null, function* () {
        if (smsCooldown.value > 0 || smsSending.value)
          return;
        const p = phone.value.trim();
        if (!services_auth.validatePhone(p)) {
          common_vendor.index.showToast({ title: "请输入11位大陆手机号（1开头）", icon: "none", duration: 2200 });
          return;
        }
        smsSending.value = true;
        common_vendor.index.showLoading({ title: "发送中", mask: true });
        try {
          yield services_auth.sendSmsCode(p);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "演示环境：验证码已就绪", icon: "success", duration: 1800 });
          startSmsCooldown();
        } catch (e) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: e instanceof Error ? e.message : "发送失败",
            icon: "none",
            duration: 2200
          });
        } finally {
          smsSending.value = false;
        }
      });
    }
    function goDiscoverAfterAuth() {
      common_vendor.index.switchTab({
        url: "/pages/discover/index",
        fail: () => {
          common_vendor.index.reLaunch({ url: "/pages/discover/index" });
        }
      });
    }
    function onWeChatLogin() {
      return __async(this, null, function* () {
        if (loadingWx.value)
          return;
        loadingWx.value = true;
        common_vendor.index.showLoading({ title: "登录中", mask: true });
        try {
          yield userStore.loginByWeChat();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "登录成功", icon: "success", duration: 1200 });
          setTimeout(goDiscoverAfterAuth, 300);
        } catch (e) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: e instanceof Error ? e.message : "登录失败", icon: "none", duration: 2200 });
        } finally {
          loadingWx.value = false;
        }
      });
    }
    function submitSms() {
      return __async(this, null, function* () {
        if (loadingSms.value)
          return;
        const p = phone.value.trim();
        const c = smsCode.value.trim();
        if (!services_auth.validatePhone(p)) {
          common_vendor.index.showToast({ title: "请输入11位大陆手机号（1开头）", icon: "none", duration: 2200 });
          return;
        }
        if (!/^\d{4,6}$/.test(c)) {
          common_vendor.index.showToast({ title: "请输入4～6位验证码", icon: "none", duration: 2200 });
          return;
        }
        loadingSms.value = true;
        common_vendor.index.showLoading({ title: "登录中", mask: true });
        try {
          yield userStore.loginBySms(p, c);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "登录成功", icon: "success", duration: 1200 });
          setTimeout(goDiscoverAfterAuth, 300);
        } catch (e) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: e instanceof Error ? e.message : "登录失败",
            icon: "none",
            duration: 2200
          });
        } finally {
          loadingSms.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !phoneLoginExpanded.value
      }, !phoneLoginExpanded.value ? {
        b: common_vendor.o(goBack, "7b"),
        c: common_vendor.t(loadingWx.value ? "登录中…" : "微信一键登录"),
        d: loadingWx.value ? 1 : "",
        e: loadingWx.value,
        f: common_vendor.o(onWeChatLogin, "df"),
        g: loadingWx.value ? 1 : "",
        h: loadingWx.value,
        i: common_vendor.o(openPhoneLogin, "69")
      } : {
        j: common_vendor.o(closePhoneLogin, "18"),
        k: phone.value,
        l: common_vendor.o(($event) => phone.value = $event.detail.value, "ba"),
        m: smsCode.value,
        n: common_vendor.o(($event) => smsCode.value = $event.detail.value, "60"),
        o: common_vendor.t(smsCooldown.value > 0 ? `${smsCooldown.value}s` : smsSending.value ? "发送中" : "获取验证码"),
        p: smsCooldown.value > 0 || smsSending.value ? 1 : "",
        q: smsCooldown.value > 0 || smsSending.value,
        r: common_vendor.o(onSendSms, "87"),
        s: common_vendor.t(common_vendor.unref(demoSms)),
        t: common_vendor.t(loadingSms.value ? "登录中…" : "登录"),
        v: loadingSms.value ? 1 : "",
        w: loadingSms.value,
        x: common_vendor.o(submitSms, "6e"),
        y: common_vendor.o(goRegister, "48"),
        z: common_vendor.t(common_vendor.unref(demoSms))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6c56cc25"]]);
wx.createPage(MiniProgramPage);
