"use strict";
require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
function apiLikeUser(targetUserId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.matches.like, { targetUserId });
}
function apiPassUser(targetUserId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.matches.pass, { targetUserId });
}
function apiSuperLikeUser(targetUserId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.matches.superLike, { targetUserId });
}
function apiResetSwipeHistory() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.matches.resetSwipes);
}
exports.apiLikeUser = apiLikeUser;
exports.apiPassUser = apiPassUser;
exports.apiResetSwipeHistory = apiResetSwipeHistory;
exports.apiSuperLikeUser = apiSuperLikeUser;
