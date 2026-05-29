"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  TabNavSvg();
}
const TabNavSvg = () => "./TabNavSvg.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "TabBar",
  props: {
    active: {}
  },
  setup(__props) {
    const props = __props;
    const tabs = [
      { name: "discover", pagePath: "/pages/discover/index", text: "发现" },
      { name: "filter", pagePath: "/pages/filter/index", text: "筛选" },
      { name: "circle", pagePath: "/pages/circle/index", text: "圈子" },
      { name: "messages", pagePath: "/pages/messages/index", text: "消息" },
      { name: "mine", pagePath: "/pages/mine/index", text: "我的" }
    ];
    function switchTab(item) {
      if (props.active === item.name)
        return;
      common_vendor.index.switchTab({ url: item.pagePath });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tabs, (item, k0, i0) => {
          return {
            a: "7d9a6b19-0-" + i0,
            b: common_vendor.p({
              name: item.name,
              active: _ctx.active === item.name
            }),
            c: common_vendor.t(item.text),
            d: item.pagePath,
            e: _ctx.active === item.name ? 1 : "",
            f: common_vendor.o(($event) => switchTab(item), item.pagePath)
          };
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d9a6b19"]]);
wx.createComponent(Component);
