"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_date = require("../../utils/date.js");
const services_apiUser = require("../../services/api-user.js");
const services_apiUpload = require("../../services/api-upload.js");
const utils_navigation = require("../../utils/navigation.js");
const utils_safeArea = require("../../utils/safe-area.js");
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
  __name: "profile-edit",
  setup(__props) {
    var _a, _b;
    const capsuleNavOuterStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavOuterStyle());
    const capsuleNavRowStyle = common_vendor.computed(() => utils_safeArea.getCapsuleNavRowStyle());
    function getZodiacEmojiSafe(zodiac) {
      return utils_date.getZodiacEmoji(zodiac);
    }
    function getRiyuanEmojiSafe(riyuan) {
      return utils_date.getRiyuanEmoji(riyuan || "") || "💧";
    }
    const userStore = stores_user.useUserStore();
    const formData = common_vendor.reactive({
      avatar: userStore.profile.avatar || utils_avatar.DEMO_AVATARS[0],
      nickname: userStore.profile.nickname || "",
      gender: userStore.profile.gender || "",
      birthday: userStore.profile.birthday || "",
      height: ((_a = userStore.profile.height) == null ? void 0 : _a.toString()) || "",
      weight: ((_b = userStore.profile.weight) == null ? void 0 : _b.toString()) || "",
      hometown: userStore.profile.hometown || "",
      location: userStore.profile.location || "",
      education: userStore.profile.education || "",
      school: userStore.profile.school || "",
      schoolTier: userStore.profile.schoolTier || null,
      occupation: userStore.profile.occupation || "",
      jobLevel: userStore.profile.jobLevel || "",
      company: userStore.profile.company || "",
      income: userStore.profile.income || "",
      bio: userStore.profile.bio || "",
      hobbies: userStore.profile.hobbies || []
    });
    const autoInfo = common_vendor.computed(() => {
      if (!formData.birthday) {
        return {
          zodiac: userStore.profile.zodiac || "兔",
          zodiacSign: userStore.profile.zodiacSign || "天秤座",
          riyuan: userStore.profile.riyuan || "甲木",
          mbti: userStore.profile.mbti || "INFP"
        };
      }
      const birthDate = new Date(formData.birthday);
      const info = utils_date.getBirthInfo(birthDate);
      return {
        zodiac: info.zodiac,
        zodiacSign: info.zodiacSign,
        riyuan: info.riyuan,
        mbti: info.mbti
      };
    });
    const genderOptions = ["男", "女"];
    const genderIndex = common_vendor.computed(() => {
      if (formData.gender === "male")
        return 0;
      if (formData.gender === "female")
        return 1;
      return 0;
    });
    const genderLabel = common_vendor.computed(() => {
      if (formData.gender === "male")
        return "男";
      if (formData.gender === "female")
        return "女";
      return "性别";
    });
    const educationOptions = ["大专及以下", "本科", "硕士及以上"];
    const educationIndex = common_vendor.computed(() => educationOptions.indexOf(formData.education));
    const occupationOptions = ["IT互联网", "金融", "教育", "医疗", "制造业", "服务业", "公务员", "自由职业", "其他"];
    const occupationIndex = common_vendor.computed(() => occupationOptions.indexOf(formData.occupation));
    const jobLevelOptions = ["一线 / 执行", "骨干 / 资深", "主管 / 组长", "经理 / 中级管理", "总监及以上 / 高管", "创始人 / 合伙人", "自由职业 / 其他"];
    const jobLevelIndex = common_vendor.computed(() => jobLevelOptions.indexOf(formData.jobLevel));
    const incomeOptions = ["5万及以下", "5万-10万", "10万-20万", "20万-30万", "30万-50万", "50万以上"];
    const incomeIndex = common_vendor.computed(() => incomeOptions.indexOf(formData.income));
    const hobbyOptions = ["旅行", "美食", "摄影", "运动", "阅读", "音乐", "电影", "游戏"];
    const tier985Schools = ["清华", "北大", "复旦", "上交", "浙大", "南大", "中科大", "人大", "北航", "同济"];
    const tier211Schools = ["北工大", "北邮", "北交", "北科", "北化", "北林", "北中医", "对外经贸", "中财", "上财"];
    function onGenderChange(e) {
      formData.gender = e.detail.value === 0 ? "male" : "female";
    }
    function onBirthdayChange(e) {
      formData.birthday = e.detail.value;
    }
    function onHometownChange(e) {
      formData.hometown = e.detail.value.join(" ");
    }
    function onLocationChange(e) {
      formData.location = e.detail.value.join(" ");
    }
    function onEducationChange(e) {
      formData.education = educationOptions[e.detail.value];
    }
    function onSchoolInput() {
      const input = formData.school.toLowerCase();
      formData.schoolTier = null;
      for (const school of tier985Schools) {
        if (input.includes(school)) {
          formData.schoolTier = "985";
          return;
        }
      }
      for (const school of tier211Schools) {
        if (input.includes(school)) {
          formData.schoolTier = "211";
          return;
        }
      }
    }
    function onOccupationChange(e) {
      formData.occupation = occupationOptions[e.detail.value];
    }
    function onJobLevelChange(e) {
      formData.jobLevel = jobLevelOptions[e.detail.value];
    }
    function onIncomeChange(e) {
      formData.income = incomeOptions[e.detail.value];
    }
    function toggleHobby(hobby) {
      const index = formData.hobbies.indexOf(hobby);
      if (index > -1) {
        formData.hobbies.splice(index, 1);
      } else {
        formData.hobbies.push(hobby);
      }
    }
    function uploadAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => __async(this, null, function* () {
          const tempPath = res.tempFilePaths[0];
          formData.avatar = tempPath;
          common_vendor.index.showLoading({ title: "上传中", mask: true });
          try {
            const { url } = yield services_apiUpload.apiUploadAvatar(tempPath);
            formData.avatar = url;
          } catch (e) {
            common_vendor.index.showToast({ title: "头像上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        })
      });
    }
    common_vendor.onMounted(() => __async(this, null, function* () {
      var _a2, _b2, _c;
      yield userStore.hydrateProfile();
      const p = userStore.profile;
      formData.avatar = p.avatar || formData.avatar;
      formData.nickname = p.nickname || "";
      formData.gender = p.gender || "";
      formData.birthday = p.birthday || "";
      formData.height = ((_a2 = p.height) == null ? void 0 : _a2.toString()) || "";
      formData.weight = ((_b2 = p.weight) == null ? void 0 : _b2.toString()) || "";
      formData.hometown = p.hometown || "";
      formData.location = p.location || "";
      formData.education = p.education || "";
      formData.school = p.school || "";
      formData.schoolTier = (_c = p.schoolTier) != null ? _c : null;
      formData.occupation = p.occupation || "";
      formData.jobLevel = p.jobLevel || "";
      formData.company = p.company || "";
      formData.income = p.income || "";
      formData.bio = p.bio || "";
      formData.hobbies = p.hobbies || [];
    }));
    function saveProfile() {
      return __async(this, null, function* () {
        var _a2;
        const gh = Number.parseInt(formData.height, 10);
        const gw = Number.parseInt(formData.weight, 10);
        const gd = formData.gender === "male" ? "male" : formData.gender === "female" ? "female" : "unknown";
        common_vendor.index.showLoading({ title: "保存中", mask: true });
        try {
          const av = formData.avatar;
          const avatarPayload = av.startsWith("http") || av.startsWith("cloud://") ? av : void 0;
          yield services_apiUser.apiUpdateProfile(__spreadProps(__spreadValues({}, avatarPayload ? { avatar: avatarPayload } : {}), {
            nickname: formData.nickname,
            gender: gd,
            birthday: formData.birthday || void 0,
            height: Number.isFinite(gh) ? gh : void 0,
            weight: Number.isFinite(gw) ? gw : void 0,
            hometown: formData.hometown || void 0,
            location: formData.location || void 0,
            education: formData.education || void 0,
            school: formData.school || void 0,
            schoolTier: formData.schoolTier,
            occupation: formData.occupation || void 0,
            jobLevel: formData.jobLevel || void 0,
            company: formData.company || void 0,
            income: formData.income || void 0,
            bio: formData.bio || void 0,
            hobbies: ((_a2 = formData.hobbies) == null ? void 0 : _a2.length) ? formData.hobbies : void 0
          }));
          yield userStore.hydrateProfile();
          userStore.updateProfile(__spreadProps(__spreadValues({}, formData), {
            zodiac: autoInfo.value.zodiac,
            zodiacSign: autoInfo.value.zodiacSign,
            riyuan: autoInfo.value.riyuan,
            mbti: autoInfo.value.mbti
          }));
          common_vendor.index.switchTab({ url: "/pages/discover/index" });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "保存失败";
          common_vendor.index.showToast({ title: msg, icon: "none" });
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
        a: common_vendor.o(goBack, "d7"),
        b: common_vendor.s(capsuleNavRowStyle.value),
        c: common_vendor.s(capsuleNavOuterStyle.value),
        d: formData.avatar,
        e: common_vendor.o(uploadAvatar, "86"),
        f: formData.nickname,
        g: common_vendor.o(($event) => formData.nickname = $event.detail.value, "a7"),
        h: common_vendor.t(genderLabel.value),
        i: genderOptions,
        j: genderIndex.value,
        k: common_vendor.o(onGenderChange, "4e"),
        l: common_vendor.t(formData.birthday || "生日"),
        m: formData.birthday,
        n: common_vendor.o(onBirthdayChange, "36"),
        o: formData.height,
        p: common_vendor.o(($event) => formData.height = $event.detail.value, "37"),
        q: formData.weight,
        r: common_vendor.o(($event) => formData.weight = $event.detail.value, "42"),
        s: common_vendor.t(formData.hometown || "籍贯（省市区）"),
        t: common_vendor.o(onHometownChange, "fb"),
        v: common_vendor.t(formData.location || "现居地（省市区）"),
        w: common_vendor.o(onLocationChange, "d6"),
        x: common_vendor.t(getZodiacEmojiSafe(autoInfo.value.zodiac)),
        y: common_vendor.t(autoInfo.value.zodiac),
        z: common_vendor.t(common_vendor.unref(utils_date.getZodiacSignSymbol)(autoInfo.value.zodiacSign)),
        A: common_vendor.t(autoInfo.value.zodiacSign),
        B: common_vendor.t(getRiyuanEmojiSafe(autoInfo.value.riyuan)),
        C: common_vendor.t(autoInfo.value.riyuan),
        D: common_vendor.t(autoInfo.value.mbti),
        E: common_vendor.t(formData.education || "学历"),
        F: educationOptions,
        G: educationIndex.value,
        H: common_vendor.o(onEducationChange, "39"),
        I: formData.schoolTier === "985"
      }, formData.schoolTier === "985" ? {} : {}, {
        J: formData.schoolTier === "211"
      }, formData.schoolTier === "211" ? {} : {}, {
        K: common_vendor.o([($event) => formData.school = $event.detail.value, onSchoolInput], "ce"),
        L: formData.school,
        M: common_vendor.t(formData.occupation || "职业"),
        N: occupationOptions,
        O: occupationIndex.value,
        P: common_vendor.o(onOccupationChange, "aa"),
        Q: common_vendor.t(formData.jobLevel || "职级（可选）"),
        R: jobLevelOptions,
        S: jobLevelIndex.value,
        T: common_vendor.o(onJobLevelChange, "03"),
        U: formData.company,
        V: common_vendor.o(($event) => formData.company = $event.detail.value, "a6"),
        W: common_vendor.t(formData.income || "年收入"),
        X: incomeOptions,
        Y: incomeIndex.value,
        Z: common_vendor.o(onIncomeChange, "ef"),
        aa: common_vendor.f(hobbyOptions, (hobby, k0, i0) => {
          return {
            a: common_vendor.t(hobby),
            b: hobby,
            c: formData.hobbies.includes(hobby) ? 1 : "",
            d: common_vendor.o(($event) => toggleHobby(hobby), hobby)
          };
        }),
        ab: formData.bio,
        ac: common_vendor.o(($event) => formData.bio = $event.detail.value, "44"),
        ad: common_vendor.t(formData.bio.length),
        ae: common_vendor.o(saveProfile, "42")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-628663fb"]]);
wx.createPage(MiniProgramPage);
