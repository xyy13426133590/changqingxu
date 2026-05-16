"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_discover = require("../../stores/discover.js");
const utils_tabbar = require("../../utils/tabbar.js");
const utils_navigation = require("../../utils/navigation.js");
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
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    common_vendor.onShow(() => {
      utils_tabbar.safeHideNativeTabBar();
      discoverStore.repairFiltersState();
    });
    const discoverStore = stores_discover.useDiscoverStore();
    const filters = common_vendor.computed(() => discoverStore.filters);
    const ageMaxDisplay = common_vendor.computed(() => {
      const v = filters.value.ageMax;
      if (typeof v === "number" && !Number.isNaN(v))
        return Math.min(60, Math.max(18, v));
      return 35;
    });
    const zodiacOptions = [
      { value: "all", label: "不限", desc: "" },
      { value: "sanhe", label: "三合 ✨", desc: "猴鼠龙 / 蛇鸡牛 / 虎马狗 / 猪兔羊" },
      { value: "liuhe", label: "六合 🌟", desc: "鼠牛 / 虎猪 / 兔狗 / 龙鸡 / 蛇猴 / 马羊" },
      { value: "both", label: "两者皆匹配", desc: "" }
    ];
    const distanceOptions = [
      { value: "sameCity", label: "同城" },
      { value: "sameProvince", label: "同省" },
      { value: "all", label: "不限" }
    ];
    const educationOptions = ["大专及以下", "本科", "硕士及以上"];
    const incomeOptions = [...stores_discover.INCOME_FILTER_OPTIONS];
    function setZodiacMatch(value) {
      discoverStore.updateFilters({ zodiacMatch: value });
    }
    function onAgeChange(e) {
      const value = Number(e.detail.value);
      const max = Number.isFinite(value) ? Math.min(60, Math.max(18, value)) : 35;
      discoverStore.setAgeRange(18, max);
    }
    function setDistance(value) {
      discoverStore.updateFilters({ distance: value });
    }
    function setEducation(value) {
      discoverStore.setEducation(value);
    }
    function setIncome(value) {
      discoverStore.setIncomeFilter(value);
    }
    function goBack() {
      utils_navigation.navigateBackTo("/pages/discover/index");
    }
    function applyFilters() {
      return __async(this, null, function* () {
        common_vendor.index.showLoading({ mask: true, title: "应用筛选…" });
        try {
          yield discoverStore.applyFilters();
        } finally {
          common_vendor.index.hideLoading();
          common_vendor.index.switchTab({ url: "/pages/discover/index" });
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "47"),
        b: common_vendor.f(zodiacOptions, (opt, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(opt.label),
            b: opt.desc
          }, opt.desc ? {
            c: common_vendor.t(opt.desc)
          } : {}, {
            d: opt.value,
            e: filters.value.zodiacMatch === opt.value ? 1 : "",
            f: common_vendor.o(($event) => setZodiacMatch(opt.value), opt.value)
          });
        }),
        c: ageMaxDisplay.value,
        d: common_vendor.o(onAgeChange, "9e"),
        e: common_vendor.t(ageMaxDisplay.value),
        f: common_vendor.f(distanceOptions, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt.label),
            b: opt.value,
            c: filters.value.distance === opt.value ? 1 : "",
            d: common_vendor.o(($event) => setDistance(opt.value), opt.value)
          };
        }),
        g: common_vendor.f(educationOptions, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt),
            b: opt,
            c: filters.value.education === opt ? 1 : "",
            d: common_vendor.o(($event) => setEducation(opt), opt)
          };
        }),
        h: common_vendor.f(incomeOptions, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt),
            b: opt,
            c: filters.value.income === opt ? 1 : "",
            d: common_vendor.o(($event) => setIncome(opt), opt)
          };
        }),
        i: common_vendor.o(applyFilters, "38"),
        j: common_vendor.p({
          active: "filter"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5051381"]]);
wx.createPage(MiniProgramPage);
