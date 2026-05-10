"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  AuthSafetyTips();
}
const AuthSafetyTips = () => "../../components/AuthSafetyTips.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "welcome",
  setup(__props) {
    function goBack() {
      common_vendor.index.navigateBack({ fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" }) });
    }
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/auth/login" });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "68"),
        b: common_vendor.o(goLogin, "02"),
        c: common_vendor.o(goRegister, "bc")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1c4424d0"]]);
wx.createPage(MiniProgramPage);
