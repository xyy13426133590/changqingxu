"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "AuthSafetyTips",
  setup(__props) {
    const bullets = [
      "建议完成实名认证与人脸识别，提升信任与匹配质量",
      "请勿轻信涉及金钱、投资、借贷的请求",
      "首次见面请选择公共场所，并告知亲友行踪",
      "发现可疑行为请立即举报，平台将依规处理"
    ];
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(bullets, (line, i, i0) => {
          return {
            a: common_vendor.t(line),
            b: i
          };
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8460fa36"]]);
wx.createComponent(Component);
