"use strict";
require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
function apiGetMe() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.getMe);
}
function apiUpdateProfile(params) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.updateProfile, params);
}
function apiUpdateFilters(params) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.updateFilters, params);
}
function apiGetVipStatus() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.getVipStatus);
}
function apiGetRecommendations(page = 1, limit = 10) {
  {
    return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.getRecommendations, { page, limit });
  }
}
function apiGetDailyRecommendations() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.getDailyRecommendations);
}
function apiGetUserDetail(userId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.users.getUserDetail, { userId });
}
exports.apiGetDailyRecommendations = apiGetDailyRecommendations;
exports.apiGetMe = apiGetMe;
exports.apiGetRecommendations = apiGetRecommendations;
exports.apiGetUserDetail = apiGetUserDetail;
exports.apiGetVipStatus = apiGetVipStatus;
exports.apiUpdateFilters = apiUpdateFilters;
exports.apiUpdateProfile = apiUpdateProfile;
