"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const userId = common_vendor.ref("");
    common_vendor.onLoad((query) => {
      userId.value = (query == null ? void 0 : query.id) || "";
    });
    function goBack() {
      common_vendor.index.navigateBack({ fail: () => common_vendor.index.switchTab({ url: "/pages/discover/index" }) });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "a6"),
        b: userId.value
      }, userId.value ? {
        c: common_vendor.t(userId.value)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0b0b35bb"]]);
wx.createPage(MiniProgramPage);
