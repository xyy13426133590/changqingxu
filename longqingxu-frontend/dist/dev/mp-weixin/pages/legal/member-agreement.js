"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_navigation = require("../../utils/navigation.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "member-agreement",
  setup(__props) {
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/vip-center");
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "fc")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ab1a133f"]]);
wx.createPage(MiniProgramPage);
