"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const services_apiVip = require("../../services/api-vip.js");
const services_apiUser = require("../../services/api-user.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
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
  __name: "vip-center",
  setup(__props) {
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    const userStore = stores_user.useUserStore();
    const plans = common_vendor.ref([]);
    const selectedPlan = common_vendor.ref("");
    const loadError = common_vendor.ref("");
    const vipStatus = common_vendor.ref({
      isVip: false,
      vipExpiry: "",
      daysRemaining: 0
    });
    const benefits = [
      { icon: "💬", title: "无限打招呼", desc: "不再受每日次数限制" },
      { icon: "📞", title: "查看联系方式", desc: "获取对方微信号或手机号" },
      { icon: "🔥", title: "优先推荐", desc: "资料获得更多曝光" },
      { icon: "👁️", title: "访客记录", desc: "查看谁浏览过你的资料" }
    ];
    function planDurationDays(plan) {
      return Math.round((plan.durationMonths || 1) * 30);
    }
    const vipExpiryText = common_vendor.computed(() => {
      if (!userStore.profile.isVip)
        return "开通后享专属特权";
      if (userStore.profile.vipExpiry) {
        try {
          return `有效期至 ${new Date(userStore.profile.vipExpiry).toLocaleDateString()}`;
        } catch (e) {
          return "有效期见个人资料";
        }
      }
      return "有效期见个人资料";
    });
    const buyButtonLabel = common_vendor.computed(() => {
      const p = plans.value.find((x) => x.id === selectedPlan.value);
      return p ? `立即开通 ¥${p.price}` : "请先选择套餐";
    });
    function load() {
      return __async(this, null, function* () {
        loadError.value = "";
        try {
          const [{ plans: list }, vip] = yield Promise.all([services_apiVip.apiGetVipPlans(), services_apiUser.apiGetVipStatus()]);
          plans.value = list;
          vipStatus.value = vip;
          if (list.length && !selectedPlan.value) {
            selectedPlan.value = list[0].id;
          }
        } catch (e) {
          loadError.value = "套餐加载失败，请稍后重试";
          plans.value = [];
        }
      });
    }
    common_vendor.onMounted(() => void load());
    function buyVip() {
      return __async(this, null, function* () {
        if (!selectedPlan.value) {
          common_vendor.index.showToast({ title: "请先选择套餐", icon: "none" });
          return;
        }
        common_vendor.index.showLoading({ title: "创建订单…", mask: true });
        try {
          yield services_apiVip.apiCreateOrder({ planId: selectedPlan.value, payMethod: "wechat" });
          common_vendor.index.showToast({ title: "订单已创建（演示环境未完成支付闭环）", icon: "none", duration: 2200 });
          yield userStore.hydrateProfile();
          vipStatus.value = yield services_apiUser.apiGetVipStatus();
        } catch (e) {
        } finally {
          common_vendor.index.hideLoading();
        }
      });
    }
    function goBack() {
      utils_navigation.navigateBackTo("/pages/mine/index");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "1c"),
        b: common_vendor.s(capsuleNavRowStyle.value),
        c: common_vendor.s(capsuleNavOuterStyle.value),
        d: common_vendor.t(common_vendor.unref(userStore).profile.isVip ? "VIP 会员" : "尚未开通 VIP"),
        e: common_vendor.t(vipExpiryText.value),
        f: vipStatus.value.daysRemaining != null && common_vendor.unref(userStore).profile.isVip
      }, vipStatus.value.daysRemaining != null && common_vendor.unref(userStore).profile.isVip ? {
        g: common_vendor.t(vipStatus.value.daysRemaining)
      } : {}, {
        h: loadError.value
      }, loadError.value ? {
        i: common_vendor.t(loadError.value)
      } : {}, {
        j: common_vendor.f(plans.value, (plan, k0, i0) => {
          return common_vendor.e({
            a: plan.tag
          }, plan.tag ? {
            b: common_vendor.t(plan.tag)
          } : {}, {
            c: common_vendor.t(plan.name),
            d: common_vendor.t(planDurationDays(plan)),
            e: common_vendor.t(plan.price),
            f: plan.originalPrice
          }, plan.originalPrice ? {
            g: common_vendor.t(plan.originalPrice)
          } : {}, {
            h: plan.originalPrice != null && plan.originalPrice > plan.price
          }, plan.originalPrice != null && plan.originalPrice > plan.price ? {
            i: common_vendor.t(plan.originalPrice - plan.price)
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
        k: common_vendor.f(benefits, (benefit, k0, i0) => {
          return {
            a: common_vendor.t(benefit.icon),
            b: common_vendor.t(benefit.title),
            c: common_vendor.t(benefit.desc),
            d: benefit.title
          };
        }),
        l: common_vendor.t(buyButtonLabel.value),
        m: common_vendor.o(buyVip, "63")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4e921a14"]]);
wx.createPage(MiniProgramPage);
