"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_navigation = require("../../utils/navigation.js");
if (!Math) {
  AuthSafetyTips();
}
const AuthSafetyTips = () => "../../components/AuthSafetyTips.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "welcome",
  setup(__props) {
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/index");
    }
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/auth/login" });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "b0"),
        b: common_vendor.o(goLogin, "9b"),
        c: common_vendor.o(goRegister, "e1")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1c4424d0"]]);
wx.createPage(MiniProgramPage);
