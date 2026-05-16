"use strict";
const services_api = require("./api.js");
function apiLikeUser(targetUserId) {
  return services_api.post("/matches/like", { targetUserId });
}
function apiPassUser(targetUserId) {
  return services_api.post("/matches/pass", { targetUserId });
}
function apiSuperLikeUser(targetUserId) {
  return services_api.post("/matches/super-like", { targetUserId });
}
function apiResetSwipeHistory() {
  return services_api.post("/matches/reset-swipes", {});
}
exports.apiLikeUser = apiLikeUser;
exports.apiPassUser = apiPassUser;
exports.apiResetSwipeHistory = apiResetSwipeHistory;
exports.apiSuperLikeUser = apiSuperLikeUser;
