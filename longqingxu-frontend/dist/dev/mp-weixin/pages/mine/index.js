"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_tabbar = require("../../utils/tabbar.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const defaultAvatar = utils_avatar.DEMO_AVATARS[0];
    const guestAvatarSrc = utils_avatar.DEMO_AVATARS[1];
    common_vendor.onShow(() => {
      utils_tabbar.safeHideNativeTabBar();
      void userStore.hydrateProfile();
    });
    const userStore = stores_user.useUserStore();
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/auth/welcome" });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    function goRealName() {
      common_vendor.index.navigateTo({ url: "/pages/auth/real-name" });
    }
    function goFaceVerify() {
      if (!userStore.profile.isRealName) {
        common_vendor.index.showModal({
          title: "提示",
          content: "建议先完成实名认证，再进行人脸核验。演示环境也可跳过证件仅体验人脸页。",
          confirmText: "去实名",
          cancelText: "仅演示人脸",
          success(res) {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/auth/real-name" });
            } else {
              common_vendor.index.navigateTo({ url: "/pages/auth/face-verify?onlyFace=1" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/auth/face-verify" });
    }
    function navigateTo(page) {
      common_vendor.index.navigateTo({ url: `/pages/mine/${page}` });
    }
    function navigateToDiscover() {
      common_vendor.index.switchTab({ url: "/pages/discover/index" });
    }
    function onLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        success(res) {
          if (res.confirm)
            userStore.logout();
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(userStore).isLogin
      }, !common_vendor.unref(userStore).isLogin ? {
        b: common_vendor.unref(guestAvatarSrc),
        c: common_vendor.o(goLogin, "9b"),
        d: common_vendor.o(goRegister, "05")
      } : common_vendor.e({
        e: common_vendor.unref(userStore).profile.avatar || common_vendor.unref(defaultAvatar),
        f: common_vendor.t(common_vendor.unref(userStore).profile.nickname || "我"),
        g: common_vendor.o(($event) => navigateTo("profile-edit"), "f5"),
        h: common_vendor.o(($event) => navigateTo("my-card"), "4d"),
        i: common_vendor.o(($event) => navigateTo("vip-center"), "dc"),
        j: common_vendor.unref(userStore).profile.isRealName
      }, common_vendor.unref(userStore).profile.isRealName ? {} : {}, {
        k: common_vendor.o(goRealName, "33"),
        l: common_vendor.unref(userStore).profile.isFaceVerified
      }, common_vendor.unref(userStore).profile.isFaceVerified ? {} : {}, {
        m: common_vendor.o(goFaceVerify, "6c"),
        n: common_vendor.o(navigateToDiscover, "24"),
        o: common_vendor.o(onLogout, "06")
      }), {
        p: common_vendor.o(navigateToDiscover, "ab"),
        q: common_vendor.p({
          active: "mine"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9023ef44"]]);
wx.createPage(MiniProgramPage);
