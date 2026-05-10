"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/discover/index.js";
  "./pages/filter/index.js";
  "./pages/messages/index.js";
  "./pages/messages/chat.js";
  "./pages/mine/index.js";
  "./pages/mine/profile-edit.js";
  "./pages/mine/my-card.js";
  "./pages/mine/vip-center.js";
  "./pages/user/detail.js";
  "./pages/auth/welcome.js";
  "./pages/auth/login.js";
  "./pages/auth/register.js";
  "./pages/auth/real-name.js";
  "./pages/auth/face-verify.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      console.log("App Launch");
      const userStore = stores_user.useUserStore();
      userStore.init();
    });
    common_vendor.onShow(() => {
      console.log("App Show");
    });
    common_vendor.onHide(() => {
      console.log("App Hide");
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  pinia.use(common_vendor.src_default);
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
