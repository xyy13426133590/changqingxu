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
    const password = common_vendor.ref("");
    const smsCode = common_vendor.ref("");
    const phoneMode = common_vendor.ref("sms");
    const loadingPwd = common_vendor.ref(false);
    const loadingSms = common_vendor.ref(false);
    const loadingWx = common_vendor.ref(false);
    const smsSending = common_vendor.ref(false);
    const smsCooldown = common_vendor.ref(0);
    const demoPhone = services_auth.DEMO_TEST_PHONE;
    const demoPwd = services_auth.DEMO_TEST_PASSWORD;
    const demoSms = services_auth.DEMO_SMS_CODE;
    let smsTimer = null;
    common_vendor.onUnmounted(() => {
      if (smsTimer) {
        clearInterval(smsTimer);
        smsTimer = null;
      }
    });
    function goBack() {
      common_vendor.index.navigateBack({ fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" }) });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    function onForgot() {
      common_vendor.index.showToast({ title: "演示版请使用验证码登录或重新注册", icon: "none" });
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
          common_vendor.index.showToast({ title: "请输入正确手机号", icon: "none" });
          return;
        }
        smsSending.value = true;
        try {
          yield services_auth.sendSmsCode(p);
          common_vendor.index.showToast({ title: "验证码已记录（演示无真实短信）", icon: "none" });
          startSmsCooldown();
        } catch (e) {
          common_vendor.index.showToast({ title: e instanceof Error ? e.message : "发送失败", icon: "none" });
        } finally {
          smsSending.value = false;
        }
      });
    }
    function onWeChatLogin() {
      return __async(this, null, function* () {
        if (loadingWx.value)
          return;
        loadingWx.value = true;
        try {
          yield userStore.loginByWeChat();
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => common_vendor.index.switchTab({ url: "/pages/discover/index" }), 400);
        } catch (e) {
          common_vendor.index.showToast({ title: e instanceof Error ? e.message : "登录失败", icon: "none" });
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
          common_vendor.index.showToast({ title: "请输入正确手机号", icon: "none" });
          return;
        }
        if (!/^\d{4,6}$/.test(c)) {
          common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
          return;
        }
        loadingSms.value = true;
        try {
          yield userStore.loginBySms(p, c);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => common_vendor.index.switchTab({ url: "/pages/discover/index" }), 400);
        } catch (e) {
          common_vendor.index.showToast({ title: e instanceof Error ? e.message : "登录失败", icon: "none" });
        } finally {
          loadingSms.value = false;
        }
      });
    }
    function submitPwd() {
      return __async(this, null, function* () {
        if (loadingPwd.value)
          return;
        const p = phone.value.trim();
        const pwd = password.value.trim();
        if (!services_auth.validatePhone(p)) {
          common_vendor.index.showToast({ title: "请输入正确手机号", icon: "none" });
          return;
        }
        if (!services_auth.validatePassword(pwd)) {
          common_vendor.index.showToast({ title: "密码为 6～32 位", icon: "none" });
          return;
        }
        loadingPwd.value = true;
        try {
          yield userStore.loginByPhone(p, pwd);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => common_vendor.index.switchTab({ url: "/pages/discover/index" }), 400);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "登录失败";
          if (msg === services_auth.LOGIN_ERR_ACCOUNT_NOT_FOUND) {
            common_vendor.index.showModal({
              title: "提示",
              content: "该手机号尚未注册，是否前往注册？",
              confirmText: "去注册",
              cancelText: "取消",
              success: (res) => {
                if (res.confirm) {
                  const q = encodeURIComponent(p);
                  common_vendor.index.navigateTo({ url: `/pages/auth/register?phone=${q}` });
                }
              }
            });
            return;
          }
          common_vendor.index.showToast({ title: msg, icon: "none" });
        } finally {
          loadingPwd.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "ec"),
        b: common_vendor.t(loadingWx.value ? "登录中…" : "微信一键登录"),
        c: _ctx.loading ? 1 : "",
        d: common_vendor.o(onWeChatLogin, "2b"),
        e: phoneMode.value === "sms" ? 1 : "",
        f: common_vendor.o(($event) => phoneMode.value = "sms", "f8"),
        g: phoneMode.value === "pwd" ? 1 : "",
        h: common_vendor.o(($event) => phoneMode.value = "pwd", "c1"),
        i: phoneMode.value === "sms"
      }, phoneMode.value === "sms" ? {
        j: phone.value,
        k: common_vendor.o(($event) => phone.value = $event.detail.value, "ca"),
        l: smsCode.value,
        m: common_vendor.o(($event) => smsCode.value = $event.detail.value, "f4"),
        n: common_vendor.t(smsCooldown.value > 0 ? `${smsCooldown.value}s` : smsSending.value ? "发送中" : "获取验证码"),
        o: smsCooldown.value > 0 || smsSending.value ? 1 : "",
        p: common_vendor.o(onSendSms, "17"),
        q: common_vendor.t(common_vendor.unref(demoSms)),
        r: common_vendor.t(loadingSms.value ? "登录中…" : "验证并登录"),
        s: loadingSms.value ? 1 : "",
        t: common_vendor.o(submitSms, "bd")
      } : {
        v: phone.value,
        w: common_vendor.o(($event) => phone.value = $event.detail.value, "d6"),
        x: password.value,
        y: common_vendor.o(($event) => password.value = $event.detail.value, "72"),
        z: common_vendor.o(goRegister, "62"),
        A: common_vendor.o(onForgot, "bb"),
        B: common_vendor.t(loadingPwd.value ? "登录中…" : "登 录"),
        C: loadingPwd.value ? 1 : "",
        D: common_vendor.o(submitPwd, "91")
      }, {
        E: phoneMode.value === "sms"
      }, phoneMode.value === "sms" ? {
        F: common_vendor.o(goRegister, "6d")
      } : {}, {
        G: common_vendor.t(common_vendor.unref(demoPhone)),
        H: common_vendor.t(common_vendor.unref(demoPwd)),
        I: common_vendor.t(common_vendor.unref(demoSms))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6c56cc25"]]);
wx.createPage(MiniProgramPage);
