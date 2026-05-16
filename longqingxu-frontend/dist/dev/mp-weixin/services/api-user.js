"use strict";
const services_api = require("./api.js");
function apiGetMe() {
  return services_api.get("/users/me");
}
function apiUpdateProfile(params) {
  return services_api.put("/users/me", params);
}
function apiUpdateFilters(params) {
  return services_api.put("/users/me/filters", params);
}
function apiGetVipStatus() {
  return services_api.get("/users/me/vip");
}
function apiGetRecommendations(page = 1, limit = 10) {
  return services_api.get(
    "/users/recommendations",
    { page, limit }
  );
}
function apiGetDailyRecommendations() {
  return services_api.get("/users/daily");
}
function apiGetUserDetail(userId) {
  return services_api.get(`/users/${userId}`);
}
exports.apiGetDailyRecommendations = apiGetDailyRecommendations;
exports.apiGetMe = apiGetMe;
exports.apiGetRecommendations = apiGetRecommendations;
exports.apiGetUserDetail = apiGetUserDetail;
exports.apiGetVipStatus = apiGetVipStatus;
exports.apiUpdateFilters = apiUpdateFilters;
exports.apiUpdateProfile = apiUpdateProfile;
