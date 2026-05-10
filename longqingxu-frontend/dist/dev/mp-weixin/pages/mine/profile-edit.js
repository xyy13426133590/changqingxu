"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_date = require("../../utils/date.js");
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
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile-edit",
  setup(__props) {
    var _a, _b;
    function getZodiacEmojiSafe(zodiac) {
      return utils_date.getZodiacEmoji(zodiac);
    }
    const userStore = stores_user.useUserStore();
    const formData = common_vendor.reactive({
      avatar: userStore.profile.avatar || utils_avatar.avatarUrl(),
      nickname: userStore.profile.nickname || "",
      gender: userStore.profile.gender || "",
      birthday: userStore.profile.birthday || "",
      height: ((_a = userStore.profile.height) == null ? void 0 : _a.toString()) || "",
      weight: ((_b = userStore.profile.weight) == null ? void 0 : _b.toString()) || "",
      hometown: userStore.profile.hometown || "",
      location: userStore.profile.location || "",
      riyuan: userStore.profile.riyuan || "",
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
          mbti: userStore.profile.mbti || "INFP"
        };
      }
      const birthDate = new Date(formData.birthday);
      const info = utils_date.getBirthInfo(birthDate);
      return {
        zodiac: info.zodiac,
        zodiacSign: info.zodiacSign,
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
    const riyuanOptions = ["暂不填写", "甲木 🌲", "乙木 🌿", "丙火 🔥", "丁火 🕯️", "戊土 ⛰️", "己土 🌾", "庚金 ⚔️", "辛金 💎", "壬水 🌊", "癸水 💧"];
    const riyuanIndex = common_vendor.computed(() => {
      const map = { "甲木": 1, "乙木": 2, "丙火": 3, "丁火": 4, "戊土": 5, "己土": 6, "庚金": 7, "辛金": 8, "壬水": 9, "癸水": 10 };
      return map[formData.riyuan || ""] || 0;
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
    function onRiyuanChange(e) {
      const map = ["", "甲木", "乙木", "丙火", "丁火", "戊土", "己土", "庚金", "辛金", "壬水", "癸水"];
      formData.riyuan = map[e.detail.value];
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
        success: (res) => {
          formData.avatar = res.tempFilePaths[0];
        }
      });
    }
    function saveProfile() {
      userStore.updateProfile(__spreadProps(__spreadValues({}, formData), {
        zodiac: autoInfo.value.zodiac,
        zodiacSign: autoInfo.value.zodiacSign,
        mbti: autoInfo.value.mbti
      }));
      common_vendor.index.switchTab({ url: "/pages/discover/index" });
    }
    function goBack() {
      common_vendor.index.navigateBack({
        fail: () => common_vendor.index.switchTab({ url: "/pages/mine/index" })
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack, "78"),
        b: formData.avatar,
        c: common_vendor.o(uploadAvatar, "1c"),
        d: formData.nickname,
        e: common_vendor.o(($event) => formData.nickname = $event.detail.value, "58"),
        f: common_vendor.t(genderLabel.value),
        g: genderOptions,
        h: genderIndex.value,
        i: common_vendor.o(onGenderChange, "1f"),
        j: common_vendor.t(formData.birthday || "生日"),
        k: formData.birthday,
        l: common_vendor.o(onBirthdayChange, "62"),
        m: formData.height,
        n: common_vendor.o(($event) => formData.height = $event.detail.value, "1d"),
        o: formData.weight,
        p: common_vendor.o(($event) => formData.weight = $event.detail.value, "ba"),
        q: common_vendor.t(formData.hometown || "籍贯（省市区）"),
        r: common_vendor.o(onHometownChange, "61"),
        s: common_vendor.t(formData.location || "现居地（省市区）"),
        t: common_vendor.o(onLocationChange, "e2"),
        v: common_vendor.t(getZodiacEmojiSafe(autoInfo.value.zodiac)),
        w: common_vendor.t(autoInfo.value.zodiac),
        x: common_vendor.t(common_vendor.unref(utils_date.getZodiacSignSymbol)(autoInfo.value.zodiacSign)),
        y: common_vendor.t(autoInfo.value.zodiacSign),
        z: common_vendor.t(autoInfo.value.mbti),
        A: common_vendor.t(formData.riyuan || "日元（暂不填写）"),
        B: riyuanOptions,
        C: riyuanIndex.value,
        D: common_vendor.o(onRiyuanChange, "51"),
        E: common_vendor.t(formData.education || "学历"),
        F: educationOptions,
        G: educationIndex.value,
        H: common_vendor.o(onEducationChange, "2e"),
        I: formData.schoolTier === "985"
      }, formData.schoolTier === "985" ? {} : {}, {
        J: formData.schoolTier === "211"
      }, formData.schoolTier === "211" ? {} : {}, {
        K: common_vendor.o([($event) => formData.school = $event.detail.value, onSchoolInput], "ce"),
        L: formData.school,
        M: common_vendor.t(formData.occupation || "职业"),
        N: occupationOptions,
        O: occupationIndex.value,
        P: common_vendor.o(onOccupationChange, "17"),
        Q: common_vendor.t(formData.jobLevel || "职级（可选）"),
        R: jobLevelOptions,
        S: jobLevelIndex.value,
        T: common_vendor.o(onJobLevelChange, "c1"),
        U: formData.company,
        V: common_vendor.o(($event) => formData.company = $event.detail.value, "88"),
        W: common_vendor.t(formData.income || "年收入"),
        X: incomeOptions,
        Y: incomeIndex.value,
        Z: common_vendor.o(onIncomeChange, "f7"),
        aa: common_vendor.f(hobbyOptions, (hobby, k0, i0) => {
          return {
            a: common_vendor.t(hobby),
            b: hobby,
            c: formData.hobbies.includes(hobby) ? 1 : "",
            d: common_vendor.o(($event) => toggleHobby(hobby), hobby)
          };
        }),
        ab: formData.bio,
        ac: common_vendor.o(($event) => formData.bio = $event.detail.value, "dc"),
        ad: common_vendor.t(formData.bio.length),
        ae: common_vendor.o(saveProfile, "25")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-628663fb"]]);
wx.createPage(MiniProgramPage);
