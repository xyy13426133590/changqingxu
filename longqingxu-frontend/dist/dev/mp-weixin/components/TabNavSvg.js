"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const TAB_ICON_ACTIVE = "#A78BFA";
const TAB_ICON_INACTIVE = "rgba(255,255,255,0.3)";
const iconPx = 26;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "TabNavSvg",
  props: {
    name: {},
    active: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const iconType = common_vendor.computed(() => {
      const filled = props.active;
      if (props.name === "discover")
        return filled ? "navigate-filled" : "navigate";
      if (props.name === "filter")
        return filled ? "tune-filled" : "tune";
      if (props.name === "circle")
        return filled ? "circle-filled" : "circle";
      if (props.name === "messages")
        return filled ? "chatbubble-filled" : "chatbubble";
      return filled ? "person-filled" : "person";
    });
    const iconColor = common_vendor.computed(() => props.active ? TAB_ICON_ACTIVE : TAB_ICON_INACTIVE);
    const inst = common_vendor.getCurrentInstance();
    inst != null && inst.uid != null ? inst.uid : Math.floor(Math.random() * 1e9);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: iconType.value,
          size: iconPx,
          color: iconColor.value
        }),
        b: !_ctx.active ? 1 : ""
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04c9902c"]]);
wx.createComponent(Component);
