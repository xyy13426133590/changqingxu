"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "TabNavSvg",
  props: {
    name: {},
    active: { type: Boolean }
  },
  setup(__props) {
    function tabEmoji(name) {
      const map = {
        discover: "🧭",
        filter: "⚙",
        messages: "💬",
        mine: "👤"
      };
      return map[name] || "·";
    }
    const inst = common_vendor.getCurrentInstance();
    inst != null && inst.uid != null ? inst.uid : Math.floor(Math.random() * 1e9);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(tabEmoji(_ctx.name)),
        b: !_ctx.active ? 1 : ""
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04c9902c"]]);
wx.createComponent(Component);
