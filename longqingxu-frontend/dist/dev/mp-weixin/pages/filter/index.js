"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_discover = require("../../stores/discover.js");
const utils_tabbar = require("../../utils/tabbar.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    common_vendor.onShow(() => {
      utils_tabbar.safeHideNativeTabBar();
    });
    const discoverStore = stores_discover.useDiscoverStore();
    const filters = common_vendor.computed(() => discoverStore.filters);
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
      const value = e.detail.value;
      discoverStore.setAgeRange(18, value);
    }
    function setDistance(value) {
      discoverStore.updateFilters({ distance: value });
    }
    function setEducation(value) {
      discoverStore.setEducation(value);
    }
    function toggleIncome(value) {
      discoverStore.toggleIncome(value);
    }
    function goBack() {
      common_vendor.index.switchTab({ url: "/pages/discover/index" });
    }
    function applyFilters() {
      discoverStore.applyFilters();
      common_vendor.index.switchTab({ url: "/pages/discover/index" });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "82"),
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
        c: filters.value.ageMax,
        d: common_vendor.o(onAgeChange, "86"),
        e: common_vendor.t(filters.value.ageMax),
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
            c: filters.value.income.includes(opt) ? 1 : "",
            d: common_vendor.o(($event) => toggleIncome(opt), opt)
          };
        }),
        i: common_vendor.o(applyFilters, "5f"),
        j: common_vendor.p({
          active: "filter"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5051381"]]);
wx.createPage(MiniProgramPage);
