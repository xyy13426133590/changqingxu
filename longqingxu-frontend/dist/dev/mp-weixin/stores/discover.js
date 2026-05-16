"use strict";
const common_vendor = require("../common/vendor.js");
const services_apiUser = require("../services/api-user.js");
const services_apiMatch = require("../services/api-match.js");
const utils_avatar = require("../utils/avatar.js");
var __defProp = Object.defineProperty;
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
const EDUCATION_FILTER_VALUES = [
  "大专及以下",
  "本科",
  "硕士及以上"
];
const DEFAULT_EDUCATION = "本科";
function normalizeEducationFilter(education) {
  const valid = new Set(EDUCATION_FILTER_VALUES);
  if (typeof education === "string" && valid.has(education)) {
    return education;
  }
  if (Array.isArray(education)) {
    for (const item of education) {
      if (typeof item === "string" && valid.has(item)) {
        return item;
      }
    }
  }
  return DEFAULT_EDUCATION;
}
const INCOME_FILTER_OPTIONS = [
  "5万及以下",
  "5万-10万",
  "10万-20万",
  "20万-30万",
  "30万-50万",
  "50万以上"
];
const DEFAULT_INCOME = "10万-20万";
function normalizeIncomeFilter(income) {
  const valid = /* @__PURE__ */ new Set([...INCOME_FILTER_OPTIONS]);
  if (typeof income === "string" && valid.has(income)) {
    return income;
  }
  if (Array.isArray(income)) {
    for (const x of income) {
      if (typeof x === "string" && valid.has(x)) {
        return x;
      }
    }
  }
  return DEFAULT_INCOME;
}
function mapApiCard(c) {
  var _a, _b;
  const g = c.gender === "male" ? "male" : "female";
  return {
    id: c.id,
    nickname: c.nickname,
    avatar: utils_avatar.resolveAvatar(c.avatar, c.id),
    age: (_a = c.age) != null ? _a : 0,
    gender: g,
    location: c.location || "",
    height: c.height,
    zodiac: c.zodiac || "",
    zodiacSign: c.zodiacSign || "",
    mbti: c.mbti || "",
    riyuan: c.riyuan || "",
    education: c.education || "",
    occupation: c.occupation || "",
    income: c.income || "",
    matchScore: (_b = c.matchScore) != null ? _b : 0,
    matchReason: c.matchReason || "",
    matchTagline: c.matchTagline || "",
    isRealName: !!c.isRealName,
    isVip: !!c.isVip,
    bio: c.bio || "",
    photos: []
  };
}
function repairFilters(f) {
  if (typeof f.ageMin !== "number" || Number.isNaN(f.ageMin))
    f.ageMin = 18;
  if (typeof f.ageMax !== "number" || Number.isNaN(f.ageMax))
    f.ageMax = 35;
  if (f.ageMax < f.ageMin)
    f.ageMax = f.ageMin;
  f.education = normalizeEducationFilter(f.education);
  f.income = normalizeIncomeFilter(f.income);
  if (f.distance !== "sameCity" && f.distance !== "sameProvince" && f.distance !== "all") {
    f.distance = "sameCity";
  }
  if (f.zodiacMatch !== "all" && f.zodiacMatch !== "sanhe" && f.zodiacMatch !== "liuhe" && f.zodiacMatch !== "both") {
    f.zodiacMatch = "all";
  }
}
function buildFilterPayload(f) {
  repairFilters(f);
  let zodiacMatch;
  switch (f.zodiacMatch) {
    case "sanhe":
      zodiacMatch = ["三合"];
      break;
    case "liuhe":
      zodiacMatch = ["六合"];
      break;
    case "both":
      zodiacMatch = ["三合", "六合"];
      break;
    default:
      zodiacMatch = void 0;
  }
  let distance;
  if (f.distance === "sameCity")
    distance = 50;
  else if (f.distance === "sameProvince")
    distance = 200;
  else
    distance = void 0;
  return {
    ageRange: { min: f.ageMin, max: f.ageMax },
    education: [f.education],
    incomeRange: f.income != null ? { min: f.income, max: f.income } : void 0,
    zodiacMatch,
    distance
  };
}
const useDiscoverStore = common_vendor.defineStore("discover", () => {
  const users = common_vendor.ref([]);
  const currentIndex = common_vendor.ref(0);
  const filters = common_vendor.ref({
    zodiacMatch: "all",
    ageMin: 18,
    ageMax: 35,
    distance: "sameCity",
    education: DEFAULT_EDUCATION,
    income: DEFAULT_INCOME
  });
  const dailyRecommendations = common_vendor.ref([]);
  const currentUser = common_vendor.computed(() => users.value[currentIndex.value]);
  const hasMore = common_vendor.computed(() => currentIndex.value < users.value.length - 1);
  const loadError = common_vendor.ref(null);
  const recommendationsRecycled = common_vendor.ref(false);
  function fetchRecommendations() {
    return __async(this, null, function* () {
      try {
        const { users: list, recycled } = yield services_apiUser.apiGetRecommendations(1, 50);
        users.value = (list != null ? list : []).map(mapApiCard);
        recommendationsRecycled.value = !!recycled;
        loadError.value = null;
        currentIndex.value = 0;
        return users.value.length > 0;
      } catch (e) {
        users.value = [];
        loadError.value = e instanceof Error ? e.message : "推荐列表加载失败";
        currentIndex.value = 0;
        return false;
      }
    });
  }
  function fetchDailyRecommendations() {
    return __async(this, null, function* () {
      try {
        const { users: list } = yield services_apiUser.apiGetDailyRecommendations();
        dailyRecommendations.value = (list != null ? list : []).map(mapApiCard);
        return dailyRecommendations.value.length > 0;
      } catch (e) {
        dailyRecommendations.value = [];
        return false;
      }
    });
  }
  function resetAndReloadDiscover() {
    return __async(this, null, function* () {
      try {
        yield services_apiMatch.apiResetSwipeHistory();
      } catch (e) {
        return false;
      }
      recommendationsRecycled.value = false;
      yield loadDiscoverPage();
      return users.value.length > 0;
    });
  }
  function loadDiscoverPage() {
    return __async(this, null, function* () {
      repairFilters(filters.value);
      yield Promise.all([fetchRecommendations(), fetchDailyRecommendations()]);
    });
  }
  function nextUser() {
    if (hasMore.value) {
      currentIndex.value++;
      return;
    }
    void fetchRecommendations();
  }
  function likeUser(userId) {
    return __async(this, null, function* () {
      try {
        yield services_apiMatch.apiLikeUser(userId);
        nextUser();
      } catch (e) {
      }
    });
  }
  function dislikeUser(userId) {
    return __async(this, null, function* () {
      try {
        yield services_apiMatch.apiPassUser(userId);
        nextUser();
      } catch (e) {
      }
    });
  }
  function superLikeUser(userId) {
    return __async(this, null, function* () {
      try {
        yield services_apiMatch.apiSuperLikeUser(userId);
        nextUser();
      } catch (e) {
      }
    });
  }
  function updateFilters(newFilters) {
    filters.value = __spreadValues(__spreadValues({}, filters.value), newFilters);
  }
  function setAgeRange(min, max) {
    filters.value.ageMin = min;
    filters.value.ageMax = max;
  }
  function setEducation(value) {
    filters.value.education = value;
  }
  function setIncomeFilter(value) {
    const valid = /* @__PURE__ */ new Set([...INCOME_FILTER_OPTIONS]);
    if (valid.has(value)) {
      filters.value.income = value;
    }
  }
  function resetFilters() {
    filters.value = {
      zodiacMatch: "all",
      ageMin: 18,
      ageMax: 35,
      distance: "sameCity",
      education: DEFAULT_EDUCATION,
      income: DEFAULT_INCOME
    };
  }
  function applyFilters() {
    return __async(this, null, function* () {
      try {
        yield services_apiUser.apiUpdateFilters(buildFilterPayload(filters.value));
      } catch (e) {
      }
      currentIndex.value = 0;
      yield fetchRecommendations();
    });
  }
  function generateDailyRecommendations() {
    return __async(this, null, function* () {
      yield fetchDailyRecommendations();
    });
  }
  function reset() {
    currentIndex.value = 0;
  }
  function clearDiscoverData() {
    users.value = [];
    dailyRecommendations.value = [];
    currentIndex.value = 0;
    loadError.value = null;
    recommendationsRecycled.value = false;
  }
  function repairFiltersState() {
    repairFilters(filters.value);
  }
  return {
    users,
    currentIndex,
    currentUser,
    hasMore,
    filters,
    dailyRecommendations,
    loadError,
    recommendationsRecycled,
    resetAndReloadDiscover,
    fetchRecommendations,
    fetchDailyRecommendations,
    loadDiscoverPage,
    nextUser,
    likeUser,
    dislikeUser,
    superLikeUser,
    updateFilters,
    setAgeRange,
    setEducation,
    setIncomeFilter,
    resetFilters,
    applyFilters,
    generateDailyRecommendations,
    reset,
    clearDiscoverData,
    repairFiltersState
  };
}, {
  persist: {
    key: "discover-store",
    paths: ["filters"],
    afterRestore: ({ store }) => {
      repairFilters(store.filters);
    }
  }
});
exports.INCOME_FILTER_OPTIONS = INCOME_FILTER_OPTIONS;
exports.useDiscoverStore = useDiscoverStore;
