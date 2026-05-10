"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "vip-center",
  setup(__props) {
    stores_user.useUserStore();
    const selectedPlan = common_vendor.ref("monthly");
    const plans = [
      {
        id: "monthly",
        name: "月度 VIP",
        duration: 30,
        price: 68,
        originalPrice: 88,
        save: 20,
        tag: "最受欢迎",
        features: ["无限打招呼", "查看联系方式"]
      },
      {
        id: "quarterly",
        name: "季度 VIP",
        duration: 90,
        price: 168,
        save: 36,
        features: []
      },
      {
        id: "yearly",
        name: "年度 VIP",
        duration: 365,
        price: 498,
        save: 318,
        features: []
      }
    ];
    const benefits = [
      { icon: "💬", title: "无限打招呼", desc: "不再受每日次数限制" },
      { icon: "📞", title: "查看联系方式", desc: "获取对方微信号或手机号" },
      { icon: "🔥", title: "优先推荐", desc: "资料获得更多曝光" },
      { icon: "👁️", title: "访客记录", desc: "查看谁浏览过你的资料" }
    ];
    function buyVip() {
      common_vendor.index.showToast({ title: "支付功能开发中", icon: "none" });
    }
    function goBack() {
      common_vendor.index.navigateBack({
        fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" })
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "f8"),
        b: common_vendor.f(plans, (plan, k0, i0) => {
          return common_vendor.e({
            a: plan.tag
          }, plan.tag ? {
            b: common_vendor.t(plan.tag)
          } : {}, {
            c: common_vendor.t(plan.name),
            d: common_vendor.t(plan.duration),
            e: common_vendor.t(plan.price),
            f: plan.originalPrice
          }, plan.originalPrice ? {
            g: common_vendor.t(plan.originalPrice)
          } : {}, {
            h: plan.save
          }, plan.save ? {
            i: common_vendor.t(plan.save)
          } : {}, {
            j: common_vendor.f(plan.features, (feature, k1, i1) => {
              return {
                a: common_vendor.t(feature),
                b: feature
              };
            }),
            k: plan.id,
            l: selectedPlan.value === plan.id ? 1 : "",
            m: common_vendor.o(($event) => selectedPlan.value = plan.id, plan.id)
          });
        }),
        c: common_vendor.f(benefits, (benefit, k0, i0) => {
          return {
            a: common_vendor.t(benefit.icon),
            b: common_vendor.t(benefit.title),
            c: common_vendor.t(benefit.desc),
            d: benefit.title
          };
        }),
        d: common_vendor.o(buyVip, "26")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4e921a14"]]);
wx.createPage(MiniProgramPage);
